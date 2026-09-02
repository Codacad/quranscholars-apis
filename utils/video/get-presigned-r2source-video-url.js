import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2 } from "../../config/r2.js";

export const getPresignedR2SourceVideoUrl = async ({ sourceKey }) => {
    if (!sourceKey) {
        throw new Error('Source key is required')
    }

    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: sourceKey
    })

    return getSignedUrl(R2, command, {
        expiresIn: 60 * 60
    })
}