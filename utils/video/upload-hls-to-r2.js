import fs from 'fs/promises';
import path from 'path';
import { uploadHlsToR2 } from '../../config/r2.js';

const HLS_CONTENT_TYPES = {
    ".m3u8": "application/vnd.apple.mpegurl",
    ".ts": "video/mp2t",
}

// Get content types
const getContentType = async (filePath) => {
    const extension = path.extname(filePath).toString()
    return (
        HLS_CONTENT_TYPES[extension] ||
        "application/octet-stream"
    );
}

// Get all files
const getAllFiles = async (directory) => {
    const entries = await fs.readdir(directory, {
        withFileTypes: true
    })

    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name)

        if (entry.isDirectory()) {
            const nestedFiles = await getAllFiles(fullPath);
            files.push(...nestedFiles)
        } else {
            files.push(fullPath)
        }
    }
    return files
}

// create R2 upload key
const createR2Key = ({ filePath, hlsDir, courseId, r2Prefix }) => {
    const relativePath = path.relative(hlsDir, filePath)
    const normalizedPath = relativePath.split(path.sep).join('/')
    return `${r2Prefix}/${normalizedPath}`;
}

// Upload to R2
export const uploadHls = async ({
    hlsDir,
    courseId,
    r2Prefix,
    concurrency = 5
}) => {
    let key;
    if (!hlsDir) {
        throw new Error("HLS directory is requried");
    }

    if (!courseId) {
        throw new Error("Course ID is required");
    }

    const files = await getAllFiles(hlsDir);

    if (!files.length) {
        throw new Error("No HLS files found")
    }

    const uploadedKeys = [];
    let currentIndex = 0;

    const uploadWorker = async () => {
        while (true) {

            const index = currentIndex++

            if (index >= files.length) {
                return;
            }

            const filePath = files[index]

            const r2key = createR2Key({
                filePath,
                hlsDir,
                r2Prefix,
                courseId,
            })

            const contentType = await getContentType(filePath)

            key = await uploadHlsToR2({
                filePath,
                key: r2key,
                contentType
            })

            uploadedKeys.push(key)
        }
    }

    const workerCount = Math.min(concurrency, files.length)

    await Promise.all(
        Array.from({ length: workerCount }, () => uploadWorker())
    )

    return {
        key,
        masterKey: `courses/${courseId}/trailer/hls/master.m3u8`,
        uploadedKeys
    }
}