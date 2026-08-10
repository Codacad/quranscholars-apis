import { Router } from "express";
import { getRecordedCourses } from "../controllers/recorded-course.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
const router = Router()

router.get('/', isAuthenticatedUser, getRecordedCourses)

export default router