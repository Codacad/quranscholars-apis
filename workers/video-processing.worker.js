import { Worker } from "bullmq";
import { workerRedisConnection } from "../config/worker.redis.js";
import { trailerVideoProcessService } from "../services/trailer-video-process.service.js";
import { dbCOnnection } from "../db.connection.js";
import dns from 'dns';
import fs from 'fs/promises';
import path from 'path';
import RecordedCourse from '../models/recorded-course/recorded-course.model.js';
import { configDotenv } from "dotenv";
configDotenv();
dns.setServers(['1.1.1.1', '8.8.8.8']);
await dbCOnnection();
const worker = new Worker(
    'video-queue',
    async (job) => {
        const { sourceKey, courseId, instructorId } = job.data;
        switch (job.name) {
            case 'process-trailer-video':
                try {
                    console.log(`Job ${job.id} is in progress, may take some time`);
                    const { result, hlsUploadResponse, videoMetadata } = await trailerVideoProcessService({ courseId, sourceKey, jobId: job.id, instructorId });
                    await RecordedCourse.findByIdAndUpdate(
                        courseId,
                        {
                            $set: {
                                "trailerVideo.hls.masterKey": hlsUploadResponse.masterKey,
                                "trailerVideo.hls.qualities": result.qualities,
                                "trailerVideo.status": "COMPLETED",
                                "trailerVideo.duration": videoMetadata.duration
                            }
                        },
                        {
                            returnDocument: 'after',
                            runValidators: true
                        }
                    )
                    
                    await fs.rm(result.outputDir, {
                        recursive: true,
                        force: true
                    });

                } catch (error) {
                    await RecordedCourse.findByIdAndUpdate(courseId, {
                        $set: {
                            'trailerVideo.status': "FAILED"
                        }
                    });
                    throw error;
                }
                break
            case 'process-lesson-video':
                console.log(`Lesson video job tarted ${job.id} and it's data is ${job.data}`);
                break
            default:
                throw new Error('Unknown video Job ', job.name);
        }
    },
    {
        connection: workerRedisConnection,
        concurrency: 1
    }
)

worker.on('completed', async (job) => {
    console.log(`Job ${job.id} is completed`)
})
worker.on('failed', async (job, err) => {
    console.error(`Job ${job.name} is failed`)
    console.error(err.message);
    console.error(err.ffmpegOutput)
})

const shutdown = async (signal) => {
    console.log(`${signal} is recieved`)
    console.log('Working is shutting down')

    await worker.close()

    console.log('Worker closed')

    process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))