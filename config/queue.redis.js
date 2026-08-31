import IORedis from 'ioredis'
import { redisConfig } from './redis.config.js'

export const queueRedisConnection = new IORedis({
    ...redisConfig,
    maxRetriesPerRequest: null,
})


queueRedisConnection.on("connect", () => {
    console.log("Redis & API connection is successful")
})

queueRedisConnection.on('error', (error) => {
    console.log('Redis & API connection error', error)
})