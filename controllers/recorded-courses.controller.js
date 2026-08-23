import RecordedCourse from "../models/recorded-course/recorded-course.model.js"
import User from "../models/user/user.model.js"
import Category from "../models/course/courses-categories.model.js"
import slugify from "slugify";
import { trailerVideoUploadService } from "../services/trailer-video-upload.service.js";
import { trailerVideoQueueingService } from "../services/trailer-video-queueing.service.js";
import '../queues/video-processing.queue.js'


// Get Recorded Courses
export async function getRecordedCourses(req, res, next) {
    console.log("Controller executed:", Date.now());
    try {
        const { status } = req.query
        const draftCourses = await RecordedCourse.find({ status })
        return res.status(200).json({
            success: true,
            count: draftCourses.length,
            data: draftCourses
        })
    } catch (error) {
        console.error(error)
        next(error)
    }
}

// Create Recorded Course
export async function createRecordedCourse(req, res, next) {
    const payload = {
        ...req.payload,
        instructor: req.user._id,
        createdBy: req.user._id
    };
    const { price } = payload;
    try {
        const instructor = await User.findById(payload.instructor)
        if (!instructor) {
            const error = new Error('Instructor not found');
            error.statusCode = 404;
            return next(error);
        }
        const category = await Category.findById(payload.category)
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            return next(error);
        }
        if (price.sale && price.sale > price.original) {
            const error = new Error('Sale price must not exceed the original price');
            error.statusCode = 400;
            return next(error);
        }
        const duplicateCourse = await RecordedCourse.exists({
            instructor: payload.instructor,
            title: payload.title
        })
        if (duplicateCourse) {
            const error = new Error(`You already have "${payload.title}" course`);
            error.statusCode = 409;
            return next(error);
        }
        const recordedCourse = new RecordedCourse(payload)
        let baseSlug = slugify(payload.title, {
            lower: true,
            strict: true,
            trim: true
        });
        recordedCourse.slug = `${baseSlug}-${recordedCourse._id.toString().slice(-6)}`;
        await recordedCourse.save()
        res.status(200).json({ success: true, message: `Course has been created` })
    } catch (error) {
        next(error)
    }
}

// Upload Video to R2
export async function uploadTrailerVideo(req, res, next) {
    try {
        const { courseId } = req.params
        const { fileName, contentType, size } = req.body;
        const { uploadUrl, sourceKey } = await trailerVideoUploadService({
            courseId,
            fileName,
            size,
            contentType,
            userId: req.user._id
        })

        res.status(200).json({
            success: true,
            message: "Upload url created",
            uploadUrl,
            sourceKey
        })
    } catch (error) {
        console.error(error)
        return next(error)
    }
}

export async function processTrailerVideo(req, res, next) {
    try {
        const { courseId } = req.params
        const result = await trailerVideoQueueingService({ courseId, userId: req.user._id })
        res.status(201).json({
            success: true,
            message: "Video in beeing processed",
            data: result
        })
    } catch (error) {
        console.error(error)
        return next(error)
    }
}