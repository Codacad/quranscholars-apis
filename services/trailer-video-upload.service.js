import { generatePresignedVideoUploadUrl } from "../config/r2.js";
import path from 'path'
import RecordedCourse from "../models/recorded-course/recorded-course.model.js";
export const trailerVideoUploadService = async ({ courseId, fileName, contentType, size, userId }) => {
    const course = await RecordedCourse.findById(courseId)
    if (!course) {
        const error = new Error('Course not available, please create course first');
        error.statusCode = 404;
        throw error
    }
    if (course.createdBy.toString() != userId.toString()) {
        const error = new Error("You are not authorized to upload trailer video for this course")
        error.statusCode = 403
        throw error
    }
    if (!fileName) {
        const error = new Error('Fine name is required')
        error.statusCode = 400;
        throw error
    }
    if (!contentType) {
        const error = new Error('Content type is required')
        error.statusCode = 400;
        throw error
    }
    if (!size) {
        const error = new Error('file size is required')
        error.statusCode = 400;
        throw error;
    }
    const allowedVideoTypes = {
        "video/mp4": [".mp4"],
        "video/quicktime": [".mov"],
        "video/webm": [".webm"],
        "video/x-matroska": [".mkv"]
    };
    const extension = path.extname(fileName).toLowerCase()
    if (!allowedVideoTypes[contentType]) {
        const error = new Error('Only MP4, MOV, WEBM or MKV videos are allowed');
        error.statusCode = 400;
        throw error;
    }
    if (!allowedVideoTypes[contentType].includes(extension)) {
        const error = new Error('File extension does not match content type');
        error.statusCode = 404;
        throw error
    }

    const sourceKey = `courses/${courseId}/trailer/course-trailer${extension}`;

    const { uploadUrl } = await generatePresignedVideoUploadUrl({ sourceKey, contentType });
    if (!uploadUrl) {
        const error = new Error("Failed to generate video upload URL");
        error.statusCode = 500;
        throw error
    }

    course.trailerVideo = {
        sourceKey,
        status: "UPLOADING"
    }

    await course.save()

    return {
        uploadUrl, sourceKey
    }
}