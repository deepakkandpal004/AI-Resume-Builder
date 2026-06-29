import crypto from "crypto";

// GET /api/imagekit/auth
// Generates a short-lived ImageKit upload authentication signature manually
// using Node's built-in crypto module. The ImageKit SDK v7's helper method
// incorrectly detects the runtime as non-Node and refuses to sign — so we
// replicate the exact same algorithm (HMAC-SHA1) ourselves.
//
// ImageKit auth spec:
//   token   = random UUID
//   expire  = unix timestamp (now + 30 seconds)
//   signature = HMAC-SHA1(token + expire, privateKey) as hex string
export const getImageKitAuth = (req, res) => {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(500).json({ message: "IMAGEKIT_PRIVATE_KEY is not set" });
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // valid for 40 minutes
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    return res.status(200).json({ token, expire, signature });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate ImageKit auth token",
      detail: error.message,
    });
  }
};
