import express from "express";
import {
  deleteProfile,
  login,
  logout,
  me,
  register,
} from "../controllers/user.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
const router = express.Router();

// Register User
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isAuthenticatedUser, me);
router.post("/delete_profile", isAuthenticatedUser, deleteProfile);


export default router;
