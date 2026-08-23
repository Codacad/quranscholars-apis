import { uploadThumbnailToR2 } from "../config/r2.js"
import { optimizeImage } from './optimize-image.service.js'
import { validateImageFile } from '../validation/image-file.validation.js'
import fs from "node:fs/promises";
export async function thumbnailUploadService(file, courseId) {
    const { path } = file
    try {
        await validateImageFile(path)
        const optimizedImageBuffer = await optimizeImage(path)
        const key = await uploadThumbnailToR2({
            key: `courses/${courseId}/thumbnail-${Date.now()}.webp`,
            body: optimizedImageBuffer,
            contentType: "image/webp",
        })
        return { thumbnail: key }
    } finally {
        try {
            await fs.unlink(file?.path);
        } catch (cleanupError) {
            console.error("Failed to clean up temp file:", cleanupError)
        }
    }
}