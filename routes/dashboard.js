import express from 'express';
import isLoggedIn from '../middleware/isLoggedIn.js';
import { User } from '../models/User.model.js';
import { Account } from '../models/Account.model.js';
import { Budget } from '../models/Budget.model.js';
import { Transaction } from '../models/Transaction.model.js';
import CustomError from '../utils/CustomError.js';
import mongoose from 'mongoose';
import session from 'express-session';

const router = express.Router();

// Render the Create Account form
router.get("/addAccount", isLoggedIn, (req, res) => {
  res.redirect("/dashboard/addAccount");
});

// Display dashboard with user info and accounts
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) throw new CustomError(401, 'User not authenticated');

    const user = await User.findById(userId).populate('accounts');
    if (!user) throw new CustomError(404, 'User not found');

    res.json({
      name: user.name,
      // Reverse accounts array to show most recent first
      accounts: user.accounts.reverse().map(account => ({
        ...account.toObject(),
        balance: parseFloat(account.balance.toString())
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Render the selected Account related info
router.get("/:accountId", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) throw new CustomError(401, 'User not authenticated');

    const { accountId } = req.params;
    const account = await Account.findOne({ _id: accountId, user: userId }).populate("transactions");

    if (!account) {
      throw new CustomError(404, "Account not found or access denied.");
    }

    res.json({
      ...account.toObject(),
      initialBalance: parseFloat(account.initialBalance.toString()),
      balance: parseFloat(account.balance.toString()),
      // Reverse transactions array to show most recent first
      transactions: account.transactions.reverse().map(txn => ({
        ...txn.toObject(),
        amount: parseFloat(txn.amount.toString())
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Create account route
router.post("/addAccount", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      throw new CustomError(401, "User not authenticated.");
    }

    const { name, type, balance } = req.body.account;
    // Validate account type
    if (!["Current", "Savings"].includes(type)) {
      throw new CustomError(400, "Invalid account type.");
    }

    const newAccount = new Account({
      name,
      type,
      initialBalance: mongoose.Types.Decimal128.fromString(balance.toString()),
      balance: mongoose.Types.Decimal128.fromString(balance.toString()),
      user: userId,
    });

    await newAccount.save();
    await User.findByIdAndUpdate(userId, { $push: { accounts: newAccount._id } });

    res.status(201).json(newAccount);
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete("/:accountId", isLoggedIn, async (req, res, next) => {
  const { accountId } = req.params;
  const userId = req.session.userId;

  // console.log(`DELETE request received for account ID: ${accountId}`); // Log the request

  if (!userId) {
    return next(new CustomError(401, "User not authenticated"));
  }

  try {
    // Start a database session for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    // console.log("Session started"); // Log session start

    // Find the account
    const account = await Account.findById(accountId).session(session);
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      // console.log("Account not found"); // Log if account is not found
      return next(new CustomError(404, "Account not found"));
    }

    // console.log("Account found:", account); // Log the account

    // Find the user
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      // console.log("User not found"); // Log if user is not found
      return next(new CustomError(404, "User not found"));
    }

    // console.log("User found:", user); // Log the user

    // Find the budget
    const budget = await Budget.findOne({ user: userId }).session(session);
    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      // console.log("Budget not found"); // Log if budget is not found
      return next(new CustomError(404, "Budget not found"));
    }

    // console.log("Budget found:", budget); // Log the budget

    // Delete all transactions associated with the account
    await Transaction.deleteMany({ account: accountId }).session(session);
    // console.log("Transactions deleted"); // Log transaction deletion

    // Update the budget based on the account balance
    const accountBalance = parseFloat(account.balance.toString());
    if (accountBalance > 0) {
      budget.currentBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.currentBalance.toString()) - accountBalance).toString()
      );
      budget.amount = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.amount.toString()) - accountBalance).toString()
      );
    }

    // console.log("Budget updated:", budget); // Log the updated budget

    // Save the updated budget
    await budget.save({ session });
    // console.log("Budget saved"); // Log budget save

    // Remove the account from the user's accounts array
    user.accounts.pull(accountId);
    await user.save({ session });
    // console.log("Account removed from user"); // Log user update

    // Delete the account
    await Account.findByIdAndDelete(accountId).session(session);
    // console.log("Account deleted"); // Log account deletion

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    // console.log("Transaction committed"); // Log transaction commit

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    // console.error("Error deleting account:", error); // Log the error
    next(new CustomError(500, "Failed to delete account"));
  }
});
export default router;
