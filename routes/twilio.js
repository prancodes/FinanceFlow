import express from "express";
import mongoose from "mongoose";
import twilio from "twilio";
import { User } from "../models/User.model.js";
import { Transaction } from "../models/Transaction.model.js";
import { Budget } from "../models/Budget.model.js";
import { getCategoryForTransaction } from "../utils/categorizationHelper.js";
import { getAccountAnalytics, formatAnalyticsForWhatsapp } from "../utils/analyticsHelper.js";

const router = express.Router();

router.post('/twilio/whatsapp', express.urlencoded({ extended: false }), async (req, res) => {
  const fromNumber = req.body.From;
  const incomingMsg = req.body.Body.trim();
  const twiml = new twilio.twiml.MessagingResponse();

  try {
    const user = await User.findOne({ whatsappNumber: fromNumber }).populate('accounts');

    if (!user) {
      twiml.message("Hello! Your phone number isn't registered. Please add it in your app profile. 🚀");
      return res.type('text/xml').send(twiml.toString());
    }

    if (user.pendingWhatsappTransaction?.state === 'awaiting_account_selection') {
      const choiceIndex = parseInt(incomingMsg, 10) - 1;

      if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= user.accounts.length) {
        twiml.message("Invalid selection. Please reply with just the number of the account (e.g., '1').");
        return res.type('text/xml').send(twiml.toString());
      }
      
      const selectedAccount = user.accounts[choiceIndex];
      const { amount, description } = user.pendingWhatsappTransaction;
      const category = await getCategoryForTransaction(description);
      const newTransaction = new Transaction({
        type: 'Expense',
        amount: mongoose.Types.Decimal128.fromString(amount.toString()),
        description,
        category: category,
        date: new Date(),
        account: selectedAccount._id,
      });
      await newTransaction.save();

      const expenseAmount = parseFloat(amount.toString());
      selectedAccount.balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(selectedAccount.balance.toString()) - expenseAmount).toString()
      );
      selectedAccount.transactions.push(newTransaction._id);
      await selectedAccount.save();
      
      user.transactions.push(newTransaction._id);
      user.pendingWhatsappTransaction = undefined; 
      await user.save();

      const budget = await Budget.findOne({ user: user._id });
      if (budget) {
        budget.currentBalance = mongoose.Types.Decimal128.fromString(
          (parseFloat(budget.currentBalance.toString()) - expenseAmount).toString()
        );
        await budget.save();
      }
      
      twiml.message(`✅ Transaction recorded!\n\n*Expense:* ${amount}\n*For:* ${description}\n*From Account:* ${selectedAccount.name}`);

    } else {
      const lowerCaseMsg = incomingMsg.toLowerCase();
      const analyticsMatch = incomingMsg.match(/(?:analyze|analytics for|spending for)\s+(.+)/i);
      const transactionMatch = incomingMsg.match(/spent\s+(\d+(\.\d+)?)\s+on\s+(.+)/i);

      if (lowerCaseMsg === 'lessgo!') {
        const helpMessage = `👋 Welcome to FinanceFlow on WhatsApp! Here's how I can help you:\n\n*1. Log an Expense*\n_Example:_ spent 500 on groceries\n\n*2. See Analytics*\n_Example:_ analyze College expenses`;
        twiml.message(helpMessage);
      }
      else if (analyticsMatch) {
        const accountName = analyticsMatch[1].trim();
        const account = user.accounts.find(acc => acc.name.toLowerCase() === accountName.toLowerCase());

        if (!account) {
          twiml.message(`Sorry, I couldn't find an account named "${accountName}".`);
        } else {
          const analyticsData = await getAccountAnalytics(account._id);
          const formattedMessage = formatAnalyticsForWhatsapp(analyticsData);
          twiml.message(formattedMessage);
        }
      } else if (transactionMatch) {
        if (user.accounts.length === 0) {
          twiml.message("You don't have any accounts set up yet. Please add an account in the app first.");
          return res.type('text/xml').send(twiml.toString());
        }

        const amount = parseFloat(transactionMatch[1]);
        const description = transactionMatch[3].trim();
        
        user.pendingWhatsappTransaction = {
          amount,
          description,
          state: 'awaiting_account_selection',
        };
        await user.save();
        
        let accountList = "From which account should I deduct this?\n\nPlease reply with the number:\n";
        user.accounts.forEach((acc, index) => {
          accountList += `\n*${index + 1}.* ${acc.name}`;
        });
        
        twiml.message(accountList);
      } else {
        twiml.message("Sorry, I didn't understand. You can say 'spent 100 on coffee' to log an expense or 'analyze [account name]' to see a report.");
      }
    }
  } catch (error) {
    console.error('CRITICAL ERROR in WhatsApp Webhook:', error);
    twiml.message("Oops! A critical error occurred on our end. Please try again later. 🛠️");
  }

  res.type('text/xml').send(twiml.toString());
});

export default router;