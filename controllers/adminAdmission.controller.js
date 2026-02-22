import Admission from "../models/admission/admission.model.js";
import Course from "../models/courses/courses.model.js";
import mongoose from "mongoose";

const ALLOWED_UPDATE_FIELDS = [
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
  "status",
  "notes",
];

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getAdmissionsForAdmin = async (req, res) => {
  try {
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, toInt(req.query.limit, 20)));
    const status = req.query.status?.trim();
    const search = req.query.search?.trim();

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { contactNumber: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Admission.find(query)
        .populate("selectedCourses", "title category")
        .populate("user", "fullname email role createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Admission.countDocuments(query),
    ]);

    return res.status(200).json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAdmissionByIdForAdmin = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid admission id" });
    }

    const admission = await Admission.findById(req.params.id)
      .populate("selectedCourses", "title category")
      .populate("user", "fullname email role createdAt")
      .lean();

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    return res.status(200).json(admission);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAdmissionStatusForAdmin = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid admission id" });
    }

    const { status } = req.body || {};
    const allowedStatuses = ["pending", "in-review", "accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true, context: "query" },
    )
      .populate("selectedCourses", "title category")
      .populate("user", "fullname email role createdAt")
      .lean();

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    return res.status(200).json({
      message: "Admission status updated successfully",
      admission,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAdmissionForAdmin = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid admission id" });
    }

    const payload = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      if (!ALLOWED_UPDATE_FIELDS.includes(key) || value === undefined) continue;
      payload[key] = value;
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    if (Array.isArray(payload.selectedCourses)) {
      const uniqueIds = [...new Set(payload.selectedCourses)];
      const validCourses = await Course.find({
        _id: { $in: uniqueIds },
      }).select("_id");

      if (validCourses.length !== uniqueIds.length) {
        return res
          .status(400)
          .json({ message: "One or more selected courses are invalid" });
      }
      payload.selectedCourses = validCourses.map((course) => course._id);
    }

    const admission = await Admission.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .populate("selectedCourses", "title category")
      .populate("user", "fullname email role createdAt")
      .lean();

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    return res.status(200).json({
      message: "Admission updated successfully",
      admission,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAdmissionForAdmin = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid admission id" });
    }

    const deleted = await Admission.findByIdAndDelete(req.params.id).lean();
    if (!deleted) {
      return res.status(404).json({ message: "Admission not found" });
    }
    return res.status(200).json({ message: "Admission deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
