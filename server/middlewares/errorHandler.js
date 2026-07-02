const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "UnauthorizedError" || err.status === 401) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate entry" });
  }

  const status = err.status || 500;
  const message = err.status ? err.message : "Internal server error";
  res.status(status).json({ message });
};

export default errorHandler;
