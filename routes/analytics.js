import express from "express";
import CustomError from "../utils/CustomError.js";
import { Account } from "../models/Account.model.js";
import { User } from "../models/User.model.js";

const router = express.Router({ mergeParams: true });

router.get("/analytics", async (req, res, next) => {
  const { accountId } = req.params;
  const account = await Account.findById(accountId);
  try {
    // Fetch user's accounts and transactions
    const user = await User.findById(account.user).populate({
      path: "accounts",
      populate: {
        path: "transactions",
        match: { type: "Expense" }, // Only fetch expense transactions
      },
    });

    if (!user) {
      throw new CustomError(404, "User not found.");
    }

    // Calculate total expenses by category
    const expensesByCategory = {
      Food: 0,
      Transport: 0,
      Entertainment: 0,
    };

    user.accounts.forEach((account) => {
      account.transactions.forEach((transaction) => {
        if (transaction.category in expensesByCategory) {
          expensesByCategory[transaction.category] += parseFloat(
            transaction.amount.toString()
          );
        }
      });
    });

    // Get initialBalance and current balance
    const initialBalance = parseFloat(
      user.accounts[0].initialBalance.toString()
    );
    const currentBalance = parseFloat(user.accounts[0].balance.toString());

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
