import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { getImageKitAuth } from "../controllers/imagekitController.js";

const imagekitRouter = express.Router();

// Only authenticated users can request upload tokens
imagekitRouter.get("/auth", protect, getImageKitAuth);

export default imagekitRouter;
