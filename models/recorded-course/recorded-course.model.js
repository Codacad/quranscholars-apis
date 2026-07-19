import { model, Schema } from "mongoose";
import slugify from "slugify";

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    duration: {
      type: Number,
      min: 0,
      default: 0,
    },
    order: {
      type: Number,
      required: [true, "Lesson order is required"],
      min: 1,
    },
    preview: {
      type: Boolean,
      default: false,
    },
    hlsKey: {
      type: String,
      required: [true, "Lesson video URL is required"],
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const sectionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      required: [true, "Section order is required"],
      min: 1,
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const recordedCourseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    language: {
      type: String,
      trim: true,
      default: "English",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: [true, "Level is required"],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
      trim: true,
    },
    trailerVideo: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      original: {
        type: Number,
        required: [true, "Original price is required"],
        min: 0,
      },
      sale: {
        type: Number,
        min: 0,
        validate: {
          validator(value) {
            return value === undefined || value <= this.price.original;
          },
          message: "Sale price cannot be greater than original price",
        },
      },
      currency: {
        type: String,
        uppercase: true,
        trim: true,
        default: "INR",
        minlength: 3,
        maxlength: 3,
      },
    },
    totalDuration: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalSections: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalLessons: {
      type: Number,
      min: 0,
      default: 0,
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    tags: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      set: (value) => Math.round(value * 10) / 10,
    },
    totalReviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalStudents: {
      type: Number,
      min: 0,
      default: 0,
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recordedCourseSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true, trim: true });
  }

  this.totalSections = this.sections.length;
  this.totalLessons = this.sections.reduce(
    (total, section) => total + section.lessons.length,
    0
  );
  this.totalDuration = this.sections.reduce(
    (courseTotal, section) =>
      courseTotal +
      section.lessons.reduce(
        (sectionTotal, lesson) => sectionTotal + (lesson.duration || 0),
        0
      ),
    0
  );

  if (this.published) {
    this.status = "Published";
  }
});

recordedCourseSchema.virtual("finalPrice").get(function () {
  return this.price.sale ?? this.price.original;
});

const RecordedCourse = model("RecordedCourse", recordedCourseSchema);

export default RecordedCourse;
