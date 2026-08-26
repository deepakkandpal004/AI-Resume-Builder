import "dotenv/config";
import { initSentry } from "./observability/sentry.js";

initSentry();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import logger from "./observability/logger.js";
import requestContext from "./observability/requestContext.js";
import requestLogger from "./observability/requestLogger.js";
import { setupSentryErrorHandler } from "./observability/sentry.js";
import userRouter from "./routes/userRoute.js";
import resumeRouter from "./routes/resumeRoute.js";
import aiRouter from "./routes/aiRoutes.js";
import imagekitRouter from "./routes/imagekitRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

await connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
    : ["http://localhost:5173", "https://resume-builder-saas-rsdeepakg.vercel.app", "https://resume.deepakkandpal.me"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize());

app.use(requestContext);
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Hello, Server is running!");
});

app.get("/healthz", (req, res) => {
  // 0=disconnected 1=connected 2=connecting 3=disconnecting
  const state = mongoose.connection.readyState;
  const healthy = state === 1;
  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    db: healthy ? "connected" : `state:${state}`,
  });
});

app.use("/api/users", userRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/imagekit', imagekitRouter);
app.use('/api/payments', paymentRouter);

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Sentry must capture errors before the final handler
setupSentryErrorHandler(app);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
