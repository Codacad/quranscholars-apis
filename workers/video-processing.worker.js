import { Worker } from "bullmq";
import { workerRedisConnection } from "../config/worker.redis.js";
import { trailerVideoProcessService } from "../services/trailer-video-process.service.js";
const worker = new Worker(
    'video-queue',
    async (job) => {
        const { sourceKey, courseId } = job.data
        switch (job.name) {
            case 'process-trailer-video':
                console.log(`Trailer video job started ${job.id} and it's data is`, job.data)
                await trailerVideoProcessService({ courseId, sourceKey, jobId: job.id });
                break
            case 'process-lesson-video':
                console.log(`Lesson video job tarted ${job.id} and it's data is ${job.data}`)
                break
            default:
                throw new Error('Unknown video Job ', job.name)
        }
    },
    {
        connection: workerRedisConnection,
        concurrency: 1
    }
)

worker.on('completed', (job) => {
    console.log(`Job ${job.name} is completed`)
})
worker.on('failed', (job, err) => {
    console.log(`Job ${job.name} is failed`, err)
})