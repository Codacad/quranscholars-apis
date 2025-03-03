import User from "../models/user/userModel.js";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
  const { fullname, email, password } = req.body;
  console.log(req.body);
  try {
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(401).json({ message: "User already exist" });
    }
    const { ADMIN_EMAILS } = process.env;
    const adminEmails = ADMIN_EMAILS.split(",");
    const user = {
      fullname,
      email,
      password,
      role: adminEmails.includes(email) ? "admin" : "user",
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
    console.log(error);
    res.status(400).send({ message: error.message.split(":")[2] });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "Email is not regitered" });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).send({ message: "Incorrect Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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
    res.status(401).send({ error: error.message.split(":")[2] });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  return res.status(200).send({ messag: "Logged out" });
};
