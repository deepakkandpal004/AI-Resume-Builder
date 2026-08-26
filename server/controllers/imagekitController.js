import crypto from "crypto";

// GET /api/imagekit/auth
export const getImageKitAuth = (req, res) => {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(500).json({ message: "IMAGEKIT_PRIVATE_KEY is not set" });
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 300; // valid for 5 minutes
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    return res.status(200).json({ token, expire, signature });
  } catch {
    return res.status(500).json({
      message: "Failed to generate ImageKit auth token",
    });
  }
};
