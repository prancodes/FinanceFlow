import cron from 'node-cron';
import { Transaction } from '../models/Transaction.model.js';
import { Account } from '../models/Account.model.js';
import { Budget } from '../models/Budget.model.js';
import { User } from '../models/User.model.js';
import mongoose from 'mongoose';

export const cleanOrphanedData = async () => {
  try {
    const accounts = await Account.find({}, 'user');
    const userIds = accounts.map(a => a.user).filter(Boolean);

    const existingUsers = await User.find({ _id: { $in: userIds } }, '_id');
    const existingUserIdsSet = new Set(existingUsers.map(u => u._id.toString()));

    const accountsToDelete = accounts.filter(a => a.user && !existingUserIdsSet.has(a.user.toString()));
    const accountIdsToDelete = accountsToDelete.map(a => a._id);

    if (accountIdsToDelete.length > 0) {
      console.log(`Scheduler: Found ${accountIdsToDelete.length} orphaned accounts. Cleaning up...`);
      await Transaction.deleteMany({ account: { $in: accountIdsToDelete } });
      await Account.deleteMany({ _id: { $in: accountIdsToDelete } });
    }

    const budgets = await Budget.find({}, 'user');
    const budgetsToDelete = budgets.filter(b => b.user && !existingUserIdsSet.has(b.user.toString()));
    const budgetIdsToDelete = budgetsToDelete.map(b => b._id);

    if (budgetIdsToDelete.length > 0) {
      console.log(`Scheduler: Found ${budgetIdsToDelete.length} orphaned budgets. Cleaning up...`);
      await Budget.deleteMany({ _id: { $in: budgetIdsToDelete } });
    }

    console.log("Scheduler: Database orphaned record cleanup completed.");
  } catch (error) {
    console.error("Scheduler: Error cleaning up orphaned records:", error);
  }
};

// Process recurring transactions
export const processRecurringTransactions = async () => {
  try {
    // Run automated daily orphaned records cleanup
    await cleanOrphanedData();

    const today = new Date();
    const recurringTransactions = await Transaction.find({
      isRecurring: true,
      nextRecurringDate: { $lte: today }, // Find transactions due today or earlier
    });

    for (const transaction of recurringTransactions) {
      const account = await Account.findById(transaction.account);
      if (!account) {
        console.warn(`Account not found for transaction: ${transaction._id}`);
        continue;
      }
      const amount = parseFloat(transaction.amount.toString());

      // Process the transaction
      if (transaction.type === "Expense") {
        account.balance = mongoose.Types.Decimal128.fromString(
          (parseFloat(account.balance.toString()) - amount).toString()
        );
      } else if (transaction.type === "Income") {
        account.balance = mongoose.Types.Decimal128.fromString(
          (parseFloat(account.balance.toString()) + amount).toString()
        );
      }

      await account.save();

      // Update budget relatively if it exists
      const budget = await Budget.findOne({ user: account.user });
      if (budget) {
        if (transaction.type === "Expense") {
          budget.currentBalance = mongoose.Types.Decimal128.fromString(
            (parseFloat(budget.currentBalance.toString()) - amount).toString()
          );
        } else if (transaction.type === "Income") {
          budget.currentBalance = mongoose.Types.Decimal128.fromString(
            (parseFloat(budget.currentBalance.toString()) + amount).toString()
          );
        }
        await budget.save();
      }

      // Update nextRecurringDate relative to original due date to prevent drift
      let nextRecurringDate = new Date(transaction.nextRecurringDate || today);
      switch (transaction.recurringInterval) {
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

      transaction.nextRecurringDate = nextRecurringDate;
      transaction.lastProcessed = today;
      await transaction.save();
    }

    console.log("Recurring transactions processed successfully.");
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
    throw error;
  }
};

// Schedule a task to run every day at midnight
const startScheduler = () => {
  cron.schedule('0 0 * * *', processRecurringTransactions);
};

export default startScheduler;