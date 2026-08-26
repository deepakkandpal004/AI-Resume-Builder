import quotaLimiter from "./quotaLimiter.js";

export default quotaLimiter({
  feature: "coverLetter",
  limit: 3,
  unavailableMessage: "Cover letter quota service unavailable. Please try again.",
  limitMessage: "Daily cover letter limit reached.",
});
