import logger from "./logger.js";

export default function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    logger.info(
      {
        reqId: req.id,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - start,
        userId: req.userId,
      },
      "request"
    );
  });

  next();
}
