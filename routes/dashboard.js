import express from 'express';
import isLoggedIn from '../utils/isLoggedIn.js';
import { User } from '../models/User.model.js';
import { Account } from '../models/Account.model.js';
import CustomError from '../utils/CustomError.js';
import mongoose from 'mongoose';

const router = express.Router();

// Render the Create Account form
router.get("/addAccount", isLoggedIn, (req, res) => {
  res.redirect("/dashboard/addAccount");
});

// Display dashboard with user info and accounts
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const user = await User.findById(userId).populate('accounts');
    if (!user) throw new CustomError(404, 'User not found');

    res.json({
      name: user.name,
      accounts: user.accounts.map(account => ({
        ...account.toObject(),
        balance: parseFloat(account.balance.toString())
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Render the selected Account related info
router.get("/:accountId", async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const { accountId } = req.params;
    const account = await Account.findOne({ _id: accountId, user: userId }).populate("transactions");

    if (!account) {
      return res.status(404).json({ message: "Account not found or access denied." });
    }

    res.json({
      ...account.toObject(),
      initialBalance: parseFloat(account.initialBalance.toString()),
      balance: parseFloat(account.balance.toString()),
      transactions: account.transactions.map(txn => ({
        ...txn.toObject(),
        amount: parseFloat(txn.amount.toString())
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Create account route
router.post("/addAccount", async (req, res, next) => {
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

export default router;
