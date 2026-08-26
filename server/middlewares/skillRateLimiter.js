import quotaLimiter from "./quotaLimiter.js";

export default quotaLimiter({
  feature: "skill",
  limit: 5,
  unavailableMessage: "Skill suggestion service unavailable. Please try again.",
  limitMessage:
    "Daily limit of 5 AI skill suggestions reached. Upgrade to Premium for unlimited use.",
});
