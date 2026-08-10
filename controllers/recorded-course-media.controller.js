import { thumbnailUploadService } from "../services/upload-media.service.js";
import fs from "node:fs/promises";
import RecordedCourse from '../models/recorded-course/recorded-course.model.js'
export async function uploadThumbnail(req, res, next) {
    try {
        const { courseId } = req.params;
        if (!req.file) {
            const error = new Error("Thumbnail is required")
            error.statusCode = 400;
            return next(error);
        }
        const { thumbnail } = await thumbnailUploadService(req.file, courseId);
        await RecordedCourse.findByIdAndUpdate(courseId, { $set: { thumbnail } }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            message: "Thumbnail uploaded successfully",
            data: {
                courseId,
                thumbnailKey: thumbnail
            }
        })
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            error.message = "File size exceeds the limit of 3MB"
        }
        next(error)
    }
}