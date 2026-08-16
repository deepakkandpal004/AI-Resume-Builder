import User from "../models/User.js";
import Resume from "../models/resume.js";
import AtsScore from "../models/AtsScore.js";
import { verifyIdToken } from "../config/firebase.js";

// POST /api/users/sync
// Syncs Firebase user data with MongoDB
export const syncUser = async (req, res) => {
  try {
    const { name, email, photoURL, emailVerified } = req.body;
    const firebaseUid = req.userId;

    let user = await User.findOne({ firebaseUid });

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      if (typeof emailVerified === "boolean") user.emailVerified = emailVerified;
      await user.save();
    } else {
      user = await User.findOne({ email });
      if (user) {
        user.firebaseUid = firebaseUid;
        user.name = name || user.name;
        if (typeof emailVerified === "boolean") user.emailVerified = emailVerified;
        await user.save();
      } else {
        user = await User.create({
          firebaseUid,
          name: name || email?.split("@")[0] || "User",
          email,
          emailVerified: !!emailVerified,
        });
      }
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
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
            { $sort:  { createdAt: -1 } },
            { $group: { _id: "$resumeId", atsScore: { $first: "$atsScore" }, scannedAt: { $first: "$createdAt" } } },
        ]);

        const scoreMap = Object.fromEntries(
            latestScans.map((s) => [s._id.toString(), { atsScore: s.atsScore, scannedAt: s.scannedAt }])
        );

        const enriched = resumes.map((r) => ({
            ...r,
            lastAts: scoreMap[r._id.toString()] ?? null,
        }));

        return res.status(200).json({ resumes: enriched });
    } catch (error) {
        return res.status(400).json({ message: error.message });
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
      return res.status(400).json({ message: "Your account is already premium." });
    }

    if (promoCode) {
      const normalised = promoCode.trim().toUpperCase();
      if (VALID_PROMO_CODES.length > 0 && !VALID_PROMO_CODES.includes(normalised)) {
        return res.status(400).json({ message: "Invalid promo code." });
      }
    }

    user.subscriptionTier = "premium";
    await user.save();

    return res.status(200).json({
      message: "Upgrade successful! You now have Premium access.",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
