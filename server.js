import fs from 'node:fs/promises';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import MongoStore from 'connect-mongo';
import CustomError from './utils/CustomError.js';
import isLoggedIn from './utils/isLoggedIn.js';

// Load env variables
dotenv.config({ path: './.env' });

// Connect to MongoDB
const MONGO_URL = process.env.MONGODB_URI;
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Database connected successfully");
}
main().catch(console.error);

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Create Express app
const app = express();

// --- Middleware Setup ---
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));


// --- Session Configuration ---
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: { secret: process.env.SESSION_SECRET },
  touchAfter: 24 * 3600
});
store.on("error", (error) => {
  console.error("Error in Mongo Session Store", error);
});
const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};
app.use(session(sessionOptions));


// Import your models
import { User } from './models/User.model.js';
import { Transaction } from './models/Transaction.model.js';
import { Account } from './models/Account.model.js';
import { Budget } from './models/Budget.model.js';

const jwtSecret = process.env.JWT_SECRET;

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}


// --------------------- API Routes ------------------

// Correct the root route to serve the index page
app.get("/", (req, res) => {
  res.redirect("/home");
});

// Correct the signup route to serve the signup page
app.get("/signup", (req, res) => {
  res.redirect("/signup");
});

// Correct the login route to serve the login page
app.get("/login", (req, res) => {
  res.redirect("/login");
});

// GET Route: Render the Create Account form
app.get("/dashboard/addAccount", isLoggedIn, (req, res) => {
  res.redirect("/dashboard/addAccount");
});

// GET Route: Render the Transaction Form
app.get("/dashboard/:accountId/createTransaction", (req, res) => {
  const { accountId } = req.params;
  res.redirect(`/dashboard/${accountId}/createTransaction`);
});

// POST Route: Signup
app.post("/signup", async (req, res, next) => {
  const { name, email, password } = req.body.user;
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError(400, "Email already Exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    req.session.userId = createdUser._id;

    // Generate JWT token and set it in a cookie
    jwt.sign({ userId: createdUser._id, name }, jwtSecret, {}, (err, token) => {
      if (err) {
        console.error("JWT Error:", err);
        return res.redirect("/signup");
      }
      res.cookie("token", token, { sameSite: "none", secure: true });
      res.redirect("/dashboard");
    });
  } catch (error) {
    next(error);
  }
});

// POST Route: Login
app.post("/login", async (req, res, next) => {
  const { email, password } = req.body.login;
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      throw new CustomError(404, "User not found");
    }

    const correctPass = await bcrypt.compare(password, findUser.password);
    if (correctPass) {
      // Save user info in the session
      req.session.userId = findUser._id;
      jwt.sign({ userId: findUser._id, name: findUser.name }, jwtSecret, {}, (err, token) => {
        if (err) {
          console.error("JWT Error:", err);
          return next(new CustomError(500, "JWT error. Please try again later."));
        }
        res.cookie("token", token, { sameSite: "none", secure: true });
        res.redirect("/dashboard");
      });
    } else {
      throw new CustomError(401, "Incorrect password");
    }
  } catch (error) {
    next(error);
  }
});

// Route to display dashboard with user info and accounts
app.get("/dashboard", isLoggedIn, async (req, res, next) => {
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
app.get("/dashboard/:accountId", async (req, res, next) => {
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

// Route to create account
app.post("/dashboard/addAccount", async (req, res, next) => {
  try {
    // Extract user ID from session for verification
    const userId = req.session.userId;
    if (!userId) {
      throw new CustomError(401, "User not authenticated.");
    }

    const { name, type, balance } = req.body.account;
    // Validate account type
    if (!["Current", "Savings"].includes(type)) {
      throw new CustomError(400, "Invalid account type.");
    }

    // Create account with user ID from session
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

// POST route to add Transaction
app.post("/dashboard/:accountId", async (req, res, next) => {
  console.log("Received Data:", req.body);
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

    const newTransaction = new Transaction({
      type: data.type,
      amount: data.amount,
      account: data.account,
      category: data.category,
      date: transactionDate,
      description: data.description,
      isRecurring: data.isRecurring,
      recurringInterval: data.recurringInterval ? data.recurringInterval.toUpperCase() : null,
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
    console.log(budget);
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
        console.log("New budget created and added to the user.");
      } else {
        budget.currentBalance = account.balance;
        await budget.save();
      }
    } catch (error) {
      console.error("Error creating Budget", error);
    }

    // Redirect to the account details page after creating the transaction
    res.redirect(`/dashboard/${accountId}`);
  } catch (error) {
    next(error);
  }
});

// ------------------------- Transaction Routes -----------------------------

// GET Route: Render Transaction Edit Form
app.get("/dashboard/:accountId/transaction/:transactionId/edit", async (req, res, next) => {
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
    console.error("Error fetching transaction:", err);
    next(err);
  }
});

// PUT Route: Update transaction data and store in Database
app.put("/dashboard/:accountId/transaction/:transactionId", async (req, res, next) => {
  const { accountId, transactionId } = req.params;
  const { type, amount, category, date, description, isRecurring, recurringInterval } = req.body.transaction;
  try {
    // Fetch the old transaction before updating it
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

    // Update the transaction with the new data
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

    // Redirect to the account details page after updating the transaction
    res.redirect(`/dashboard/${accountId}`);
  } catch (err) {
    console.error("Error updating transaction:", err);
    next(err);
  }
});


// -------------------- Error Handling Middleware -----------------



// ----------------------------------------------------------------


// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.js').render} */
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const rendered = await render(url)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
