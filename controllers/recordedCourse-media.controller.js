import { thumbailUploadService } from "../services/uploadMedia.service.js";
import RecordedCourse from "../models/recorded-course/recorded-course.model.js";
import fs from "node:fs/promises";
export async function uploadThumbnail(req, res, next) {
    try {
        const { courseId } = req.params;
        const { path } = await thumbailUploadService(req.file, courseId);
        const course = await RecordedCourse.findById(courseId);
        res.status(200).json({
            success: true,
            message: "Thumbnail uploaded successfully",
            path
        })
    } catch (error) {
        try {
            await fs.unlink(req.file?.path);
        } catch (cleanupError) {
            console.error("Failed to clean up temp file:", cleanupError)
        }
        if (error.code === 'LIMIT_FILE_SIZE') {
            error.message = "File size exceeds the limit of 3MB"
        }
        next(error)
    }
}