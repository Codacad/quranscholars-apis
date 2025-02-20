import Admission from "../models/admission/admission.js";
export const dashbaord = async (req, res) => {
  const admissions = await Admission.findOne({ _id: req.user._id });
  if (!admissions) {
    return res.status(404).send("Admissions not found");
  }
  return res.status(200).send(admissions);
};
