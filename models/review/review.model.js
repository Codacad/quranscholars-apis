import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'RecordedCourse',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        default: "",
        minLength: [2, "Comment must be at least 2 characters long"],
        maxLength: [3000, "Comment cannot exceed 3000 characters"]
    },
}, { timestamps: true });

const Review = model('Review', reviewSchema);

export default Review;