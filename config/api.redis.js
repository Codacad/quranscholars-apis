import IORedis from 'ioredis'
import { redisConfig } from './redis.config.js'

export const apiRedisConnection = new IORedis({
    ...redisConfig,
    maxRetriesPerRequest: null,
})


apiRedisConnection.on("connect", () => {
    console.log("Redis & API connection is successful on host: ", process.env.REDIS_HOST)
})

apiRedisConnection.on('error', (error) => {
    console.log('Redis & API connection error', error)
})