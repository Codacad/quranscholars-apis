import IORedis from 'ioredis'
import { redisConfig } from './redis.config.js'

export const workerRedisConnection = new IORedis({
    ...redisConfig,
    maxRetriesPerRequest: null,
})

workerRedisConnection.on("connect", () => {
    console.log("Redis & Worker connection is successful")
})

workerRedisConnection.on('error', (error) => {
    console.log('Redis & Worker connection error', error)
})