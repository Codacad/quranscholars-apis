import RecordedCourse from "../models/recorded-course/recorded-course.model.js"
import User from "../models/user/user.model.js"
import Category from "../models/course/courses-categories.model.js"
import slugify from "slugify";
export async function getAdminRecordedCourses(req, res, next) {
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
        const recordedCourse = new RecordedCourse(payload)
        let baseSlug = slugify(payload.title, {
            lower: true,
            strict: true,
            trim: true
        });
        recordedCourse.slug = `${baseSlug}-${recordedCourse._id.toString().slice(-6)}`;
        await recordedCourse.save()
        // res.status(200).json({ success: true, message: `${recordedCourse.slug} created` })
        res.json({
            random: Math.random(),
            time: new Date().toISOString(),
            slug: recordedCourse.slug,
        });
    } catch (error) {
        next(error)
    }
}