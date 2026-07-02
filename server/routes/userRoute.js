import express from "express";
import { forgotPassword, resetPassword } from "../controllers/passwordResetController.js";
import { getUserId, getUserResumes, loginUser, registerUser, upgradeUser } from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";
import authRateLimiter from "../middlewares/authRateLimiter.js";

const userRouter = express.Router();

userRouter.post('/register', authRateLimiter, registerUser);
userRouter.post('/login', authRateLimiter, loginUser);
userRouter.get('/data', protect, getUserId);
userRouter.get('/resumes', protect, getUserResumes);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/upgrade', protect, upgradeUser);

export default userRouter;
