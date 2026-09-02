import { Router } from "express";
import { recordedCourseValidationMiddleware } from "../middlewares/recorded-course.validation.middleware.js";
import { createRecordedCourseSchema } from '../validation/recorded-courses.validation.js'
import { getRecordedCourses, createRecordedCourse, uploadTrailerVideo, processTrailerVideo } from "../controllers/recorded-courses.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
import isInstructor from "../middlewares/isInstructor.js";
const router = Router()

router.get('/', getRecordedCourses)
router.post('/', isAuthenticatedUser, isInstructor, recordedCourseValidationMiddleware(createRecordedCourseSchema), createRecordedCourse)

router.post('/:courseId/trailer/upload', isAuthenticatedUser, isInstructor, uploadTrailerVideo)
router.post('/:courseId/trailer/process', isAuthenticatedUser, isInstructor, processTrailerVideo)

export default router