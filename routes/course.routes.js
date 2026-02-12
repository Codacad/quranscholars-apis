import Router from 'express'
import { getCourses } from '../controllers/course.controller.js';
const router = Router()

router.get('/courses', getCourses);

export default router;