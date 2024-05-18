import express from "express";
import { createMessage } from "../controllers/messageController.js";
const router = express();

// Message
router.post("/create", createMessage)

export default router;
