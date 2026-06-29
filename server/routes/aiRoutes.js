import express from "express"
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume, tailorResume } from "../controllers/aiController.js";
import { runAtsScan, getScanHistory } from "../controllers/atsController.js";
import protect from "../middlewares/authMiddleware.js";
import atsRateLimiter from "../middlewares/atsRateLimiter.js";

const aiRouter = express.Router();

// Existing AI routes — protect only, no rate limiting
aiRouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary);
aiRouter.post('/enhance-job-desc', protect, enhanceJobDescription);
aiRouter.post('/upload-resume', protect, uploadResume);
aiRouter.post('/tailor-resume', protect, tailorResume);

// ATS Score Checker routes — protect first, then quota check
aiRouter.post('/ats-score', protect, atsRateLimiter, runAtsScan);
aiRouter.get('/ats-score/:resumeId', protect, getScanHistory);

export default aiRouter;