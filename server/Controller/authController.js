import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/User.js";

const getJwtSecret = () => process.env.JWT_SECRET || process.env.JWT_SECURE;

const signToken = (user) => {
  const secret = getJwtSecret();

  if (!secret) {
    throw new Error("JWT_SECRET or JWT_SECURE is missing in .env");
  }

  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "1d" });
};

export const register = async (req, res) => {
  try {
    const { username, password, role, fullName } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Username, password, and role are required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
      fullName: fullName || username,
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid login details" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid login details" });
    }

    res.json({
      token: signToken(user),
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    const roles = req.query.roles ? req.query.roles.split(",") : ["nurse", "doctor"];
    const staff = await User.find({ role: { $in: roles } })
      .select("_id username fullName role")
      .sort({ role: 1, fullName: 1, username: 1 });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
