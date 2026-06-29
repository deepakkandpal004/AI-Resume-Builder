import User from "../models/User.js";
import CoverLetter from "../models/CoverLetter.js";

// Free-tier users may generate this many cover letters per UTC calendar day.
const DAILY_LIMIT = 3;

/**
 * Express middleware that enforces the daily cover-letter quota for free-tier users.
 *
 * - Premium users: pass through immediately (no quota check).
 * - Free-tier users: allowed DAILY_LIMIT generations per UTC calendar day.
 *   - count >= DAILY_LIMIT → HTTP 429 { message, quotaExhausted: true }
 *   - DB error            → HTTP 503 { message }
 *
 * Requires: req.userId set by the preceding `protect` JWT middleware.
 */
export default async function coverLetterRateLimiter(req, res, next) {
  // 1. Fetch the user's subscription tier from the database.
  let user;
  try {
    user = await User.findById(req.userId).select("subscriptionTier");
  } catch (err) {
    return res
      .status(503)
      .json({ message: "Cover letter quota service unavailable. Please try again." });
  }

  // Treat a missing user the same as a DB error.
  if (!user) {
    return res
      .status(503)
      .json({ message: "Cover letter quota service unavailable. Please try again." });
  }

  // 2. Premium users bypass the quota check entirely.
  if (user.subscriptionTier === "premium") {
    return next();
  }

  // 3. Free-tier: count generations in the current UTC calendar day.
  const utcDayStart = new Date();
  utcDayStart.setUTCHours(0, 0, 0, 0);

  let count;
  try {
    count = await CoverLetter.countDocuments({
      userId: req.userId,
      createdAt: { $gte: utcDayStart },
    });
  } catch (err) {
    return res
      .status(503)
      .json({ message: "Cover letter quota service unavailable. Please try again." });
  }

  // 4. Enforce the quota.
  if (count >= DAILY_LIMIT) {
    return res
      .status(429)
      .json({ message: "Daily cover letter limit reached.", quotaExhausted: true });
  }

  // 5. Quota not yet exhausted — allow the request to proceed.
  return next();
}
