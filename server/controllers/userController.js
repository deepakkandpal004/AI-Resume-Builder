import User from "../models/User.js";
import Resume from "../models/resume.js";
import AtsScore from "../models/AtsScore.js";
import { verifyIdToken } from "../config/firebase.js";

// POST /api/users/sync
// Syncs Firebase user data with MongoDB.
// Email + verification status come from the verified Firebase token claims —
// never from the request body. Linking to an existing account (same email)
// is only allowed when the token proves the email is verified.
export const syncUser = async (req, res) => {
  try {
    const { name, photoURL } = req.body;
    const firebaseUid = req.userId;
    const tokenEmail = req.firebaseUser?.email || null;
    const emailVerified = req.firebaseUser?.email_verified === true;

    let user = await User.findOne({ firebaseUid });

    if (user) {
      user.name = name || user.name;
      if (tokenEmail) user.email = tokenEmail;
      user.emailVerified = emailVerified;
      await user.save();
    } else {
      user = await User.findOne({ email: tokenEmail });

      if (user) {
        if (!emailVerified) {
          return res.status(403).json({
            message: "This email belongs to an existing account. Verify your email before signing in.",
          });
        }
        user.firebaseUid = firebaseUid;
        user.name = name || user.name;
        user.emailVerified = true;
        await user.save();
      } else {
        user = await User.create({
          firebaseUid,
          name: name || tokenEmail?.split("@")[0] || "User",
          email: tokenEmail,
          emailVerified,
        });
      }
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("syncUser failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/users/data
// Gets current user data
export const getUserId = async (req, res) => {
  try {
    const firebaseUid = req.userId;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("getUserId failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/users/resumes
// Returns each resume enriched with its latest ATS score
export const getUserResumes = async (req, res) => {
  try {
    const firebaseUid = req.userId;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const resumes = await Resume.find({ userId: user._id }).lean();

    const resumeIds = resumes.map((r) => r._id);
    const latestScans = await AtsScore.aggregate([
      { $match: { resumeId: { $in: resumeIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$resumeId",
          atsScore: { $first: "$atsScore" },
          scannedAt: { $first: "$createdAt" },
        },
      },
    ]);

    const scoreMap = Object.fromEntries(
      latestScans.map((s) => [
        s._id.toString(),
        { atsScore: s.atsScore, scannedAt: s.scannedAt },
      ]),
    );

    const enriched = resumes.map((r) => ({
      ...r,
      lastAts: scoreMap[r._id.toString()] ?? null,
    }));

    return res.status(200).json({ resumes: enriched });
  } catch (error) {
    console.error("getUserResumes failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /api/users/upgrade
// Upgrades a user to premium tier
const VALID_PROMO_CODES = (process.env.PROMO_CODES || "")
  .split(",")
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);

export const upgradeUser = async (req, res) => {
  try {
    const firebaseUid = req.userId;
    const { promoCode } = req.body;

    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.subscriptionTier === "premium") {
      return res
        .status(400)
        .json({ message: "Your account is already premium." });
    }

    if (!VALID_PROMO_CODES.length || !promoCode) {
      return res.status(400).json({ message: "Invalid promo code." });
    }

    const normalised = promoCode.trim().toUpperCase();
    if (!VALID_PROMO_CODES.includes(normalised)) {
      return res.status(400).json({ message: "Invalid promo code." });
    }

    user.subscriptionTier = "premium";
    await user.save();

    return res.status(200).json({
      message: "Upgrade successful! You now have Premium access.",
      user,
    });
  } catch (error) {
    console.error("upgradeUser failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
