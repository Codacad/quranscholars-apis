import express from "express";
import { deleteProfile, login, logout, register } from "../controllers/userController.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
const router = express();

// Register User
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/delete_profile", isAuthenticatedUser, deleteProfile);


export default router;
