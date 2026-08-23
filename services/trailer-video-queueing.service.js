import videoQueue from "../queues/video-processing.queue.js"
import { getR2ObjectHead } from "../config/r2.js"

import RecordedCourse from "../models/recorded-course/recorded-course.model.js"
export const trailerVideoQueueingService = async ({ courseId, userId }) => {
    const course = await RecordedCourse.findById(courseId);
    
    if (!course) {
        const error = new Error("Course not available");
        error.statusCode = 404
        throw error
    }

    if (course.createdBy.toString() != userId.toString()) {
        const error = new Error("You are not authorize to perform this action");
        error.statusCode = 403;
        throw error;
    }

    const { sourceKey } = course.trailerVideo || {};

    if (!sourceKey) {
        const error = new Error("Trailer video has not been uploaded");
        error.statusCode = 400;
        throw error
    }

    const r2ObjectMetadata = await getR2ObjectHead(sourceKey)

    if (!r2ObjectMetadata.ContentLength || r2ObjectMetadata.ContentLength <= 0) {
        const error = new Error("There is no uploaded video");
        error.statusCode = 400;
        throw error;
    }

    const job = await videoQueue.add('process-trailer-video', {
        courseId: courseId.toString(),
        sourceKey
    })

    course.trailerVideo.status = "QUEUED";
    course.trailerVideo.processingJobId = job.id   

    await course.save();

    return {
        status:"QUEUED",
        jobId:job.id
    }
}
