import { calculateResolution } from "./calculate-resolutions.js"
export const selectVideoQualities = async ({ width, height }) => {
    const availableQualities = [
        {
            quality: "1080p",
            height: 1080
        }, {
            quality: "720p",
            height: 720
        },
        {
            quality: '480p',
            height: 480
        }
    ]

    return availableQualities.filter((quality) => height >= quality.height)
        .map((quality) => {
            const resolution = calculateResolution({ sourceWidth: width, sourceHeight: height, targetHeight: quality.height })
            return {
                quality: quality.quality,
                width: resolution.width,
                height: resolution.height
            }
        })
}