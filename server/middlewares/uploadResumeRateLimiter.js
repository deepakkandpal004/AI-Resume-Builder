/**
 * In-memory per-user sliding-window limiter for the expensive AI resume-import
 * endpoint (PDF text → Groq parse → new Resume doc).
 *
 * This is per-instance abuse protection (fine for a single Render instance),
 * not a distributed hard quota. The real cost control is the resumeText
 * length cap enforced in the controller.
 */
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_IMPORTS_PER_WINDOW = 10;

const hits = new Map(); // userId -> [timestamps]

// Periodically drop stale entries so the map can't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [key, stamps] of hits) {
    const fresh = stamps.filter((t) => now - t < WINDOW_MS);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }
}, WINDOW_MS).unref();

export default function uploadResumeRateLimiter(req, res, next) {
  const key = req.userId;
  if (!key) return next();

  const now = Date.now();
  const stamps = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);

  if (stamps.length >= MAX_IMPORTS_PER_WINDOW) {
    return res.status(429).json({
      message: "Too many resume imports. Please try again later.",
    });
  }

  stamps.push(now);
  hits.set(key, stamps);
  return next();
}
