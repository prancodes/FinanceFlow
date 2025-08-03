import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import fs from "node:fs/promises";
import express from "express";
import twilio from "twilio";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import MongoStore from "connect-mongo";
import startScheduler from "./utils/scheduler.js";
import CustomError from "./utils/CustomError.js";
import errorHandler from "./middleware/errorHandler.js";
import { sendMonthlyAlerts } from "./utils/monthlyAlerts.js";
import cron from "node-cron";
import { User } from "./models/User.model.js";
import { Transaction } from "./models/Transaction.model.js";
import { Account } from "./models/Account.model.js";
import { getAccountAnalytics,formatAnalyticsForWhatsapp } from "./utils/analyticsHelper.js";
import { getCategoryForTransaction } from "./utils/categorizationHelper.js";


const MONGO_URL = process.env.MONGODB_URI;
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Database connected successfully");
}
main().catch(console.error);


const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3000;
const base = process.env.BASE || "/";
const accountSid=process.env.TWILIO_ACCOUNT_SID;
const authToken=process.env.TWILIO_AUTH_TOKEN;


const app = express();
app.post('/api/twilio/whatsapp', twilio.webhook(), async (req, res) => {
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
      
      user.pendingWhatsappTransaction = undefined; 
      await user.save();
      
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


app.use(express.json({ limit: "5mb" })); 
app.use(cookieParser());
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(express.static(path.join(process.cwd(), "dist")));



const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: { secret: process.env.SESSION_SECRET },
  touchAfter: 24 * 3600,
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
  },
};
app.use(session(sessionOptions));


import homeRoutes from "./routes/home.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import transactionRoutes from "./routes/transactions.js";
import analyticsRoutes from "./routes/analytics.js";
import scanReceiptRoutes from "./routes/scanReceipt.js";


const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";


/** @type {import('vite').ViteDevServer | undefined} */
let vite;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use(base, sirv("./dist/client", { extensions: [] }));
}

// API Routes
app.use("/api", homeRoutes);
app.use("/api", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard/:accountId", transactionRoutes);
app.use("/api/dashboard/:accountId", analyticsRoutes);
app.use("/api/dashboard/:accountId/transaction", scanReceiptRoutes);

// Serve HTML
app.use("*all", async (req, res) => {
  try {
    let url = req.originalUrl.replace(base, "");
    // Ensure the URL always starts with a leading slash.
    if (!url.startsWith("/")) {
      url = "/" + url;
    }

    /** @type {string} */
    let template;
    /** @type {import('./src/entry-server.js').render} */
    let render;
    if (!isProduction) {
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
    } else {
      template = templateHtml;
      render = (await import("./dist/server/entry-server.js")).render;
    }

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    res.status(500).end(e.stack);
  }
});


// Use the custom error handling middleware
app.use(errorHandler);

// Check NODE_ENV instead of process.env.VERCEL:
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
    startScheduler();
    cron.schedule("0 9 1 * *", sendMonthlyAlerts);
  });
}

// EXPORT the Express app so that Vercel can use it as a handler
export default app;