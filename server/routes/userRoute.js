import express from "express";
import { getUserId, getUserResumes, loginUser, registerUser } from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data',protect, getUserId);
userRouter.get('/resumes', protect, getUserResumes)

export default userRouter;
