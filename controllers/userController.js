import bcrypt from "bcrypt";
import User from "../models/user/userModel.js";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";
export const register = async (req, res) => {
  const { fullName, email, createPassword, confirmPassword } = req.body;
  try {
    const isUserExist = await User.findOne({ email });
    if (!fullName || !email || !createPassword || !confirmPassword) {
      return res.send({ success: false, message: "All fields are required!" });
    }
    if (isUserExist) {
      res.status(400).json({ success: false, message: "User already exist" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedCreatePassword = await bcrypt.hash(createPassword, salt);
      const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);
      if (hashedCreatePassword !== hashedConfirmPassword) {
        return res.send({ success: false, message: "Password do not match" });
      }
      const newUser = new User({
        fullName,
        email,
        createPassword: hashedCreatePassword,
        confirmPassword: hashedConfirmPassword,
      });
      const userResponse = {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
      newUser
        .save()
        .then((user) => {
          res.status(200).json({
            success: true,
            message: "User created successfully",
            userResponse,
          });
        })
        .catch((err) => console.log(err));
    }
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.send({ success: false, message: "All fields are required!" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "Email is not registered" });
    }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    const isPasswordMatch = await bcrypt.compare(password, user.createPassword);

    if (!isPasswordMatch) {
      return res.status(404).send({ message: "Password is incorrect" });
    } else {
      generateToken(res, user._id);

      return res.status(200).send({ message: "Login Success", user });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("authToken", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.send({ message: "User logged out!" });
  } catch (error) {
    console.log(error.message);
  }
};

// Protect Routes
export const protect = async (req, res) => {
  let token = req.cookies.authToken;
  if (!token) {
    return res.status(401).send({ message: "Invalid Token" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
     res.status(200).send({ message: "Protected Content", user: decode });
  } catch (error) {
    res.status(404).send({ message: "Invalid Token" });
  }
};
