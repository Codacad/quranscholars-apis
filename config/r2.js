import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from 'fs'

// R2 S3 compatible client
const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
})

// Upload thumbnail
const uploadThumbnailToR2 = async ({ key, body, contentType }) => {
    const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
    }
    const command = new PutObjectCommand(uploadParams)
    await R2.send(command)
    return key
}

// Genearte the url to upload the video
const generatePresignedVideoUploadUrl = async ({ sourceKey, contentType, expiresIn = 900 }) => {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: sourceKey,
        ContentType: contentType
    })
    const uploadUrl = await getSignedUrl(R2, command, {
        expiresIn
    })
    return { uploadUrl, sourceKey }
}


// Get R2 Obeject/video details
const getR2ObjectHead = async (sourceKey) => {
    const command = new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: sourceKey
    })
    const trailerVideoMetadata = await R2.send(command)
    return trailerVideoMetadata
}

// Upload HSL to R2
const uploadHlsToR2 = async ({ filePath, key, contentType }) => {
    if (!filePath) {
        throw new Error("File path not found");
    }
    if (!key) {
        throw new Error("Key is not found")
    }

    const fileStream = fs.createReadStream(filePath)

    const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Body: fileStream,
        Key: key,
        ContentType: contentType
    }
    const command = new PutObjectCommand(uploadParams)

    await R2.send(command)

    return {
        key
    }

}

export { R2, uploadThumbnailToR2, generatePresignedVideoUploadUrl, getR2ObjectHead, uploadHlsToR2 }