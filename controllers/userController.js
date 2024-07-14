import bcrypt from "bcrypt";
import User from "../models/user/userModel.js";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";
export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const userExist = await User.findOne({ email });
  if (!userExist) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({ fullName, email, password: hashedPassword });
      await newUser.save();
      const token = await jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      res.cookie("authToken", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      const user = {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
      res.status(201).json({ message: "Registered successfully.", user });
    } catch (error) {
      res.status(400).json({ message: "Something Wend Wrong" });
    }
  } else {
    res.status(400).json({ message: "Email already exists." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
};

export const logout = async (req, res) => {
  res.send("Logout");
};

// Protect Routes
export const protect = async (req, res) => {
  res.send("Protected Routes");
};
