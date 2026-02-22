import mongoose, { Schema, model } from "mongoose";

const admissionSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      immutable: true,
      index: true,
      unique: [true, "Email is already used"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      match: [
        /^\+?[0-9]{8,15}$/,
        "Please provide a valid contact number (8-15 digits, optional leading +)",
      ],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: (value) => value <= new Date(),
        message: "Date of birth cannot be in the future",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: 120,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: 120,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: 120,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
      trim: true,
    },
    selectedCourses: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
      }],
      required: [true, "Please select at least one course"],
      validate: [
        {
          validator: (courses) => courses.length > 0,
          message: "Please select at least one course",
        },
        {
          validator: (courses) => new Set(courses.map((c) => c.toString())).size === courses.length,
          message: "Duplicate courses are not allowed",
        },
      ],
    },
    status: {
      type: String,
      enum: ["pending", "in-review", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

admissionSchema.pre("save", function (next) {
  if (this.isModified("email") && this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

admissionSchema.index({ email: 1, user: 1 });

const Admission = model("Admission", admissionSchema);
export default Admission;
