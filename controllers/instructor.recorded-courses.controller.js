import RecordedCourse from "../models/recorded-course/recorded-course.model.js"
export async function getAdminRecordedCourses(req, res){
    res.send({messag:'Recorded Courses'})
}
export async function createRecordedCourse(req, res) {
    res.send('Authorized')
}