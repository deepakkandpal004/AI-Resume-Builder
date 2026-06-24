import express from "express"
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume } from "../controllers/aiController.js";
import { runAtsScan, getScanHistory } from "../controllers/atsController.js";
import protect from "../middlewares/authMiddleware.js";
import atsRateLimiter from "../middlewares/atsRateLimiter.js";

const aiRouter = express.Router();

aiRouter.post('/enhance-pro-sum', atsRateLimiter, protect, enhanceProfessionalSummary);
aiRouter.post('/enhance-job-desc', atsRateLimiter, protect, enhanceJobDescription);
aiRouter.post('/upload-resume', atsRateLimiter, protect, uploadResume);

// ATS Score Checker routes (Requirements: 10.1, 11.1)
aiRouter.post('/ats-score', atsRateLimiter, protect, runAtsScan);
aiRouter.get('/ats-score/:resumeId', atsRateLimiter, protect, getScanHistory);

export default aiRouter;