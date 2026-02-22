import Admission from "../models/admission/admission.model.js";
export const dashbaord = async (req, res) => {
  try {
    const admissions = await Admission.findOne({ user: req.user._id })
      .populate("selectedCourses", "title category")
      .lean();
    if (!admissions) {
      return res.status(404).send("Admissions not found");
    }
    return res.status(200).send(admissions);
  } catch (error) {
    return res.status(500).send("Unable to fetch dashboard");
  }
};
