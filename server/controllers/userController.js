import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/resume.js";

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
    if (!user.comparePassword(password)) {
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

export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;
        
        // return user resumes
        const resumes = await Resume.find({userId})

        return res.status(200).json({resumes})
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
