import User from "../models/User.js";

// Free-tier users may call the enhance endpoints this many times per UTC calendar day.
const ENHANCE_DAILY_LIMIT = 10;
// Free-tier users may call the tailor-resume endpoint this many times per UTC calendar day.
const TAILOR_DAILY_LIMIT = 3;

/**
 * In-memory store: "userId:enhance:YYYY-MM-DD" → count
 *                  "userId:tailor:YYYY-MM-DD"  → count
 */
const usageMap = new Map();

// Clean up old keys every hour to prevent unbounded memory growth.
setInterval(() => {
  const today = new Date().toISOString().slice(0, 10);
  for (const key of usageMap.keys()) {
    if (!key.includes(today)) usageMap.delete(key);
  }
}, 60 * 60 * 1000);

/**
 * Express middleware that enforces the daily enhance quota for free-tier users.
 * Covers: enhance-pro-sum and enhance-job-desc.
 */
export const enhanceRateLimiter = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userId).select("subscriptionTier");
  } catch (err) {
    return res
      .status(503)
      .json({ message: "AI enhance service unavailable. Please try again." });
  }

  if (!user) {
    return res
      .status(503)
      .json({ message: "AI enhance service unavailable. Please try again." });
  }

  // Premium users bypass the quota check entirely.
  if (user.subscriptionTier === "premium") {
    return next();
  }

  const today = new Date().toISOString().slice(0, 10);
  const key = `${req.userId}:enhance:${today}`;
  const count = usageMap.get(key) || 0;

  if (count >= ENHANCE_DAILY_LIMIT) {
    return res.status(429).json({
      message: `Daily limit of ${ENHANCE_DAILY_LIMIT} AI enhancements reached. Upgrade to Premium for unlimited use.`,
      quotaExhausted: true,
    });
  }

  usageMap.set(key, count + 1);
  return next();
};

/**
 * Express middleware that enforces the daily tailor-resume quota for free-tier users.
 */
export const tailorRateLimiter = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userId).select("subscriptionTier");
  } catch (err) {
    return res
      .status(503)
      .json({ message: "AI tailoring service unavailable. Please try again." });
  }

  if (!user) {
    return res
      .status(503)
      .json({ message: "AI tailoring service unavailable. Please try again." });
  }

  // Premium users bypass the quota check entirely.
  if (user.subscriptionTier === "premium") {
    return next();
  }

  const today = new Date().toISOString().slice(0, 10);
  const key = `${req.userId}:tailor:${today}`;
  const count = usageMap.get(key) || 0;

  if (count >= TAILOR_DAILY_LIMIT) {
    return res.status(429).json({
      message: `Daily limit of ${TAILOR_DAILY_LIMIT} resume tailoring sessions reached. Upgrade to Premium for unlimited use.`,
      quotaExhausted: true,
    });
  }

  usageMap.set(key, count + 1);
  return next();
};
