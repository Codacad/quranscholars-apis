import { QueueEvents } from "bullmq";
import { queueRedisConnection } from "../../config/queue.redis.js";
const videoQueueEvent = await QueueEvents('video-queue')

