import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export const runFfmpeg = async ({ inputPath, outputDir }) => {
    await fs.mkdir(outputDir, {
        recursive: true
    });

    const masterPlaylistPath = path.join(
        outputDir,
        'master.m3u8'
    );

    return new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
            "-i",
            inputPath,

            // video
            "-c:v",
            "libx264",

            // audio
            "-c:a",
            "aac",

            //hls
            "-f",
            "hls",

            // hls time
            "-hls_time",
            "6",

            // hls playlist type
            "-hls_playlist_type",
            "vod",

            // hls segment filename
            "-hls_segment_filename",
            path.join(outputDir, "segment_%3d.ts"),

            masterPlaylistPath
        ]);

        ffmpeg.stderr.on('data', (data) => {
            console.log(data.toString())
        });

        ffmpeg.on('error', (error) => {
            reject(error)
        })

        ffmpeg.on('close', (code) => {

            if (code !== 0) {
                return reject(new Error(`FFmpeg existed with code ${code}`))
            }

            resolve(
                {
                    outputDir,
                    masterPlaylistPath
                }
            )
        })
    })
}