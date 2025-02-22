import express from "express";
import CustomError from "../utils/CustomError.js";
import { Account } from "../models/Account.model.js";
import { User } from "../models/User.model.js";

const router = express.Router({ mergeParams: true });

router.get("/analytics", async (req, res, next) => {
  const { accountId } = req.params;

  try {
    // Fetch the account by accountId
    const account = await Account.findById(accountId).populate({
      path: "transactions",
      match: { type: "Expense" }, // Only fetch expense transactions
    });

    if (!account) {
      throw new CustomError(404, "Account not found.");
    }

    // Fetch the user associated with the account
    const user = await User.findById(account.user);

    if (!user) {
      throw new CustomError(404, "User not found.");
    }

    // Calculate total expenses by category for the specific account
    const expensesByCategory = {
      Food: 0,
      Transport: 0,
      Entertainment: 0,
    };

    account.transactions.forEach((transaction) => {
      if (transaction.category in expensesByCategory) {
        expensesByCategory[transaction.category] += parseFloat(transaction.amount.toString());
      }
    });

    // Get initialBalance and current balance for the specific account
    const initialBalance = parseFloat(account.initialBalance.toString());
    const currentBalance = parseFloat(account.balance.toString());

    // Calculate monthly spending trend (example)
    const monthlySpending = {
      January: 500,
      February: 700,
      March: 300,
      April: 900,
      May: 600,
      June: 800,
    };

    // Return JSON data
    res.json({
      initialBalance,
      currentBalance,
      expensesByCategory,
      monthlySpending,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
