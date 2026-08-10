# QuranScholar APIs - Direct-to-R2 Recorded Video Upload Roadmap

This roadmap is tailored to the current `quranscholars-apis` codebase.
The frontend will upload recorded-course video bytes directly to Cloudflare
R2. The Express API will own authentication, authorization, object naming,
upload verification, queueing, processing state, playback authorization, and
database updates.

Core rule:

```text
The API is the control plane.
The browser sends video bytes to R2.
The worker downloads video bytes from R2.
Redis only stores job metadata.
```

## Contents

- [1. Current Project Facts](#1-current-project-facts)
- [2. Target Flow](#2-target-flow)
- [3. Recommended R2 Object Layout](#3-recommended-r2-object-layout)
- [4. Environment Variables](#4-environment-variables)
- [5. R2 Service Plan](#5-r2-service-plan)
- [6. RecordedCourse Schema Plan](#6-recordedcourse-schema-plan)
- [7. Upload Session Strategy](#7-upload-session-strategy)
- [8. Routes To Add](#8-routes-to-add)
- [9. Controller Plan](#9-controller-plan)
- [10. Validation Plan](#10-validation-plan)
- [11. Section/Lesson Lookup Helpers](#11-sectionlesson-lookup-helpers)
- [12. Upload Authorization Endpoint](#12-upload-authorization-endpoint)
- [13. R2 CORS](#13-r2-cors)
- [14. Complete Upload Endpoint](#14-complete-upload-endpoint)
- [15. Redis And Queue Plan](#15-redis-and-queue-plan)
- [16. Worker Plan](#16-worker-plan)
- [17. FFmpeg Output Plan](#17-ffmpeg-output-plan)
- [18. Processing Status Endpoint](#18-processing-status-endpoint)
- [19. Retry Endpoint](#19-retry-endpoint)
- [20. Delete Endpoint](#20-delete-endpoint)
- [21. Playback Endpoint](#21-playback-endpoint)
- [22. Frontend Contract](#22-frontend-contract)
- [23. Existing Middleware Notes](#23-existing-middleware-notes)
- [24. Milestone Plan](#24-milestone-plan)
- [25. Testing Checklist](#25-testing-checklist)
- [26. Production Checklist](#26-production-checklist)
- [27. Recommended Implementation Order](#27-recommended-implementation-order)

## 1. Current Project Facts

The project is an Express 5, ES module API using Mongoose.

Important existing files:

- App entry: `app.js`
- Config: `config/r2.js`, `config/redis.js`
- Controllers: `controllers/recorded-course-media.controller.js`
- Middleware:
  `middlewares/recorded-course.middleware.js`,
  `middlewares/isAuthenticated.js`,
  `middlewares/isInstructor.js`,
  `middlewares/upload.middleware.js`
- Models:
  `models/recorded-course/recorded-course.model.js`,
  `models/purchase/purchase.model.js`
- Queues: `queues/connection.js`, `queues/media.queue.js`
- Routes: `routes/recorded-course-media.routes.js`
- Services:
  `services/upload-media.service.js`,
  `services/storage.service.js`,
  `services/video.service.js`
- Worker: `workers/media.worker.js`
- Validation: `validation/recorded-courses.validation.js`

What already exists:

- `app.js` already mounts `recorded-course-media.routes.js` under `/api`.
- `recorded-course-media.routes.js` already owns recorded-course media routes.
- `config/r2.js` already creates an S3-compatible R2 client and has
  `uploadToR2`.
- `upload-media.service.js` already uploads course thumbnails to R2.
- These packages are already installed:
  `@aws-sdk/client-s3`, `bullmq`, `ioredis`, `ffmpeg-static`,
  `ffprobe-static`, and `sharp`.
- These files are currently empty placeholders:
  `queues/connection.js`, `queues/media.queue.js`, `workers/media.worker.js`,
  `services/storage.service.js`, and `services/video.service.js`.
- `RecordedCourse` embeds sections and lessons directly inside the course
  document.
- Lesson documents currently require `hlsKey`, which conflicts with a
  direct-upload workflow where a lesson can exist before processing is complete.

Because of this, the implementation should extend the current files instead of
creating a separate `backend/`, `worker/`, or unrelated route tree.

## 2. Target Flow

```text
Instructor/admin selects video in frontend
  -> frontend requests upload authorization from API
  -> API authenticates and authorizes the user
  -> API validates course, section, lesson, file size, and MIME type
  -> API creates backend-owned R2 source key
  -> API returns a short-lived presigned PUT URL
  -> frontend uploads video directly to R2
  -> frontend calls upload-complete endpoint
  -> API verifies the object in R2 with HeadObject
  -> API updates lesson video state
  -> API enqueues a BullMQ job with metadata only
  -> worker downloads source video from R2
  -> worker runs FFmpeg/ffprobe
  -> worker creates HLS renditions and thumbnail
  -> worker uploads processed output to R2
  -> worker updates MongoDB
```

The API must never accept the recorded-course video file through `multer`.
Keep `upload.middleware.js` for small image uploads only.

## 3. Recommended R2 Object Layout

Use backend-generated keys only. The frontend should never submit or invent
final R2 object keys.

Base prefix:

```text
courses/{courseId}/sections/{sectionId}/lessons/{lessonId}/
```

Objects under that prefix:

```text
source/original.{ext}
hls/master.m3u8
hls/1080p/playlist.m3u8
hls/720p/playlist.m3u8
hls/480p/playlist.m3u8
thumbnail/thumbnail.webp
```

Store keys in MongoDB, not permanent public URLs.

## 4. Environment Variables

Current `.env.example` already includes:

```env
R2_BUCKET_NAME=
ACCOUNT_ID=
API_TOKEN=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
S3_ENDPOINT=
```

Add or confirm these before implementation:

```env
REDIS_URL=
R2_PRESIGNED_UPLOAD_EXPIRES_SECONDS=900
VIDEO_MAX_UPLOAD_BYTES=2147483648
VIDEO_ALLOWED_MIME_TYPES=video/mp4,video/webm,video/quicktime
VIDEO_WORK_DIR=uploads/temp/video-processing
VIDEO_QUEUE_CONCURRENCY=1
PLAYBACK_URL_EXPIRES_SECONDS=900
```

Do not expose `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, or
`API_TOKEN` to the frontend.

## 5. R2 Service Plan

Keep the S3 client in `config/r2.js`, but expand the storage operations in
`services/storage.service.js`. This keeps SDK details out of controllers and
the worker.

Recommended operations:

```text
createPresignedPutUrl({ key, contentType, expiresIn })
headObject(key)
getObjectStream(key)
putObject({ key, body, contentType })
deleteObject(key)
deletePrefix(prefix)
createPresignedGetUrl({ key, expiresIn })
```

Implementation notes:

- Add `HeadObjectCommand`, `GetObjectCommand`, `DeleteObjectCommand`, and
  `ListObjectsV2Command`/batch deletion support as needed.
- Add `@aws-sdk/s3-request-presigner` if it is not already installed.
- Keep the existing `uploadToR2` path working for course thumbnails, or move it
  behind `storage.service.js` as a small compatibility refactor.

## 6. RecordedCourse Schema Plan

Current lesson schema:

```text
title
description
duration
order
preview
hlsKey        currently required
thumbnail
```

Recommended change:

```js
video: {
  status: {
    type: String,
    enum: [
      "NOT_UPLOADED",
      "UPLOADING",
      "UPLOADED",
      "QUEUED",
      "PROCESSING",
      "COMPLETED",
      "FAILED"
    ],
    default: "NOT_UPLOADED"
  },
  sourceKey: String,
  sourceETag: String,
  originalFileName: String,
  mimeType: String,
  fileSize: Number,
  uploadId: String,
  uploadExpiresAt: Date,
  processingJobId: String,
  processingProgress: { type: Number, default: 0 },
  processingError: String,
  hlsKey: String,
  thumbnailKey: String,
  duration: { type: Number, default: 0 },
  uploadedAt: Date,
  processingStartedAt: Date,
  processedAt: Date
}
```

Compatibility choices:

- Keep top-level `lesson.hlsKey` and `lesson.thumbnail` for existing frontend
  readers if they already depend on those names.
- Also save final values into `lesson.video.hlsKey` and
  `lesson.video.thumbnailKey`.
- Relax `lesson.hlsKey` so it is not required during lesson creation, or set it
  to an empty string until processing completes.
- Update validation so new lessons can be created before the video is uploaded.

The embedded lesson model means updates will usually target:

```text
RecordedCourse.sections.$[section].lessons.$[lesson]
```

Use `arrayFilters` for precise updates.

## 7. Upload Session Strategy

For the first implementation, store upload-session data inside the embedded
lesson `video` object. This avoids adding a new collection too early.

Use a separate `VideoUpload` collection later if you need:

- multiple simultaneous uploads for the same lesson
- resumable multipart uploads
- detailed audit history
- abandoned-upload reporting
- user-visible upload session recovery

Initial session behavior:

```text
uploadId: randomUUID()
status: UPLOADING
sourceKey: backend-generated key
uploadExpiresAt: now + presigned URL TTL
originalFileName/contentType/fileSize: copied from validated request metadata
```

## 8. Routes To Add

Add the recorded-video endpoints to the existing
`routes/recorded-course-media.routes.js`.

Use the current singular media route style.

Base path:

```http
/api/recorded-course/:courseId/sections/:sectionId/lessons/:lessonId/video
```

| Method | Path suffix | Purpose |
| --- | --- | --- |
| `POST` | `/upload` | Create upload session and return presigned R2 upload URL |
| `POST` | `/complete` | Verify R2 object and enqueue processing |
| `GET` | `/status` | Return upload/processing status |
| `POST` | `/retry` | Requeue failed processing from existing source object |
| `DELETE` | `/` | Delete/reset lesson video media |
| `GET` | `/playback` | Return authorized playback information |

Protection:

- Upload, complete, retry, and delete: `isAuthenticatedUser`, `isInstructor`,
  `checkCourseExists`, plus section/lesson ownership validation.
- Status: instructor access for admin views; optionally authenticated student
  access if the frontend needs it.
- Playback: `isAuthenticatedUser`, then purchase/enrollment/preview checks.

Do not use `upload.single()` for recorded videos.

## 9. Controller Plan

Extend `controllers/recorded-course-media.controller.js`.

Keep controllers thin:

```text
controller
  -> parse params/body
  -> call service
  -> send response
  -> next(error)
```

Recommended controller functions:

```text
initiateLessonVideoUpload
completeLessonVideoUpload
getLessonVideoStatus
retryLessonVideoProcessing
deleteLessonVideo
getLessonVideoPlayback
```

Put real business logic in `services/video.service.js`.

## 10. Validation Plan

Create video request schemas in `validation/recorded-courses.validation.js` or
a new `validation/recorded-course-video.validation.js`.

Upload authorization request:

```json
{
  "fileName": "lesson-01.mp4",
  "contentType": "video/mp4",
  "size": 483928392
}
```

Validate:

- valid `courseId`, `sectionId`, `lessonId`
- file name exists and has a safe extension
- content type is allowed
- size is greater than zero
- size does not exceed `VIDEO_MAX_UPLOAD_BYTES`
- lesson exists inside the given section
- instructor owns the course

Completion request:

```json
{
  "uploadId": "uuid-from-initiate-response"
}
```

Do not trust frontend-reported size, key, duration, or completion status.

## 11. Section/Lesson Lookup Helpers

Add small helper functions rather than repeating embedded-document traversal in
every endpoint.

Suggested home:

```text
utils/course.utils.js
```

or a local helper inside `services/video.service.js`.

Needed helpers:

```text
findSection(course, sectionId)
findLesson(section, lessonId)
assertInstructorOwnsCourse(course, user)
buildLessonVideoSourceKey({ courseId, sectionId, lessonId, fileName })
buildLessonVideoOutputPrefix({ courseId, sectionId, lessonId })
```

Important existing issue to fix before relying on `checkCourseExists`:

```js
course.instructor.toString() !== req.user._id.toString
```

The right side should call `toString()`. Otherwise instructor ownership checks
will not behave correctly.

## 12. Upload Authorization Endpoint

Endpoint:

```http
POST /api/recorded-course/:courseId/sections/:sectionId/lessons/:lessonId/video/upload
```

Algorithm:

```text
1. Authenticate user.
2. Require instructor.
3. Load course with checkCourseExists.
4. Verify section and lesson exist.
5. Validate request body.
6. Generate uploadId.
7. Generate sourceKey on the server.
8. Save lesson.video with status UPLOADING and expected metadata.
9. Generate short-lived presigned PUT URL for sourceKey.
10. Return uploadId, sourceKey, uploadUrl, expiresAt, and required headers.
```

Response:

```json
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "sourceKey": "courses/.../source/original.mp4",
    "uploadUrl": "https://...",
    "expiresAt": "2026-08-10T12:15:00.000Z",
    "headers": {
      "Content-Type": "video/mp4"
    }
  }
}
```

Frontend upload:

```js
await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": file.type },
  body: file
});
```

## 13. R2 CORS

Configure R2 bucket CORS for the frontend origins.

Production:

```text
https://www.quranscholar.in
```

Development:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Minimum CORS policy:

```json
[
  {
    "AllowedOrigins": [
      "https://www.quranscholar.in",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Keep production origins narrow.

## 14. Complete Upload Endpoint

Endpoint:

```http
POST /api/recorded-course/:courseId/sections/:sectionId/lessons/:lessonId/video/complete
```

Algorithm:

```text
1. Authenticate and authorize.
2. Validate uploadId.
3. Load the lesson video metadata.
4. Confirm status is UPLOADING.
5. Confirm upload has not expired.
6. HeadObject(sourceKey) in R2.
7. Verify object exists.
8. Verify ContentLength equals expected fileSize.
9. Verify ContentType matches expected mimeType when available.
10. Save sourceETag, uploadedAt, status UPLOADED.
11. Add BullMQ job with IDs and keys only.
12. Save processingJobId and status QUEUED.
13. Return status and job ID.
```

BullMQ payload:

```js
{
  courseId,
  sectionId,
  lessonId,
  sourceKey,
  outputPrefix: "courses/.../lessons/.../"
}
```

Never put file buffers or base64 data in the job.

## 15. Redis And Queue Plan

Implement:

```text
config/redis.js
queues/connection.js
queues/media.queue.js
```

Recommended queue name:

```text
recorded-course-media
```

Queue defaults:

```js
{
  attempts: 3,
  backoff: { type: "exponential", delay: 30000 },
  removeOnComplete: { age: 86400, count: 1000 },
  removeOnFail: { age: 604800, count: 5000 }
}
```

Use `REDIS_URL` for hosted Redis, with local fallback only for development.

## 16. Worker Plan

Implement `workers/media.worker.js` as a separate process from `app.js`.
Do not start the worker automatically inside the Vercel/serverless API process.

Add package scripts later:

```json
{
  "worker:media": "node workers/media.worker.js"
}
```

Worker job algorithm:

```text
1. Mark lesson video PROCESSING.
2. Create temporary job directory under VIDEO_WORK_DIR.
3. Download source video from R2 using sourceKey.
4. Run ffprobe to get duration/resolution.
5. Generate HLS renditions with ffmpeg.
6. Generate thumbnail.webp.
7. Upload HLS files and thumbnail to R2.
8. Save hlsKey, thumbnailKey, duration, processedAt.
9. Mirror hlsKey/thumbnail/duration into existing lesson fields if needed.
10. Mark status COMPLETED and progress 100.
11. Cleanup temporary directory in a finally block.
```

On failure:

```text
1. Save status FAILED.
2. Save processingError.
3. Keep sourceKey so retry can reprocess without another upload.
4. Cleanup temporary files.
```

## 17. FFmpeg Output Plan

Use `ffmpeg-static` and `ffprobe-static` already installed in the project.

Initial renditions:

```text
1080p if source height >= 1080
720p  if source height >= 720
480p  always, unless source is smaller
```

Output:

```text
hls/master.m3u8
hls/1080p/playlist.m3u8
hls/1080p/segment000.ts
hls/720p/playlist.m3u8
hls/720p/segment000.ts
hls/480p/playlist.m3u8
hls/480p/segment000.ts
thumbnail/thumbnail.webp
```

Keep worker concurrency low at first. FFmpeg is CPU, memory, disk, and network
heavy.

## 18. Processing Status Endpoint

Endpoint:

```http
GET /api/recorded-course/:courseId/sections/:sectionId/lessons/:lessonId/video/status
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "PROCESSING",
    "progress": 67,
    "error": null,
    "sourceKey": "courses/.../source/original.mp4",
    "hlsKey": null,
    "thumbnailKey": null
  }
}
```

Initial frontend can poll this endpoint. Add SSE/WebSocket later only if needed.

## 19. Retry Endpoint

Endpoint:

```http
POST /api/recorded-course/:courseId/sections/:sectionId/lessons/:lessonId/video/retry
```

Allow retry when:

```text
status = FAILED
sourceKey exists
HeadObject(sourceKey) succeeds
```

Algorithm:

```text
1. Authenticate and authorize instructor.
2. Verify source object still exists.
3. Clear processingError.
4. Set status QUEUED and progress 0.
5. Add new BullMQ job.
6. Save processingJobId.
```

## 20. Delete Endpoint

Endpoint:

```http
DELETE /api/recorded-course/:courseId/sections/:sectionId/lessons/:lessonId/video
```

Algorithm:

```text
1. Authenticate and authorize instructor.
2. Load lesson video state.
3. If PROCESSING, block deletion in v1 or mark deleteRequested for later.
4. Delete sourceKey if present.
5. Delete processed output prefix if present.
6. Reset lesson video metadata to NOT_UPLOADED.
7. Clear compatible top-level hlsKey/thumbnail fields if used.
```

For v1, blocking deletion during processing is simpler and safer than trying to
cancel active FFmpeg work.

## 21. Playback Endpoint

Endpoint:

```http
GET /api/recorded-course/:courseId/sections/:sectionId/lessons/:lessonId/video/playback
```

Authorization:

```text
1. Authenticate user.
2. Load course, section, and lesson.
3. Allow instructor/course owner.
4. Allow preview lessons.
5. Otherwise require Purchase with:
   courseId
   userId
   paymentStatus = completed
   accessStatus = active
   expiresAt missing or in the future
6. Require video.status = COMPLETED.
```

Response:

```json
{
  "success": true,
  "data": {
    "hlsKey": "courses/.../hls/master.m3u8",
    "playbackUrl": "short-lived signed URL or CDN URL",
    "thumbnailKey": "courses/.../thumbnail/thumbnail.webp",
    "duration": 842
  }
}
```

If using signed HLS playlist access, remember that segment URLs also need to be
accessible. The simplest v1 option is a protected CDN/R2 delivery strategy that
allows the HLS playlist and segment prefix after the API authorization decision.

## 22. Frontend Contract

The frontend owns:

- file selection
- basic client validation
- requesting upload authorization
- direct PUT to R2
- upload progress
- calling complete-upload
- polling processing status
- retry button for failed processing
- playback with HLS player

The frontend must not own:

- final R2 key naming
- course/lesson authorization
- trusted file size
- processing status
- playback entitlement

## 23. Existing Middleware Notes

Before implementation, fix or account for:

- `checkCourseExists` instructor ownership currently compares
  `req.user._id.toString` instead of `req.user._id.toString()`.
- `requestOriginGuard.js` references `normalizedAllowed` before it is declared.
  If this guard is added to video routes, fix it first.
- `upload.middleware.js` writes to `uploads/temp/images` and allows only images.
  Keep it out of recorded-video routes.

## 24. Milestone Plan

### Milestone 1 - Storage Foundation

- Expand `services/storage.service.js`.
- Add presigned PUT support.
- Add HeadObject/GetObject/DeleteObject support.
- Preserve existing course thumbnail upload behavior.
- Confirm R2 CORS.

Done when: API can create a presigned PUT URL and verify an uploaded object.

### Milestone 2 - Schema And Validation

- Add `lesson.video` metadata.
- Relax current required `lesson.hlsKey` behavior.
- Add video upload/complete validation schemas.
- Add section/lesson lookup helpers.

Done when: a lesson can exist in `NOT_UPLOADED`, `UPLOADING`, and `UPLOADED`
states without processing output yet.

### Milestone 3 - Upload API

- Add upload authorization endpoint.
- Add complete-upload endpoint.
- Verify R2 object with HeadObject.
- Store upload metadata in embedded lesson state.

Done when: frontend can upload a real video directly to R2 and the API can
confirm it.

### Milestone 4 - Redis And BullMQ

- Implement `config/redis.js`.
- Implement `queues/connection.js`.
- Implement `queues/media.queue.js`.
- Enqueue a processing job from complete-upload.

Done when: upload completion creates a BullMQ job with metadata only.

### Milestone 5 - Worker Download And State

- Implement `workers/media.worker.js`.
- Connect worker to queue.
- Download source object from R2.
- Update lesson status to `PROCESSING` and `FAILED`/`COMPLETED` placeholders.
- Cleanup temp files.

Done when: worker can consume a job and download the uploaded source file.

### Milestone 6 - FFmpeg Processing

- Add ffprobe metadata extraction.
- Generate HLS renditions.
- Generate thumbnail.
- Track progress in MongoDB.

Done when: a source video produces local HLS output and thumbnail.

### Milestone 7 - Upload Processed Media

- Upload HLS files to R2.
- Upload thumbnail to R2.
- Save `hlsKey`, `thumbnailKey`, duration, and completed timestamps.
- Mirror fields for existing lesson readers if needed.

Done when: a lesson reaches `COMPLETED` and has playable media keys.

### Milestone 8 - Status, Retry, Delete

- Add status endpoint.
- Add retry endpoint.
- Add delete endpoint.
- Add queue retry/backoff policy.

Done when: instructors can see state, recover failures, and remove video media.

### Milestone 9 - Playback Authorization

- Add playback endpoint.
- Check preview/instructor/purchase access.
- Return authorized playback information.

Done when: only entitled users can get playback access for completed lessons.

### Milestone 10 - Multipart Upload

Do this after simple PUT is proven end to end.

Add:

- create multipart upload
- sign part upload URLs
- complete multipart upload
- abort multipart upload
- abandoned multipart cleanup

Multipart is the long-term production path for very large recorded-course
videos.

## 25. Testing Checklist

Add focused Jest/Supertest tests around the API layer:

- unauthenticated upload authorization is rejected
- non-instructor upload authorization is rejected
- instructor cannot upload to another instructor's course
- invalid section/lesson IDs are rejected
- invalid MIME type is rejected
- oversized file is rejected
- upload authorization stores `UPLOADING`
- complete-upload fails if `HeadObject` fails
- complete-upload fails if size mismatches
- complete-upload enqueues one BullMQ job on success
- status returns current lesson video state
- retry requires `FAILED` and existing source object
- playback requires completed video and valid entitlement

Mock R2 and BullMQ in controller/service tests. Use a real worker smoke test
separately with a tiny fixture video when FFmpeg processing is added.

## 26. Production Checklist

- R2 bucket created.
- R2 CORS configured for exact frontend origins.
- Backend R2 credentials set only in API/worker environment.
- Redis configured.
- Worker runs as a separate process/service.
- FFmpeg works in the worker runtime.
- Worker temp directory has enough disk.
- Worker concurrency limited.
- BullMQ retries and backoff configured.
- Failed jobs store readable errors.
- Upload sessions expire.
- Abandoned source uploads are cleaned up.
- Processed HLS prefix deletion works.
- Playback authorization cannot be bypassed by guessing keys.
- Logs include courseId, sectionId, lessonId, uploadId, and jobId.

## 27. Recommended Implementation Order

```text
1. Fix existing ownership/origin middleware issues that affect these routes.
2. Expand R2 storage service.
3. Add lesson video schema fields and relax required hlsKey.
4. Add validation/helper functions.
5. Add upload authorization endpoint.
6. Configure R2 CORS and test direct browser PUT.
7. Add complete-upload endpoint with HeadObject verification.
8. Implement Redis/BullMQ queue.
9. Implement worker shell and R2 source download.
10. Add FFmpeg/ffprobe processing.
11. Upload processed HLS and thumbnail to R2.
12. Save completed lesson media metadata.
13. Add status/retry/delete endpoints.
14. Add playback authorization endpoint.
15. Add focused tests.
16. Upgrade to multipart upload for large-file production support.
```

This keeps the project moving in two clean phases:

```text
browser -> R2 -> API verifies
R2 -> worker -> FFmpeg -> R2 -> MongoDB
```
