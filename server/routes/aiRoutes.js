import express from "express"
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume, tailorResume, generateCoverLetter, getCoverLetterHistory, deleteCoverLetter, generateInterviewQuestions, getInterviewHistory, scoreResume, rewriteBullets, suggestSkills } from "../controllers/aiController.js";
import { runAtsScan, getScanHistory } from "../controllers/atsController.js";
import protect from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import atsRateLimiter from "../middlewares/atsRateLimiter.js";
import coverLetterRateLimiter from "../middlewares/coverLetterRateLimiter.js";
import interviewRateLimiter from "../middlewares/interviewRateLimiter.js";
import { enhanceRateLimiter, tailorRateLimiter } from "../middlewares/aiEnhanceRateLimiter.js";
import resumeScoreRateLimiter from "../middlewares/resumeScoreRateLimiter.js";
import skillRateLimiter from "../middlewares/skillRateLimiter.js";
import uploadResumeRateLimiter from "../middlewares/uploadResumeRateLimiter.js";
import {
  enhanceSummarySchema,
  enhanceJobDescSchema,
  rewriteBulletsSchema,
  uploadResumeSchema,
  tailorResumeSchema,
  suggestSkillsSchema,
  scoreResumeSchema,
  coverLetterSchema,
  interviewQuestionsSchema,
  atsScanSchema,
} from "../validators/aiSchemas.js";

const aiRouter = express.Router();

aiRouter.post('/enhance-pro-sum', protect, validate(enhanceSummarySchema), enhanceRateLimiter, enhanceProfessionalSummary);
aiRouter.post('/enhance-job-desc', protect, validate(enhanceJobDescSchema), enhanceRateLimiter, enhanceJobDescription);
aiRouter.post('/upload-resume', protect, validate(uploadResumeSchema), uploadResumeRateLimiter, uploadResume);
aiRouter.post('/tailor-resume', protect, validate(tailorResumeSchema), tailorRateLimiter, tailorResume);

aiRouter.post('/ats-score', protect, validate(atsScanSchema), atsRateLimiter, runAtsScan);
aiRouter.get('/ats-score/:resumeId', protect, getScanHistory);

aiRouter.post('/generate-cover-letter', protect, validate(coverLetterSchema), coverLetterRateLimiter, generateCoverLetter);
aiRouter.get('/cover-letter/:resumeId', protect, getCoverLetterHistory);
aiRouter.delete('/cover-letter/:letterId', protect, deleteCoverLetter);

aiRouter.post('/interview-questions', protect, validate(interviewQuestionsSchema), interviewRateLimiter, generateInterviewQuestions);
aiRouter.get('/interview-questions/:resumeId', protect, getInterviewHistory);

aiRouter.post('/score-resume', protect, validate(scoreResumeSchema), resumeScoreRateLimiter, scoreResume);

aiRouter.post('/rewrite-bullets', protect, validate(rewriteBulletsSchema), enhanceRateLimiter, rewriteBullets);

aiRouter.post('/suggest-skills', protect, validate(suggestSkillsSchema), skillRateLimiter, suggestSkills);

export default aiRouter;
