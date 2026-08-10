import RecordedCourse from "../models/recorded-course/recorded-course.model.js"
export async function getRecordedCourses(req, res, next) {
    try {
        const recordedCourses = await RecordedCourse.find({ published: true, status: 'Published' })
        if (recordedCourses.length <= 0) {
            const error = new Error("Courses are not available")
            error.statusCode = 404;
            return next(error)
        }
        return res.json(recordedCourses)
    } catch (error) {
        next(error)
    }
}

