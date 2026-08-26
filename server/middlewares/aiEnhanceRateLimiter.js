import quotaLimiter from "./quotaLimiter.js";

export const enhanceRateLimiter = quotaLimiter({
  feature: "enhance",
  limit: 10,
  unavailableMessage: "AI enhance service unavailable. Please try again.",
  limitMessage:
    "Daily limit of 10 AI enhancements reached. Upgrade to Premium for unlimited use.",
});

export const tailorRateLimiter = quotaLimiter({
  feature: "tailor",
  limit: 3,
  unavailableMessage: "AI tailoring service unavailable. Please try again.",
  limitMessage:
    "Daily limit of 3 resume tailoring sessions reached. Upgrade to Premium for unlimited use.",
});
