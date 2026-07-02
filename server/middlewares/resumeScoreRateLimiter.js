import User from "../models/User.js";

const DAILY_LIMIT = 5;

const usageMap = new Map();

setInterval(() => {
  const today = new Date().toISOString().slice(0, 10);
  for (const key of usageMap.keys()) {
    if (!key.includes(today)) usageMap.delete(key);
  }
}, 60 * 60 * 1000);

export default async function resumeScoreRateLimiter(req, res, next) {
  let user;
  try {
    user = await User.findById(req.userId).select("subscriptionTier");
  } catch {
    return res.status(503).json({ message: "Service unavailable. Please try again." });
  }

  if (!user) {
    return res.status(503).json({ message: "Service unavailable. Please try again." });
  }

  if (user.subscriptionTier === "premium") {
    return next();
  }

  const today = new Date().toISOString().slice(0, 10);
  const key = `${req.userId}:resume-score:${today}`;
  const count = usageMap.get(key) || 0;

  if (count >= DAILY_LIMIT) {
    return res.status(429).json({
      message: `Daily limit of ${DAILY_LIMIT} resume scores reached. Upgrade to Premium for unlimited use.`,
      quotaExhausted: true,
    });
  }

  usageMap.set(key, count + 1);
  return next();
}
