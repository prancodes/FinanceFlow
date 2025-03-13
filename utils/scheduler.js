import cron from 'node-cron';
import { Transaction } from '../models/Transaction.model.js';
import { Account } from '../models/Account.model.js';
import mongoose from 'mongoose';

// Schedule a task to run every day at midnight
const startScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date();
      const recurringTransactions = await Transaction.find({
        isRecurring: true,
        nextRecurringDate: { $lte: today }, // Find transactions due today or earlier
      });

      for (const transaction of recurringTransactions) {
        const account = await Account.findById(transaction.account);
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

        // Update nextRecurringDate
        let nextRecurringDate = new Date(today);
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
        await transaction.save();
      }

      console.log("Recurring transactions processed successfully.");
    } catch (error) {
      console.error("Error processing recurring transactions:", error);
    }
  });
};

export default startScheduler;