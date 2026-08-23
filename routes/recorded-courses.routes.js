import { Router } from "express";
import { recordedCourseValidationMiddleware } from "../middlewares/recorded-course.validation.middleware.js";
import { createRecordedCourseSchema } from '../validation/recorded-courses.validation.js'
import { getRecordedCourses, createRecordedCourse, uploadTrailerVideo, processTrailerVideo } from "../controllers/recorded-courses.controller.js";

const router = Router()

router.get('/recorded-courses', getRecordedCourses)
router.post('/recorded-courses', recordedCourseValidationMiddleware(createRecordedCourseSchema), createRecordedCourse)

router.post('/recorded-course/:courseId/trailer/upload', uploadTrailerVideo)
router.post('/recorded-course/:courseId/trailer/process', processTrailerVideo)

export default router