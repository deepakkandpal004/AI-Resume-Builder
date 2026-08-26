import quotaLimiter from "./quotaLimiter.js";

export default quotaLimiter({
  feature: "resumeScore",
  limit: 5,
  unavailableMessage: "Service unavailable. Please try again.",
  limitMessage:
    "Daily limit of 5 resume scores reached. Upgrade to Premium for unlimited use.",
});
