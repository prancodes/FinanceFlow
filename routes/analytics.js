import express from "express";
import CustomError from "../utils/CustomError.js";
import isLoggedIn from '../middleware/isLoggedIn.js';
import { Account } from "../models/Account.model.js";

const router = express.Router({ mergeParams: true });

router.get("/analytics", isLoggedIn, async (req, res, next) => {
  const { accountId } = req.params;
  const { year } = req.query; // Get year from query params

  try {
    // Validate year input
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    if (isNaN(selectedYear)) {
      throw new CustomError(400, "Invalid year parameter.");
    }

    // Define date range for the selected year
    const startDate = new Date(`${selectedYear}-01-01`);
    const endDate = new Date(`${selectedYear}-12-31`);

    // Fetch account with transactions filtered by year
    const account = await Account.findById(accountId).populate({
      path: "transactions",
      match: {
        type: "Expense",
        date: { $gte: startDate, $lte: endDate }, // Filter by year
      },
    });

    if (!account) throw new CustomError(404, "Account not found.");

    // Initialize monthly spending for the selected year
    const monthlySpending = Array(12).fill(0);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Calculate monthly spending
    account.transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const monthIndex = transactionDate.getMonth(); // 0-11
      monthlySpending[monthIndex] += parseFloat(transaction.amount.toString());
    });

    // Convert to month-name keyed object
    const monthlySpendingData = {};
    monthNames.forEach((month, index) => {
      monthlySpendingData[month] = monthlySpending[index];
    });

    // Calculate expenses by category
    const expensesByCategory = calculateExpensesByCategory(account.transactions);

    res.json({
      initialBalance: parseFloat(account.initialBalance.toString()),
      currentBalance: parseFloat(account.balance.toString()),
      expensesByCategory,
      monthlySpending: monthlySpendingData,
      selectedYear, // Return the selected year for frontend display
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate category expenses
function calculateExpensesByCategory(transactions) {
  const categories = transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    const amount = parseFloat(transaction.amount.toString());
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  // Ensure default categories exist with 0 values
  return {
    Food: 0,
    Transport: 0,
    Entertainment: 0,
    Other: 0,
    ...categories,
  };
}

router.get("/available-years", isLoggedIn, async (req, res, next) => {
  const { accountId } = req.params;

  try {
    const account = await Account.findById(accountId).populate("transactions");
    if (!account) throw new CustomError(404, "Account not found.");

    // Extract unique years from transactions
    const years = [...new Set(account.transactions.map(t => new Date(t.date).getFullYear()))];
    years.sort((a, b) => b - a); // Sort in descending order

    res.json({ years });
  } catch (error) {
    next(error);
  }
});

export default router;