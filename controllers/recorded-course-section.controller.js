import RecordedCourse from "../models/recorded-course/recorded-course.model.js";
import { videoQueue } from "../queues/video-processing.queue.js";
export async function createSection(req, res, next) {
    try {
        const { courseId } = req.params
        const course = await RecordedCourse.findById(courseId)
        if (!course) {
            const error = new Error('Course not found, please create course')
            error.statusCode = 404
            next(error)
        }
        
    } catch (error) {

    }
}