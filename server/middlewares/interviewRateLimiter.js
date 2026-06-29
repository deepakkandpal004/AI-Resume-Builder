import User from "../models/User.js";

// Free-tier users may generate this many interview question sets per UTC calendar day.
const DAILY_LIMIT = 3;

/**
 * Express middleware that enforces the daily interview question quota for free-tier users.
 *
 * - Premium users: pass through immediately (no quota check).
 * - Free-tier users: allowed DAILY_LIMIT generations per UTC calendar day,
 *   tracked via a simple in-memory Map keyed by userId + UTC date string.
 *
 * Requires: req.userId set by the preceding `protect` JWT middleware.
 */

// In-memory store: "userId:YYYY-MM-DD" → count
const usageMap = new Map();

// Clean up old keys every hour to prevent unbounded memory growth
setInterval(() => {
  const today = new Date().toISOString().slice(0, 10);
  for (const key of usageMap.keys()) {
    if (!key.endsWith(today)) usageMap.delete(key);
  }
}, 60 * 60 * 1000);

export default async function interviewRateLimiter(req, res, next) {
  // 1. Fetch the user's subscription tier from the database.
  let user;
  try {
    user = await User.findById(req.userId).select("subscriptionTier");
  } catch (err) {
    return res
      .status(503)
      .json({ message: "Interview prep service unavailable. Please try again." });
  }

  if (!user) {
    return res
      .status(503)
      .json({ message: "Interview prep service unavailable. Please try again." });
  }

  // 2. Premium users bypass the quota check entirely.
  if (user.subscriptionTier === "premium") {
    return next();
  }

  // 3. Free-tier: count generations today using in-memory Map.
  const today = new Date().toISOString().slice(0, 10);
  const key = `${req.userId}:${today}`;
  const count = usageMap.get(key) || 0;

  // 4. Enforce the quota.
  if (count >= DAILY_LIMIT) {
    return res.status(429).json({
      message: `Daily limit of ${DAILY_LIMIT} interview question sets reached.`,
      quotaExhausted: true,
    });
  }

  // 5. Increment count and proceed.
  usageMap.set(key, count + 1);
  return next();
}
