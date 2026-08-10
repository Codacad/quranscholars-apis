import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
})
const uploadToR2 = async ({ key, body, contentType }) => {
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

export { R2, uploadToR2 }