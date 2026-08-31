import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';

const MAX_STDERR_LENGTH = 20_000;
const FFMPEG_BINARY = ffmpegPath || "ffmpeg";
const HLS_COMPLETE_MARKER = '.hls_complete'
const QUALITY_PROFILES = {
    "1080p": {
        videoBitrate: "5000k",
        maxRate: "5500k",
        bufsize: "7500k",
        audioBitrate: "128k"
    },
    "720p": {
        videoBitrate: "3000k",
        maxRate: "3300k",
        bufsize: "4500k",
        audioBitrate: "128k"
    },
    "480p": {
        videoBitrate: "1500k",
        maxRate: "1650k",
        bufsize: "2250k",
        audioBitrate: "96k"
    }
}

export const getHlsCompleteMarkerPath = (outputDir) => {
    return path.join(outputDir, HLS_COMPLETE_MARKER)
}

export const isHlsComplete = async (outputDir) => {
    const markerPath = getHlsCompleteMarkerPath(outputDir)
    try {
        await fs.access(markerPath)
        return true
    } catch {
        return false
    }
}

const removeIncompleteHls = async (outputDir) => {
    try {
        await fs.rm(outputDir, {
            recursive: true,
            force: true
        })
    } catch (error) {
        console.error(`Failed to remove imcomplete HLS: =>  ${error}`)
    }
}

export const runFfmpeg = async ({ inputUrl, outputDir, qualities, fps, hasAudio = true, segmentTime = 10 }) => {
    const toHlsPath = (value) => {
        return value.replace(/\\/g, "/");
    };
    if (!inputUrl) {
        throw new Error('Valid input url is required')
    }

    if (!qualities?.length) {
        throw new Error("No video qualities provided")
    }

    if (!Number.isFinite(fps) || fps <= 0) {
        throw new Error("Valid video fps is required")
    }

    await fs.mkdir(outputDir, {
        recursive: true
    });

    const completeMarkerPath = getHlsCompleteMarkerPath(outputDir);

    await fs.rm(completeMarkerPath, {
        force: true
    })

    const masterPlaylistPath = path.join(outputDir, 'master.m3u8');

    for (let index = 0; index < qualities.length; index++) {
        await fs.mkdir(
            path.join(outputDir, qualities[index].quality),
            {
                recursive: true,
            }
        );
    }
    const gopSize = Math.round(fps * segmentTime);

    const filters = qualities.map((quality, index) => {
        return [
            `[0:v]`,
            `scale=${quality.width}:${quality.height}`,
            `:force_original_aspect_ratio=decrease,`,
            `pad=${quality.width}:${quality.height}`,
            `:(ow-iw)/2:(oh-ih)/2,`,
            `setsar=1,`,
            `format=yuv420p`,
            `[v${index}]`
        ].join("");
        // return [
        //     `[0:v]hwupload_cuda,`,
        //     `scale_cuda=${quality.width}:${quality.height}:force_original_aspect_ratio=decrease,`,
        //     `pad_cuda=${quality.width}:${quality.height}:(ow-iw)/2:(oh-ih)/2,`,
        //     `setsar=1[v${index}]`
        // ].join("");
    });

    const filterComplex = filters.join(";");

    const ffmpegArgs = [
        // gpu acceleration
        // "-hwaccel", "cuda",
        // "-hwaccel_output_format", "cuda",


        "-y",

        "-reconnect",
        "1",

        "-reconnect_streamed",
        "1",

        "-reconnect_delay_max",
        "5",

        "-probesize",
        "50M",

        "-analyzeduration",
        "50M",

        "-i",
        inputUrl,

        "-filter_complex",
        filterComplex
    ]

    qualities.forEach((_, index) => {
        ffmpegArgs.push(
            "-map",
            `[v${index}]`
        )
        if (hasAudio) {
            ffmpegArgs.push(
                "-map",
                "0:a:0"
            )
        }
    })

    qualities.forEach((quality, index) => {
        const profile = QUALITY_PROFILES[quality.quality]

        if (!profile) {
            throw new Error(`No encoding profile found`)
        }

        ffmpegArgs.push(
            `-c:v:${index}`,
            "libx264",

            `-preset:v:${index}`,

            "superfast",

            `-profile:v:${index}`,
            "high",

            `-crf:v:${index}`,
            "20",

            `-b:v:${index}`,
            profile.videoBitrate,

            `-maxrate:v:${index}`,
            profile.maxRate,

            `-bufsize:v:${index}`,
            profile.bufsize,
        )
    })

    if (hasAudio) qualities.forEach((quality, index) => {
        const profile = QUALITY_PROFILES[quality.quality];

        ffmpegArgs.push(
            `-c:a:${index}`,
            "aac",

            `-b:a:${index}`,
            profile.audioBitrate,

            `-ac:a:${index}`,
            "2",

            `-ar:a:${index}`,
            "48000"
        )
    });

    ffmpegArgs.push(
        "-g",
        String(gopSize),

        "-keyint_min",
        String(gopSize),

        "-sc_threshold",
        "0"
    )

    ffmpegArgs.push(

        "-f",
        "hls",

        // newly added
        // "-hls_segment_type",
        // "fmp4",

        "-hls_time",
        String(segmentTime),

        "-hls_playlist_type",
        "vod",

        "-hls_flags",
        "independent_segments",

        "-var_stream_map",
        qualities.map((quality, index) => {
            const audioMap = hasAudio ? `,a:${index}` : "";
            return `v:${index}${audioMap},name:${quality.quality}`;
        }).join(" "),

        "-master_pl_name",
        "master.m3u8",

        "-hls_segment_filename",
        // toHlsPath(path.posix.join("%v", "segment_%03d.ms4")),
        toHlsPath(path.posix.join("%v", "segment_%03d.ts")),

        toHlsPath(path.posix.join("%v", "playlist.m3u8"))

    )

    return new Promise((resolve, reject) => {
        let stderrOutput = "";
        const ffmpeg = spawn(FFMPEG_BINARY, ffmpegArgs, { cwd: outputDir });

        ffmpeg.stderr.on('data', (data) => {
            stderrOutput += data.toString();
            if (stderrOutput.length > MAX_STDERR_LENGTH) {
                stderrOutput = stderrOutput.slice(-MAX_STDERR_LENGTH)
            }
        });

        ffmpeg.on('error', async (error) => {
            await removeIncompleteHls(outputDir)
            reject(error)
        })

        ffmpeg.on('close', async (code) => {

            if (code !== 0) {

                await removeIncompleteHls(outputDir)

                const error = new Error(`FFmpeg exited with code ${code}`)
                error.ffmpegOutput = stderrOutput
                return reject(error)
            }

            try {
                const masterPlaylistPath = path.join(outputDir, 'master.m3u8');

                await fs.access(masterPlaylistPath);

                for (let index = 0; index < qualities.length; index++) {
                    const playlistPath = path.join(outputDir, qualities[index].quality, 'playlist.m3u8');

                    await fs.access(playlistPath)

                    const segmentPath = path.join(outputDir, qualities[index].quality, 'segment_000.ts');

                    await fs.access(segmentPath);
                }

                await fs.writeFile(
                    completeMarkerPath,
                    JSON.stringify({
                        completedAt: new Date().toISOString(),
                        qualities: qualities.map(quality => quality.quality)
                    }, null, 2)
                )

                resolve(
                    {
                        outputDir,
                        masterPlaylistPath,
                        qualities
                    }
                )
            } catch (error) {
                await removeIncompleteHls(outputDir)
                error.ffmpegOutput = stderrOutput
                reject(error)
            }


        })
    })
}
