import express from "express";
import { getUserId, getUserResumes, syncUser, upgradeUser } from "../controllers/userController.js";
import { forgotPassword, sendVerification, sendLoginNotification } from "../controllers/emailController.js";
import protect from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/sync", protect, syncUser);
userRouter.get("/data", protect, getUserId);
userRouter.get("/resumes", protect, getUserResumes);
userRouter.post("/upgrade", protect, upgradeUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/send-verification", sendVerification);
userRouter.post("/send-login-notification", sendLoginNotification);

export default userRouter;