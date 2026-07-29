import { Router } from "express";
import { recordedCourseValidationMiddleware } from "../middlewares/recorded-course.validation.middleware.js";
import { createRecordedCourseSchema } from '../validation/recorded-courses.validation.js'
import { getAdminRecordedCourses, createRecordedCourse } from "../controllers/instructor.recorded-courses.controller.js";
const router = Router()

router.get('/recorded-courses', getAdminRecordedCourses)
router.post('/recorded-courses', recordedCourseValidationMiddleware(createRecordedCourseSchema), createRecordedCourse)

export default router