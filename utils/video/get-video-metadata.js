import { spawn } from 'child_process'
import ffprobeStatic from 'ffprobe-static'

const FFPROBE_BINARY = ffprobeStatic.path || 'ffprobe'

export const getVideoMetadata = async ({ inputUrl }) => {
    if (!inputUrl) {
        throw new Error('Valid input url is required')
    }
    return new Promise((resolve, reject) => {
        const ffprobe = spawn(FFPROBE_BINARY, [
            "-v",
            "error",

            "-show_entries",
            "stream=codec_type,width,height,r_frame_rate:format=duration",

            "-of",
            "json",

            inputUrl
        ])

        let stdout = "";
        let stderr = "";

        ffprobe.stdout.on("data", async (data) => {
            stdout += data.toString()
        })

        ffprobe.stderr.on('data', async (data) => {
            stderr += data.toString()
        })

        ffprobe.on("error", (error) => {
            reject(error);
        });

        ffprobe.on('close', (code) => {
            if (code != 0) {
                const error = new Error(`FFprobe exited with code ${code}`,)
                error.ffprobeOutput = stderr
                return reject(error)
            }
            try {
                const metadata = JSON.parse(stdout)
                const stream = metadata.streams?.find((stream) => stream.codec_type === "video")

                if (!stream) {
                    throw new Error("no video stream found")
                }

                const [numerator, denominator] = stream.r_frame_rate.split("/").map(Number)
                if (!numerator || !denominator) {
                    throw new Error("invalid video frame rate")
                }
                const fps = numerator / denominator
                return resolve({
                    width: stream.width,
                    height: stream.height,
                    fps,
                    duration: Number(metadata.format?.duration),
                    hasAudio: metadata.streams?.some((stream) => stream.codec_type === "audio") ?? false
                })
            } catch (error) {
                reject(error)
            }
        })
    })
}
