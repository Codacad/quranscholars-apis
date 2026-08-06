import sharp from "sharp"
export const optimizeImage = async (path) => {
    const optimizedImageBuffer = await sharp(path)
        .rotate()
        .resize({
            width: 1280,
            height: 720,
            fit: 'cover',
            position: 'center',
            withoutEnlargement: true
        })
        .webp({ quality: 80, effort: 4 })
        .toBuffer()
    return optimizedImageBuffer
}