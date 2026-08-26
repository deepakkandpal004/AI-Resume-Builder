import User from "../models/User.js";
import { claimQuota, refundQuota } from "../utils/quota.js";

/**
 * Factory for daily free-tier quota middleware backed by the atomic
 * UsageCounter collection.
 *
 * - Premium users bypass the check entirely.
 * - Free tier: each request atomically claims one unit; claims beyond
 *   `limit` are rolled back and rejected with 429 + quotaExhausted.
 * - If the request finishes with an error status (validation failure,
 *   AI outage, etc.) the claim is refunded — failed generations don't
 *   consume the daily quota.
 *
 * Config:
 *   feature      — UsageCounter feature key (e.g. "ats", "coverLetter")
 *   limit        — max free-tier uses per UTC day
 *   unavailableMessage — 503 body when the quota service errors
 *   limitMessage — 429 body when the quota is exhausted
 */
export default function quotaLimiter({ feature, limit, unavailableMessage, limitMessage }) {
  return async function quotaLimiterMiddleware(req, res, next) {
    let user;
    try {
      user = await User.findOne({ firebaseUid: req.userId }).select("subscriptionTier");
    } catch {
      return res.status(503).json({ message: unavailableMessage });
    }

    if (!user) {
      return res.status(503).json({ message: unavailableMessage });
    }

    if (user.subscriptionTier === "premium") {
      return next();
    }

    let used;
    try {
      used = await claimQuota(req.userId, feature);
    } catch {
      return res.status(503).json({ message: unavailableMessage });
    }

    if (used > limit) {
      // Roll back the over-limit claim so the counter reflects real usage.
      try {
        await refundQuota(req.userId, feature);
      } catch {
        // non-fatal — worst case the counter reads one high until midnight UTC
      }
      return res.status(429).json({ message: limitMessage, quotaExhausted: true });
    }

    // Auto-refund when the request ends in an error response.
    if (typeof res.on === "function") {
      res.on("finish", () => {
        if (res.statusCode >= 400) {
          refundQuota(req.userId, feature).catch(() => {});
        }
      });
    }

    return next();
  };
}
