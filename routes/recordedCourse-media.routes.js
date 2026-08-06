import { Router } from "express";
import { uploadThumbnail } from "../controllers/recordedCourse-media.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
import isInstructor from "../middlewares/isInstructor.js";
import upload from "../middlewares/upload.middleware.js";
import { checkCourseExists } from "../middlewares/recordedCourse.middleware.js";
const router = Router()

router.post(
    '/recorded-course/:courseId/thumbnail',
    isAuthenticatedUser,
    isInstructor,
    checkCourseExists,
    upload.single('thumbnail'),
    uploadThumbnail
)

export default router