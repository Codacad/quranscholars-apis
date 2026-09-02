import { downloadVideoFromR2 } from "../utils/video/download-video-from-r2.js";
import path from "path";
import { configDotenv } from "dotenv";
import { runFfmpeg, isHlsComplete } from "../utils/video/run-ffmpeg.js";
import { getVideoMetadata } from "../utils/video/get-video-metadata.js";
import RecordedCourse from "../models/recorded-course/recorded-course.model.js";
import { selectVideoQualities } from "../utils/video/select-video-qualities.js";
import { getPresignedR2SourceVideoUrl } from "../utils/video/get-presigned-r2source-video-url.js";
import { uploadHls } from "../utils/video/upload-hls-to-r2.js";
import fs from 'fs/promises'
configDotenv()
export const trailerVideoProcessService = async ({ courseId, sourceKey, jobId, instructorId }) => {

    console.time('db-find')
    const course = await RecordedCourse.findById(courseId)
    console.timeEnd('db-find')

    if (!course) {
        const error = new Error('Course not found');
        error.statusCode = 404;
        throw error
    }

    if (!course.trailerVideo) {
        const error = new Error('Trailer video not found');
        error.statusCode = 404;
        throw error
    }

    if (course.trailerVideo.status == "PROCESSING" && course.trailerVideo.processingJobId !== String(jobId)) {
        const error = new Error('Trailer video is already being processed');
        error.statusCode = 409;
        throw error
    }

    course.trailerVideo.status = 'PROCESSING'

    console.time('db-save')
    await course.save()
    console.timeEnd('db-save')

    const inputUrl = await getPresignedR2SourceVideoUrl({ sourceKey })

    const videoMetadata = await getVideoMetadata({ inputUrl });

    const qualities = await selectVideoQualities(videoMetadata)

    const destDir = path.join(
        process.cwd(),
        "uploads",
        "processed",
        "videos",
        String(courseId),
        "trailer"
    );

    const hlsDir = path.join(destDir, "hls")

    let result;

    if (await isHlsComplete(hlsDir)) {
        console.log("Hls already processed, skipping ffmpeg")

        result = {
            outputDir: hlsDir,
            masterPlaylistPath: path.join(hlsDir, 'master.m3u8'),
            qualities
        }
    } else {
        console.log('Hls not found or incomplete, starting ffmpeg')
        console.time('ffmpeg run')
        result = await runFfmpeg({ inputUrl, outputDir: hlsDir, qualities, fps: videoMetadata.fps, hasAudio: videoMetadata.hasAudio })
        console.timeEnd('ffmpeg run')
    }

    console.log(result)

    console.time('hls-upload-to-R2')
    const hlsUploadResponse = await uploadHls({
        hlsDir: result.outputDir,
        courseId,
        r2Prefix: `courses/${courseId}/trailer/hls`,
        concurrency: 10
    })
    
    console.timeEnd('hls-upload-to-R2')

    return { result, hlsUploadResponse, videoMetadata }
}
