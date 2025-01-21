import bcrypt from "bcrypt";
import User from "../models/user/userModel.js";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "User already exist" });
    }

    const user = {
      fullname,
      email,
      password,
    };

    const userCreated = await User.create(user);

    res.status(200).send({
      message: "Regitered Successfully",
      user: {
        _id: userCreated._id,
        fullname: userCreated.fullname,
        email: userCreated.email,
        role: userCreated.role,
      },
    });
  } catch (error) {
    res.status(400).send({ error: error.message.split(":")[2] });
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
      return res.statu(401).send({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
      sameSite: "none",
    });
    res
      .status(200)
      .send({
        message: "Logged in successfully",
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      });
  } catch (error) {
    res.status(400).send({ error: error.message.split(":")[2] });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  return res.status(200).send({ messag: "Logged out" });
};
