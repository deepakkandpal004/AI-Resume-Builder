import { verifyIdToken } from "../config/firebase.js";

const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }
  try {
    const decoded = await verifyIdToken(token);
    req.userId = decoded.uid;
    next();
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
};

export default protect;
