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

    // Merge the new date (from the request) with the original time from oldTransaction.date
    let updatedDate = new Date(date);
    if (oldTransaction.date) {
      updatedDate.setHours(
        oldTransaction.date.getHours(),
        oldTransaction.date.getMinutes(),
        oldTransaction.date.getSeconds(),
        oldTransaction.date.getMilliseconds()
      );
    }

    // Set up nextRecurringDate if the transaction is recurring
    let nextRecurringDate = null;
    if (isRecurring === "on" || isRecurring === true) {
      nextRecurringDate = new Date(updatedDate);
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

    // Update the transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        type,
        amount: mongoose.Types.Decimal128.fromString(amount.toString()),
        category,
        date: updatedDate, // Use merged date (new date + old time)
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


// DELETE /api/dashboard/:accountId/transaction/:transactionId
router.delete("/transaction/:transactionId", isLoggedIn, async (req, res, next) => {
  const { accountId, transactionId } = req.params;
  const userId = req.session.userId;
  // console.log(`DELETE request received for transaction ID: ${transactionId}`);
  if (!userId) {
    return next(new CustomError(401, "User not authenticated."));
  }

  try {
    // Start a database session for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    // Find the transaction
    const transaction = await Transaction.findById(transactionId).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return next(new CustomError(404, "Transaction not found"));
    }

    // Find the account
    const account = await Account.findById(accountId).session(session);
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return next(new CustomError(404, "Account not found"));
    }

    // Find the budget
    const budget = await Budget.findOne({ user: userId }).session(session);
    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      return next(new CustomError(404, "Budget not found"));
    }

    // Update balances based on transaction type
    const amount = parseFloat(transaction.amount.toString());
    if (transaction.type === "Expense") {
      // Add the expense amount back to the balance
      account.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.balance.toString()) + amount).toString()
      );
      budget.currentBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.currentBalance.toString()) + amount).toString()
      );
      budget.amount = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.amount.toString()) + amount).toString()
      );
    } else if (transaction.type === "Income") {
      // Subtract the income amount from both initialBalance and balance
      account.initialBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.initialBalance.toString()) - amount).toString()
      );
      account.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(account.balance.toString()) - amount).toString()
      );
      budget.currentBalance = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.currentBalance.toString()) - amount).toString()
      );
      budget.amount = mongoose.Types.Decimal128.fromString(
        (parseFloat(budget.amount.toString()) - amount).toString()
      );
    }

    // Save the updated account and budget
    await account.save({ session });
    await budget.save({ session });

    // Delete the transaction
    await Transaction.findByIdAndDelete(transactionId).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    // console.error("Error deleting transaction:", error);
    next(new CustomError(500, "Failed to delete transaction"));
  }
});

export default router;