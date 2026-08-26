import { verifyIdToken } from "../config/firebase.js";
import logger from "../observability/logger.js";

const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    logger.error("[AUTH] No authorization header");
    return res.status(401).json({ message: "unauthorized" });
  }
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }
  try {
    const decoded = await verifyIdToken(token);
    req.userId = decoded.uid;
    req.firebaseUser = decoded;
    next();
  } catch (error) {
    logger.error("[AUTH] Token verification failed:", error.message);
    return res.status(401).json({ message: "unauthorized" });
  }
};

export default protect;
