import quotaLimiter from "./quotaLimiter.js";

/**
 * Daily quota for the expensive AI resume-import endpoint
 * (PDF text → Groq parse → new Resume doc).
 */
export default quotaLimiter({
  feature: "resumeImport",
  limit: 10,
  unavailableMessage: "Resume import service unavailable. Please try again.",
  limitMessage: "Daily resume import limit reached. Please try again tomorrow.",
});
