import express from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.model.js';
import { Account } from '../models/Account.model.js';
import { Budget } from '../models/Budget.model.js';
import { User } from '../models/User.model.js';
import CustomError from '../utils/CustomError.js';
import isLoggedIn from '../middleware/isLoggedIn.js';

const router = express.Router({ mergeParams: true });

// Render the Transaction Form
router.get("/createTransaction", isLoggedIn, (req, res) => {
  const { accountId } = req.params;
  res.redirect(`/dashboard/${accountId}/createTransaction`);
});

// Add transaction route
router.post("/transaction", isLoggedIn, async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const userId = req.session.userId;
    if (!userId) {
      throw new CustomError(401, "User not authenticated.");
    }

    const data = req.body.transaction;

    // Validate and convert the amount
    if (!data.amount || data.amount === "") {
      throw new CustomError(400, "Invalid amount.");
    }
    if (typeof data.amount === "string") {
      const amount = parseFloat(data.amount);
      if (isNaN(amount)) {
        throw new CustomError(400, "Invalid amount.");
      }
      data.amount = mongoose.Types.Decimal128.fromString(amount.toString());
    } else if (typeof data.amount === "number") {
      data.amount = mongoose.Types.Decimal128.fromString(data.amount.toString());
    } else {
      throw new CustomError(400, "Invalid amount.");
    }

    // Combine the provided date with the current time
    const transactionDate = new Date(data.date);
    const currentTime = new Date();
    transactionDate.setHours(
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds(),
      currentTime.getMilliseconds()
    );
  //First Set the next Recurring Date to null
  //Check if the transaction is recurring 
  //If no then move ahead else set the next Recurring Date to the transaction Date First
  //Then Based on recurringInterval keep settign the nextRecurringDate
  let nextRecurringDate=null;
  if(data.isRecurring){
    nextRecurringDate=new Date(transactionDate);
    switch(data.recurringInterval){
      case "Daily":
        nextRecurringDate.setDate(nextRecurringDate.getDate() +1);
        break;
      
      case "Weekly":
        nextRecurringDate.setDate(nextRecurringDate.getDate()+7);
        break;

      case "Monthly":
        nextRecurringDate.setMonth(nextRecurringDate.getMonth()+1) ;
        break;

      case "Yearly":
        nextRecurringDate.setFullYear(nextRecurringDate.getFullYear()+1) ;
        break;
      default:
        break;
  }
}
    const newTransaction = new Transaction({
      type: data.type,
      amount: data.amount,
      account: data.account,
      category: data.category,
      date: transactionDate,
      description: data.description,
      isRecurring: data.isRecurring,
      recurringInterval: data.recurringInterval || null,
      nextRecurringDate: nextRecurringDate,
    });

    const savedTransaction = await newTransaction.save();

    const account = await Account.findById(accountId);
    const amount = parseFloat(data.amount.toString());
    if (data.type === "Expense") {
      account.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.balance.toString()) - amount).toString()
      );
    } else if (data.type === "Income") {
      account.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.balance.toString()) + amount).toString()
      );
      account.initialBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.initialBalance.toString()) + amount).toString()
      );
    }

    await account.save();

    await Account.findByIdAndUpdate(
      data.account,
      { $push: { transactions: savedTransaction._id } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      { $push: { transactions: savedTransaction._id } },
      { new: true }
    );

    let budget = await Budget.findOne({ user: userId });
    try {
      if (!budget) {
        budget = new Budget({
          amount: mongoose.Types.Decimal128.fromString(account.balance.toString()),
          currentBalance: mongoose.Types.Decimal128.fromString(account.balance.toString()),
          user: userId,
        });
        await budget.save();
        await User.findByIdAndUpdate(
          userId,
          { $push: { budgets: budget._id } },
          { new: true }
        );
      } else {
        budget.currentBalance = account.balance;
        await budget.save();
      }
    } catch (error) {
      throw new CustomError(500, "Error creating Budget");
    }

    res.redirect(`/dashboard/${accountId}`);
  } catch (error) {
    next(error);
  }

});

// Render Transaction Edit Form
router.get("/transaction/:transactionId/edit", isLoggedIn, async (req, res, next) => {
  const { accountId, transactionId } = req.params;
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new CustomError(404, "Transaction not found");
    }

    res.json({
      ...transaction.toObject(),
      amount: parseFloat(transaction.amount.toString())
    });
  } catch (err) {
    next(err);
  }
});

// Update transaction data and store in Database
router.put("/transaction/:transactionId", isLoggedIn, async (req, res, next) => {
  const { accountId, transactionId } = req.params;
  const { type, amount, category, date, description, isRecurring, recurringInterval } = req.body.transaction;
  try {
    const oldTransaction = await Transaction.findById(transactionId);
    if (!oldTransaction) {
      throw new CustomError(404, "Transaction not found");
    }

    // Fetch the account associated with the transaction
    const account = await Account.findById(accountId);
    if (!account) {
      throw new CustomError(404, "Account not found");
    }

    // Fetch the budget associated with the user
    const budget = await Budget.findOne({ user: account.user });
    if (!budget) {
      throw new CustomError(404, "Budget not found");
    }

    // Revert the old transaction's impact on the account balance and budget
    const oldAmount = parseFloat(oldTransaction.amount.toString());
    if (oldTransaction.type === "Expense") {
      account.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.balance.toString()) + oldAmount).toString()
      );
      budget.currentBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.currentBalance.toString()) + oldAmount).toString()
      );
      budget.amount = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.amount.toString()) + oldAmount).toString()
      );
    } else if (oldTransaction.type === "Income") {
      account.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.balance.toString()) - oldAmount).toString()
      );
      account.initialBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.initialBalance.toString()) - oldAmount).toString()
      );
      budget.currentBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.currentBalance.toString()) - oldAmount).toString()
      );
      budget.amount = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.amount.toString()) - oldAmount).toString()
      );
    }
    let nextRecurringDate = null;
    if (isRecurring === "on" || isRecurring === true) {
      const transactionDate = new Date(date);
      nextRecurringDate = new Date(transactionDate);
      switch (recurringInterval) {
        case "Daily":
          nextRecurringDate.setDate(nextRecurringDate.getDate() + 1);
          break;
        case "Weekly":
          nextRecurringDate.setDate(nextRecurringDate.getDate() + 7);
          break;
        case "Monthly":
          nextRecurringDate.setMonth(nextRecurringDate.getMonth() + 1);
          break;
        case "Yearly":
          nextRecurringDate.setFullYear(nextRecurringDate.getFullYear() + 1);
          break;
        default:
          break;
      }
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        type,
        amount: mongoose.Types.Decimal128.fromString(amount.toString()),
        category,
        date: new Date(date),
        description,
        isRecurring: isRecurring === "on" || isRecurring === true,
        recurringInterval: (isRecurring === "on" || isRecurring === true) ? recurringInterval : null,
        nextRecurringDate: nextRecurringDate,
      },
      { new: true, runValidators: true }
    );
    if (!updatedTransaction) {
      throw new CustomError(404, "Transaction not found");
    }

    // Apply the new transaction's impact on the account balance and budget
    const newAmount = parseFloat(amount);
    if (type === "Expense") {
      account.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.balance.toString()) - newAmount).toString()
      );
      budget.currentBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.currentBalance.toString()) - newAmount).toString()
      );
      budget.amount = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.amount.toString()) - newAmount).toString()
      );
    } else if (type === "Income") {
      account.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.balance.toString()) + newAmount).toString()
      );
      account.initialBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.initialBalance.toString()) + newAmount).toString()
      );
      budget.currentBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.currentBalance.toString()) + newAmount).toString()
      );
      budget.amount = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.amount.toString()) + newAmount).toString()
      );
    }

    // Save the updated account balance and budget
    await account.save();
    await budget.save();

    res.redirect(`/dashboard/${accountId}`);
  } catch (err) {
    next(err);
  }
});

export default router;