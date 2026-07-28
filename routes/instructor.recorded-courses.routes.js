import { Router } from "express";
import { getAdminRecordedCourses,  createRecordedCourse} from "../controllers/instructor.recorded-courses.controller.js";
const router = Router()

router.get('/recorded-courses', getAdminRecordedCourses)
router.post('/recorded-courses', createRecordedCourse)

export default router