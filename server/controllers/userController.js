import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/resume.js";
import AtsScore from "../models/AtsScore.js";

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

// Controller for user registration
// POST /api/users/register

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password (10 is the salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // return succes message
    const token = generateToken(newUser._id);
    newUser.password = undefined;

    return res
      .status(201)
      .json({ message: "User Create Successfully", token, user: newUser });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// controller for user login
// POST: api/users/login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email and password" });
    }

    // check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // return succes message
    const token = generateToken(user._id);
    user.password = undefined;

    return res.status(200).json({ message: "Login Successfully", token, user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// controller for getting user by Id
// GET: /api/users/get

export const getUserId = async (req, res) => {
  try {
    const userId = req.userId;

    // check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    //return user
    user.password = undefined;
    return res.status(200).json({user});
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// controller for getting user resumes
// GET: /api/users/resumes
// Returns each resume enriched with its latest ATS score (if any)

export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;

        const resumes = await Resume.find({ userId }).lean();

        // Fetch the most recent ATS scan for each resume in one query
        const resumeIds = resumes.map((r) => r._id);
        const latestScans = await AtsScore.aggregate([
            { $match: { resumeId: { $in: resumeIds } } },
            { $sort:  { createdAt: -1 } },
            { $group: { _id: "$resumeId", atsScore: { $first: "$atsScore" }, scannedAt: { $first: "$createdAt" } } },
        ]);

        // Map resumeId → score for O(1) lookup
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
