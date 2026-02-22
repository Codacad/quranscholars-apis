import Course from "../models/courses/courses.model.js";
import { buildCoursePayload, validateCoursePayload } from "../utils/course.utils.js";
// Ger Courses
export async function getCourses(req, res) {
    try {
        let courses = await Course.find({}).lean();
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } catch (error) {
        console.error('Error in getting courses', error)
        return res.status(500).json({ success: false, message: 'Error to fetch courses' })
    }
}

// Create Course
export async function createCourse(req, res) {
    try {
        let instructorId = 6500000220000001;
        const coursePayload = buildCoursePayload(req.body, instructorId);
        const courseError = validateCoursePayload(coursePayload)
        const courseExists = await Course.exists({ title: coursePayload.title })
        if (courseError) {
            return res.status(400).json({
                success: false,
                message: courseError
            })
        }
        if (courseExists) {
            return res.status(409).json({ success: false, message: "Course with this title alredy exists" })
        }
        const course = new Course(coursePayload);
        await course.save()
        return res.status(201).json({
            success: true,
            data: course
        })
    } catch (error) {
        console.error("Course create error", error)
        res.status(500).json({
            success: false,
            message: "Failed to create course"
        })
    }
}
