

import { R2 } from '../../config/r2.js'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { configDotenv } from 'dotenv'
configDotenv()

export const streamVideoFromR2 = async ({ sourceKey }) => {

    if (!sourceKey) {
        throw new Error("Source key is required")
    }

    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: sourceKey
    })

    const response = await R2.send(command)

    if (!response.Body) {
        throw new Error('R2 object stream is not available')
    }

    return response.Body

}