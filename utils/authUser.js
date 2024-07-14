import jwt from "jsonwebtoken";
import User from "../models/user/userModel.js";

const protect = async (req, res) => {
  let token;
  token = req.cookies.authToken;
  if (!token) {
    res.status(401).send({ message: "Invalid Token" });
  } else {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.userId).select("-createPassword");
    res.send(req.user);
  }
};

export { protect };
