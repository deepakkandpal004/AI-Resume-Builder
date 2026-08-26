const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const first = result.error.issues?.[0];
    return res.status(400).json({
      message: first?.message || "Invalid request payload.",
    });
  }
  req.body = result.data;
  return next();
};

export default validate;
