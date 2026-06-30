import express from "express"
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume, tailorResume, generateCoverLetter, getCoverLetterHistory, deleteCoverLetter, generateInterviewQuestions, getInterviewHistory } from "../controllers/aiController.js";
import { runAtsScan, getScanHistory } from "../controllers/atsController.js";
import protect from "../middlewares/authMiddleware.js";
import atsRateLimiter from "../middlewares/atsRateLimiter.js";
import coverLetterRateLimiter from "../middlewares/coverLetterRateLimiter.js";
import interviewRateLimiter from "../middlewares/interviewRateLimiter.js";
import { enhanceRateLimiter, tailorRateLimiter } from "../middlewares/aiEnhanceRateLimiter.js";

const aiRouter = express.Router();

// Existing AI routes — rate limited for free tier
aiRouter.post('/enhance-pro-sum', protect, enhanceRateLimiter, enhanceProfessionalSummary);
aiRouter.post('/enhance-job-desc', protect, enhanceRateLimiter, enhanceJobDescription);
aiRouter.post('/upload-resume', protect, uploadResume);
aiRouter.post('/tailor-resume', protect, tailorRateLimiter, tailorResume);

// ATS Score Checker routes — protect first, then quota check
aiRouter.post('/ats-score', protect, atsRateLimiter, runAtsScan);
aiRouter.get('/ats-score/:resumeId', protect, getScanHistory);

// Cover Letter routes — generation is quota-limited for free tier
aiRouter.post('/generate-cover-letter', protect, coverLetterRateLimiter, generateCoverLetter);
aiRouter.get('/cover-letter/:resumeId', protect, getCoverLetterHistory);
aiRouter.delete('/cover-letter/:letterId', protect, deleteCoverLetter);

// Interview Prep routes — generation is quota-limited for free tier
aiRouter.post('/interview-questions', protect, interviewRateLimiter, generateInterviewQuestions);
aiRouter.get('/interview-questions/:resumeId', protect, getInterviewHistory);

export default aiRouter;