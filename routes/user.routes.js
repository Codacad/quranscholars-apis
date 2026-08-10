import express from "express";
import {
  deleteProfile,
  login,
  logout,
  me,
  register,
} from "../controllers/user.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
import { getRecordedCourses } from "../controllers/recorded-course.controller.js";
const router = express.Router();

// Register User
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isAuthenticatedUser, me);
router.post("/delete_profile", isAuthenticatedUser, deleteProfile);

router.get('/recorded-courses', isAuthenticatedUser, getRecordedCourses)
export default router;
