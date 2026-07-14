import mongoose, { model, Schema } from 'mongoose';
import slugify from 'slugify';
const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    instructor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['Quran', 'Islamic Studies', 'Hadith'],
        required: true,
        index: true
    },
    level: {
        type: String,
        required: true,
        enum: ['Basic', 'Intermediate', 'Advanced'],
    },
    price: {
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "INR",
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator(value) {
                    return value <= this.price.amount
                },
                message: "Discount cannot exceed the price"
            }
        },
    },
    duration: {
        value: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            enum: ["weeks", "months"],
            required: true,
        },
    },
    overview: {
        description: {
            type: String,
            required: true,
        },

        whatYouWillLearn: [
            {
                type: String,
                trim: true,
            },
        ],

        courseFormat: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    thumbnail: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: v => Math.round(v * 10) / 10
    },
    reviewsCount: {
        type: Number,
        default: 0,
    },
    studentsEnrolled: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

courseSchema.pre('save', function (next) {
    if (!this.isModified('title')) return next();
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${Date.now()}`
    next()
})
courseSchema.virtual('finalPrice').get(function () {
    return Math.max(this.price.amount - this.price.discount, 0);
})
courseSchema.virtual('durationLabel').get(function () {
    return `${this.duration.value} ${this.duration.unit}`
})

const Course = model('Course', courseSchema);
export default Course;
