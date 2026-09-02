import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { R2 } from '../../config/r2.js'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { configDotenv } from 'dotenv'
configDotenv()
export const downloadVideoFromR2 = async ({ sourceKey, jobId }) => {
    const tempDir = path.join(
        process.cwd(),
        'uploads',
        "temp",
        "videos",
        String(jobId)
    )

    await fs.promises.mkdir(tempDir, {
        recursive: true
    })

    const extension = path.extname(sourceKey);

    const destinationPath = path.join(tempDir, `source${extension}`)

    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: sourceKey
    })
    
    const response = await R2.send(command)

    if (!response.Body) {
        throw new Error('R2 returned empty video stream')
    }

    await pipeline(
        response.Body,
        fs.createWriteStream(destinationPath)
    );

    const stats = await fs.promises.stat(destinationPath);

    return {
        destinationPath, tempDir
    }
}
