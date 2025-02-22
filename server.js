import dotenv from 'dotenv';
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import fs from 'node:fs/promises';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import MongoStore from 'connect-mongo';
import startScheduler from './utils/scheduler.js';
import CustomError from './utils/CustomError.js';
import errorHandler from './middleware/errorHandler.js';

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

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

// Session configuration
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

// Import routes
import homeRoutes from './routes/home.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import transactionRoutes from './routes/transactions.js';
import analyticsRoutes from './routes/analytics.js'

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

// API Routes
app.use('/api', homeRoutes);
app.use('/api', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard/:accountId', transactionRoutes);
app.use('/api/dashboard/:accountId', analyticsRoutes);

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.js').render} */
    let render
    if (!isProduction) {
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

// Use the custom error handling middleware
app.use(errorHandler);

// Start HTTP server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
  startScheduler();
})