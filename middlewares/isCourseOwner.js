import Course from "../models/course.model.js";
export default async function isCourseOwner(req, res, next) {
    const { courseId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!req.user) {
            const error = new Error('Authentication is required')
            error.statusCode = 401;
            return next(error)
        }

        if (!course) {
            const error = new Error('Course not found')
            error.statusCode = 404;
            return next(error)
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            const error = new Error('You are not the owner of this course')
            error.statusCode = 403;
            return next(error)
        }
        req.course = course;
        return next()
    } catch (error) {
        error.statusCode = 500;
        return next(error)
    }
}