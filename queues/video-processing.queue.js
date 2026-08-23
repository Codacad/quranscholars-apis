import { Queue } from "bullmq";
import { apiRedisConnection } from "../config/api.redis.js";
const videoQueue = new Queue("video-queue", {
    connection: apiRedisConnection
})

const job = await videoQueue.getJob(1)
// console.log(job)


export default videoQueue