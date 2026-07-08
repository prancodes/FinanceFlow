import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import fs from "node:fs/promises";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import MongoStore from "connect-mongo";
import startScheduler, { processRecurringTransactions } from "./utils/scheduler.js";
import CustomError from "./utils/CustomError.js";
import errorHandler from "./middleware/errorHandler.js";
import { sendMonthlyAlerts } from "./utils/monthlyAlerts.js";
import cron from "node-cron";
import { User } from "./models/User.model.js";
import { Transaction } from "./models/Transaction.model.js";
import { Account } from "./models/Account.model.js";
import { Budget } from "./models/Budget.model.js";
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
const app = express();


app.use(express.json({ limit: "5mb" })); 
app.use(cookieParser());
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(express.static(path.join(process.cwd(), "dist"), {
  maxAge: '1y',
  immutable: true
}));



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
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
import twilioRoutes from "./routes/twilio.js";


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
  app.use(base, sirv("./dist/client", {
    extensions: [],
    maxAge: 31536000, // 1 year cache
    immutable: true
  }));
}

// API Routes
app.use("/api", homeRoutes);
app.use("/api", authRoutes);
app.use("/api", twilioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard/:accountId", transactionRoutes);
app.use("/api/dashboard/:accountId", analyticsRoutes);
app.use("/api/dashboard/:accountId/transaction", scanReceiptRoutes);

// Expose secure Vercel Cron endpoints
const cronAuth = (req, res, next) => {
  if (process.env.NODE_ENV !== "production" || req.headers["x-vercel-cron"] === "true") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.get("/api/cron/process-recurring", cronAuth, async (req, res, next) => {
  try {
    await processRecurringTransactions();
    res.json({ success: true, message: "Recurring transactions processed successfully." });
  } catch (error) {
    next(error);
  }
});

app.get("/api/cron/monthly-alerts", cronAuth, async (req, res, next) => {
  try {
    await sendMonthlyAlerts();
    res.json({ success: true, message: "Monthly alerts sent successfully." });
  } catch (error) {
    next(error);
  }
});

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

    // Technical SEO: Check valid client routes to return standard 404 code for dead URLs
    const validRoutes = [
      /^\/$/,
      /^\/privacy\/?$/,
      /^\/terms\/?$/,
      /^\/signup\/?$/,
      /^\/login\/?$/,
      /^\/dashboard\/?$/,
      /^\/dashboard\/addAccount\/?$/,
      /^\/dashboard\/[^/]+\/?$/,
      /^\/dashboard\/[^/]+\/createTransaction\/?$/,
      /^\/dashboard\/[^/]+\/transaction\/[^/]+\/edit\/?$/,
      /^\/dashboard\/[^/]+\/analytics\/?$/
    ];
    const isValidRoute = validRoutes.some(regex => regex.test(url));
    const statusCode = isValidRoute ? 200 : 404;

    res.status(statusCode).set({ "Content-Type": "text/html" }).send(html);
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