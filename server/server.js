import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
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
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize());

app.get("/", (req, res) => {
  res.send("Hello, Server is running!");
});

app.use("/api/users", userRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/imagekit', imagekitRouter);
app.use('/api/payments', paymentRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
