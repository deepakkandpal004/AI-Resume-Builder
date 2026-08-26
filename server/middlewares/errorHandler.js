const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Multer upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File too large. Maximum size is 2 MB." });
    }
    return res.status(400).json({ message: "File upload rejected." });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed" });
  }

  if (err.name === "UnauthorizedError" || err.status === 401) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate entry" });
  }

  if (err.status === 404) {
    return res.status(404).json({ message: "Not found" });
  }

  // Only echo messages for errors we tagged ourselves (4xx); never leak internals on 5xx
  const status =
    typeof err.status === "number" && err.status >= 400 && err.status < 500
      ? err.status
      : 500;
  res
    .status(status)
    .json({ message: status === 500 ? "Internal server error" : err.message });
};

export default errorHandler;
