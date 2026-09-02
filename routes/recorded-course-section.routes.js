import { Router } from "express";
import { createSection } from "../controllers/recorded-course-section.controller.js";

const router = Router()

router.post("/recorded-course/:courseId/sections", createSection)

export default router