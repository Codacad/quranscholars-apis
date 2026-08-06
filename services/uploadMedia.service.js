import { uploadToR2 } from "../config/R2.js"
import { optimizeImage } from './optimizeImage.service.js'
import RecordedCourse from "../models/recorded-course/recorded-course.model.js";
import fs from "node:fs/promises";
export async function thumbailUploadService(file, courseId) {
    const { path } = file
    try {
        const optimizedImageBuffer = await optimizeImage(path)
        const key = await uploadToR2({
            key: `courses/${courseId}/thumbnail.webp`,
            body: optimizedImageBuffer,
            contentType: "image/webp",
        })
        return { path: key }
    } finally {
        try {
            await fs.unlink(file?.path);
        } catch (cleanupError) {
            console.error("Failed to clean up temp file:", cleanupError)
        }
    }
}