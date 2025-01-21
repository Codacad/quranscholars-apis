import express from "express";
import { login, logout, register } from "../controllers/userController.js";
const router = express();

// Register User
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);

export default router;
