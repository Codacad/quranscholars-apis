import User from "../models/user/user.model.js";
import Admission from "../models/admission/admission.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import bucket from "../firebase.js";

// Register
export const register = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).send({ message: "All fields are required" })
    }
    const normalizedEmail = email.trim().toLowerCase()
    const { ADMIN_EMAILS, ALLOW_ADMIN_SELF_REGISTER } = process.env || "";
    const adminEmails = (ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const allowAdminSelfRegister = String(ALLOW_ADMIN_SELF_REGISTER).toLowerCase() === "true";
    const user = {
      fullname,
      email,
      password,
      role:
        allowAdminSelfRegister && adminEmails.includes(normalizedEmail)
          ? "admin"
          : "user",
    };
    const userCreated = await User.create(user);
    res.status(201).send({
      message: "Regitered Successfully",
      user: {
        _id: userCreated._id,
        fullname: userCreated.fullname,
        email: userCreated.email,
        role: userCreated.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    res.status(400).json({ message: "Registration failed" });
  }
};

// Login in
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }
    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    const expiresIn = Date.now() + 60 * 60 * 1000;
    res.status(200).send({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      expires: expiresIn,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed"
    });
  }
};

// Logout
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  return res.status(200).send({ message: "Logged out" });
};

export const me = async (req, res) => {
  const expires = req.auth?.exp ? req.auth.exp * 1000 : null;
  return res.status(200).json({
    _id: req.user._id,
    fullname: req.user.fullname,
    email: req.user.email,
    role: req.user.role,
    expires,
  });
};

// Delete Profile
export const deleteProfile = async (req, res) => {
  const { _id: userId } = req.user;
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const normalizedEmail = user.email?.toLowerCase();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Password does not match!" });
    }

    if (user.profilePicture?.filename) {
      const file = bucket.file(user.profilePicture.filename);
      try {
        const [exists] = await file.exists();
        if (exists) {
          await file.delete();
          console.log("Profile picture deleted");
        } else {
          console.log("Error in deleting profile picutre");
        }
      } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: "Error deleting file" });
      }
    }

    // Delete any orphaned or linked admissions for this account.
    await Admission.deleteMany({
      $or: [{ user: userId }, { email: normalizedEmail }],
    });

    await User.findByIdAndDelete(userId);
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    res.status(200).send({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
