import quotaLimiter from "./quotaLimiter.js";

export default quotaLimiter({
  feature: "interview",
  limit: 3,
  unavailableMessage: "Interview prep service unavailable. Please try again.",
  limitMessage: "Daily limit of 3 interview question sets reached.",
});
