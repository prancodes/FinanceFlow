import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import { User } from "../models/User.model.js";
import { Account } from "../models/Account.model.js";
import { Budget } from "../models/Budget.model.js";
import { Transaction } from "../models/Transaction.model.js";
import CustomError from "../utils/CustomError.js";
import mongoose from "mongoose";
import session from "express-session";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Render the Create Account form
router.get("/addAccount", isLoggedIn, (req, res) => {
  res.redirect("/dashboard/addAccount");
});

// Display dashboard with user info and accounts
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) throw new CustomError(401, "User not authenticated");

    const user = await User.findById(userId).populate("accounts");
    if (!user) throw new CustomError(404, "User not found");

    res.json({
      name: user.name,
      accounts: user.accounts.reverse().map((account) => ({
        ...account.toObject(),
        balance: parseFloat(account.balance.toString()),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Render selected account details
router.get("/:accountId", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) throw new CustomError(401, "User not authenticated");

    const { accountId } = req.params;
    const account = await Account.findOne({
      _id: accountId,
      user: userId,
    }).populate("transactions");
    if (!account)
      throw new CustomError(404, "Account not found or access denied.");

    res.json({
      ...account.toObject(),
      initialBalance: parseFloat(account.initialBalance.toString()),
      balance: parseFloat(account.balance.toString()),
      transactions: account.transactions.reverse().map((txn) => ({
        ...txn.toObject(),
        amount: parseFloat(txn.amount.toString()),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Create new account
router.post("/addAccount", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) throw new CustomError(401, "User not authenticated.");

    const { name, type, balance } = req.body.account;
    if (!["Current", "Savings"].includes(type))
      throw new CustomError(400, "Invalid account type.");

    const newAccount = new Account({
      name,
      type,
      initialBalance: mongoose.Types.Decimal128.fromString(balance.toString()),
      balance: mongoose.Types.Decimal128.fromString(balance.toString()),
      user: userId,
    });

    await newAccount.save();
    await User.findByIdAndUpdate(userId, {
      $push: { accounts: newAccount._id },
    });

    res.status(201).json(newAccount);
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete("/:accountId", isLoggedIn, async (req, res, next) => {
  const { accountId } = req.params;
  const userId = req.session.userId;

  if (!userId) return next(new CustomError(401, "User not authenticated"));

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const account = await Account.findById(accountId).session(session);
    if (!account) throw new CustomError(404, "Account not found");

    const user = await User.findById(userId).session(session);
    if (!user) throw new CustomError(404, "User not found");

    const budget = await Budget.findOne({ user: userId }).session(session);
    if (!budget) throw new CustomError(404, "Budget not found");

    await Transaction.deleteMany({ account: accountId }).session(session);

    const accountBalance = parseFloat(account.balance.toString());
    if (accountBalance > 0) {
      budget.currentBalance = mongoose.Types.Decimal128.fromString(
        (
          parseFloat(budget.currentBalance.toString()) - accountBalance
        ).toString()
      );
      budget.amount = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.amount.toString()) - accountBalance).toString()
      );
    }

    await budget.save({ session });
    user.accounts.pull(accountId);
    await user.save({ session });
    await Account.findByIdAndDelete(accountId).session(session);

    await session.commitTransaction();
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    next(new CustomError(500, "Failed to delete account"));
  } finally {
    session.endSession();
  }
});

// Chatbot route
router.post("/:accountId/chat", isLoggedIn, async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const userId = req.session.userId;
    if (!userId) throw new CustomError(401, "User not authenticated");

    const { message } = req.body;
    if (!message)
      return res.json({ success: false, reply: "No message provided." });

    const account = await Account.findOne({
      _id: accountId,
      user: userId,
    }).populate("transactions");
    if (!account)
      throw new CustomError(404, "Account not found or access denied.");

    const groupedTransactions = {};
    for (const txn of account.transactions) {
      const category = txn.category || "Uncategorized";
      if (!groupedTransactions[category]) groupedTransactions[category] = [];
      groupedTransactions[category].push({
        date: txn.date.toISOString().split("T")[0],
        type: txn.type,
        amount: parseFloat(txn.amount.toString()),
        description: txn.description,
        isRecurring: txn.isRecurring || false,
        recurringInterval: txn.recurringInterval || null,
        nextRecurringDate: txn.nextRecurringDate
          ? txn.nextRecurringDate.toISOString().split("T")[0]
          : null,
        lastProcessed: txn.lastProcessed
          ? txn.lastProcessed.toISOString().split("T")[0]
          : null,
      });
    }

    let transactionSummary = "";
    for (const [category, txns] of Object.entries(groupedTransactions)) {
      transactionSummary += `\n\nCategory: ${category}\n`;
      txns.forEach((txn, i) => {
        transactionSummary += `  ${i + 1}. ${txn.date} - ${
          txn.type
        } ₹${txn.amount.toFixed(2)} - ${txn.description}`;
        if (txn.isRecurring) {
          transactionSummary += ` (Recurring every ${txn.recurringInterval}, Next: ${txn.nextRecurringDate})`;
        }
        transactionSummary += `\n`;
      });
    }

    let needsBulletPoints =
      /bullet\s*points|list|points|short tips|brief tips|save money|how to save|tips for saving|steps to/i.test(
        message
      );

    let prompt = `
You are a highly professional and helpful financial assistant. You analyze financial account data and answer only finance-related questions using proper grammar, clear formatting, and relevant insights.

❗ Rules:
- Only answer if the question is about money, budgeting, transactions, savings, or personal finance.
- If the question is unrelated (e.g., "anime name", "I need a home"), respond clearly with:
  "I'm here to assist only with finance-related questions."
- Do NOT respond with emojis, slang, or overly casual tone.

🧾 Account Overview:
- Account Name: ${account.name}
- Account Type: ${account.type}
- Current Balance: ₹${parseFloat(account.balance.toString()).toFixed(2)}
- Initial Balance: ₹${parseFloat(account.initialBalance.toString()).toFixed(2)}

📊 Transactions by Category:
${transactionSummary}

🔍 User Question:
"${message}"

✍️ Format your response according to the user request.
${
  needsBulletPoints
    ? "Respond ONLY in short, clear bullet points using markdown (e.g., - or *). Do NOT write paragraphs."
    : "Respond clearly in full sentences. Use paragraphs or lists only if appropriate."
}
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    res.json({ success: true, reply: responseText });
  } catch (error) {
    next(error);
  }
});

export default router;
