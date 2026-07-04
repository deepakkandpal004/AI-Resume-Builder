import User from "../models/User.js";

const SKILL_SUGGEST_DAILY_LIMIT = 5;

const usageMap = new Map();

setInterval(() => {
  const today = new Date().toISOString().slice(0, 10);
  for (const key of usageMap.keys()) {
    if (!key.includes(today)) usageMap.delete(key);
  }
}, 60 * 60 * 1000);

const skillRateLimiter = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userId).select("subscriptionTier");
  } catch {
    return res.status(503).json({ message: "Skill suggestion service unavailable. Please try again." });
  }

  if (!user) {
    return res.status(503).json({ message: "Skill suggestion service unavailable. Please try again." });
  }

  if (user.subscriptionTier === "premium") {
    return next();
  }

  const today = new Date().toISOString().slice(0, 10);
  const key = `${req.userId}:skill:${today}`;
  const count = usageMap.get(key) || 0;

  if (count >= SKILL_SUGGEST_DAILY_LIMIT) {
    return res.status(429).json({
      message: `Daily limit of ${SKILL_SUGGEST_DAILY_LIMIT} AI skill suggestions reached. Upgrade to Premium for unlimited use.`,
      quotaExhausted: true,
    });
  }

  usageMap.set(key, count + 1);
  return next();
};

export default skillRateLimiter;
