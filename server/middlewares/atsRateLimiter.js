import User from "../models/User.js";
import AtsScore from "../models/AtsScore.js";

/**
 * Express middleware that enforces the daily ATS scan quota for free-tier users.
 *
 * - Premium users: pass through immediately (no quota check).
 * - Free-tier users: allowed 1 successful scan per UTC calendar day.
 *   - count >= 1  → HTTP 429 { message, quotaExhausted: true }
 *   - DB error    → HTTP 503 { message }
 *
 * Requires: req.userId set by the preceding `protect` JWT middleware.
 */
export default async function atsRateLimiter(req, res, next) {
  // 1. Fetch the user's subscription tier from the database.
  let user;
  try {
    user = await User.findById(req.userId).select("subscriptionTier");
  } catch (err) {
    return res
      .status(503)
      .json({ message: "Scan quota service unavailable. Please try again." });
  }

  // Treat a missing user the same as a DB error (Requirements 6.8).
  if (!user) {
    return res
      .status(503)
      .json({ message: "Scan quota service unavailable. Please try again." });
  }

  // 2. Premium users bypass the quota check entirely (Requirements 7.1, 7.2).
  if (user.subscriptionTier === "premium") {
    return next();
  }

  // 3. Free-tier: count successful scans in the current UTC calendar day.
  const utcDayStart = new Date();
  utcDayStart.setUTCHours(0, 0, 0, 0);

  let count;
  try {
    count = await AtsScore.countDocuments({
      userId: req.userId,
      createdAt: { $gte: utcDayStart },
    });
  } catch (err) {
    return res
      .status(503)
      .json({ message: "Scan quota service unavailable. Please try again." });
  }

  // 4. Enforce the quota: 1 scan per UTC day (Requirements 6.1–6.3).
  if (count >= 1) {
    return res
      .status(429)
      .json({ message: "Daily scan limit reached.", quotaExhausted: true });
  }

  // 5. Quota not yet exhausted — allow the request to proceed.
  return next();
}
