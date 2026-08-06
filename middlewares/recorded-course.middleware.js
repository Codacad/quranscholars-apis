import RecordedCourse from "../models/recorded-course/recorded-course.model.js";
import mongoose from "mongoose";
export async function checkCourseExists(req, res, next) {
    try {
        const { courseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            })
        }
        const course = await RecordedCourse.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        }
        if (req.user.role === 'instructor' && course.instructor.toString() !== req.user._id.toString) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action"
            })
        }
        req.course = course;
        next()
    } catch (error) {
        next(error)
    }
}