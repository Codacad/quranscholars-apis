import express from "express";
import { createMessage, getMessages } from "../controllers/message.controller.js";
const router = express();

// Message
router.post("/create", createMessage)
router.get("/", getMessages)

export default router;
