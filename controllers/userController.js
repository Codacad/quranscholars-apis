import bcrypt from "bcrypt";
import User from "../models/user/userModel.js";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
  res.send("Register")
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  res.send("Login")
};

export const logout = async (req, res) => {
  res.send("Logout");
};

