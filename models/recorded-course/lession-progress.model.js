import mongoose from "mongoose";

const { Schema, model } = mongoose;

const lessonProgressSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        recordedCourseId: {
            type: Schema.Types.ObjectId,
            ref: "RecordedCourse",
            required: true,
            index: true,
        },

        sectionId: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        lessonId: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        watchedSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },

        duration: {
            type: Number,
            default: 0,
            min: 0,
        },

        lastPosition: {
            type: Number,
            default: 0,
            min: 0,
        },

        completed: {
            type: Boolean,
            default: false,
        },

        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

lessonProgressSchema.index(
    { userId: 1, recordedCourseId: 1, lessonId: 1 },
    { unique: true }
);

const LessonProgress = model("LessonProgress", lessonProgressSchema);

export default LessonProgress;