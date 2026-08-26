import quotaLimiter from "./quotaLimiter.js";

export default quotaLimiter({
  feature: "ats",
  limit: 1,
  unavailableMessage: "Scan quota service unavailable. Please try again.",
  limitMessage: "Daily scan limit reached.",
});
