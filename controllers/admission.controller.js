import Admission from "../models/admission/admission.model.js";
import Course from "../models/courses/courses.model.js";
export const admissions = async (req, res) => {
  try {
    const admissions = await Admission.find({
      user: req.user._id,
    }).populate('selectedCourses')
      .populate("user", "fullname email role createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(admissions);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const join = async (req, res) => {
  const {
    fullName,
    address,
    dob,
    contactNumber,
    country,
    zipCode,
    state,
    city,
    gender,
    notes,
  } = req.body;

  try {
    const existingAdmission = await Admission.findOne({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    });
    if (existingAdmission) {
      return res.status(409).send({
        message:
          "Your admission is already registered. A user can have only one admission.",
      });
    }


    const newAdmission = new Admission({
      fullName,
      email: req.user.email?.toLowerCase(),
      user: req.user._id,
      address,
      dob,
      contactNumber,
      country,
      zipCode,
      city,
      state,
      gender,
      selectedCourses: req.body.selectedCourses,
      notes,
    });

    await newAdmission.save();
    res.status(201).json(newAdmission);
  } catch (error) {
    res.status(500).json({ message: error.message.split(":").pop().trim() });
  }
};

export const updateAdmissionDetails = async (req, res) => {
  try {
    if (req.body?.email) {
      return res.status(400).json({ message: "Email cannot be updated" });
    }

    const allowedFields = [
      "fullName",
      "contactNumber",
      "dob",
      "address",
      "zipCode",
      "city",
      "state",
      "country",
      "gender",
      "selectedCourses",
      "notes",
    ];
    const payload = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      if (!allowedFields.includes(key) || value === undefined) continue;
      if (key === "selectedCourses" && Array.isArray(value)) {
        const uniqueIds = [...new Set(value)];
        const validCourses = await Course.find({
          _id: { $in: uniqueIds }
        }).select("_id");
        if (validCourses.length !== uniqueIds.length) {
          return res.status(400).json({
            message: "One or more selected courses are invalid",
          });
        }
        payload[key] = validCourses.map(course => course._id);
      } else {
        payload[key] = value;
      }
    }


    const admission = await Admission.findOneAndUpdate(
      { user: req.user._id },
      payload,
      { new: true, runValidators: true, context: "query" }
    ).lean();

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    return res
      .status(200)
      .json({ message: "Admission details updated successfully", admission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
