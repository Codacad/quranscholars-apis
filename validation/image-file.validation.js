import sharp from 'sharp';

export async function validateImageFile(filePath) {
    const metadata = await sharp(filePath).metadata()

    const allowedFormats = ['jpeg', 'png', 'webp'];

    if (!allowedFormats.includes(metadata.format)) {
        const error = new Error(`Invalid image format. Allowed formats: ${allowedFormats.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    return metadata;
}