import { downloadVideoFromR2 } from "../utils/video/download-video-from-r2.js";
import path from "path";
import { runFfmpeg } from "../utils/video/run-ffmpeg.js";
export const trailerVideoProcessService = async ({ courseId, sourceKey, jobId }) => {
    console.log(courseId, sourceKey, jobId)
    const { destinationPath, tempDir } = await downloadVideoFromR2({ sourceKey, jobId })
    console.log("Destination Path => ", destinationPath)
    console.log("temporary Path => ", tempDir)

    const hlsDir = path.join(tempDir, "hls")

   const result = await runFfmpeg({ inputPath: destinationPath, outputDir: hlsDir })
   console.log(result.masterPlaylistPath)
}