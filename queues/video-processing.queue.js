import { Queue } from "bullmq";
import { queueRedisConnection } from "../config/queue.redis.js";
const videoQueue = new Queue("video-queue", {
    connection: queueRedisConnection
})

export default videoQueue