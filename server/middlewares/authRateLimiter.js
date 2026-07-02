const ipMap = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipMap) {
    if (now - entry.start > WINDOW_MS) ipMap.delete(ip);
  }
}, 60 * 1000);

const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  let entry = ipMap.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { count: 0, start: now };
    ipMap.set(ip, entry);
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many attempts. Please try again later.",
    });
  }

  next();
};

export default authRateLimiter;
