import express from "express";
import { createMessage, getMessages } from "../controllers/message.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";
const router = express.Router();

// Message
router.post("/create", createMessage);
router.get("/messages", isAuthenticatedUser, isAdmin, getMessages);

export default router;
