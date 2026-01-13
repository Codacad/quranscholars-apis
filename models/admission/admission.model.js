import { Schema, model } from "mongoose";

const admissionSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: [true, "Email is already used"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact Number is required"],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of Birth is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      trim: true,
    },
    selectedCourses: {
      type: [String],
      required: [true, "Courses are required"],
      validate: {
        validator: function (courses) {
          return courses.length > 0;
        },
        message: "Please select at least one course",
      },
    },
  },
  { timestamps: true }
);

const Admission = model("Admission", admissionSchema);
export default Admission;
