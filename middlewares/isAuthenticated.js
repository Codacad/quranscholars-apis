import User from "../models/user/userModel.js";
import jwt from "jsonwebtoken";
export const isAuthenticatedUser = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    req.expires = Date.now() + 60 * 60 * 1000;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
