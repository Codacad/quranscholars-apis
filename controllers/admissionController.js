import Admission from "../models/admission/admission.js";
export const admissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ email: req.user.email }).populate(
      "user",
      "fullname email role createdAt updatedAt"
    );
    res.json(admissions);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
export const getAdmission = async (req, res) => {
  const {
    fullName,
    email,
    address,
    dob,
    contactNumber,
    country,
    zipCode,
    state,
    city,
    gender,
    selectedCourses,
  } = req.body;
  try {
    const isEmailUsed = await Admission.findOne({ email });
    if (isEmailUsed)
      return res.status(404).send({ message: "Email is registered with us" });
    const newAdmission = new Admission({
      fullName,
      email,
      user: req.user._id,
      address,
      dob,
      contactNumber,
      country,
      zipCode,
      city,
      state,
      country,
      gender,
      selectedCourses,
    });
    const admission = await newAdmission.save();
    res.status(201).json(admission);
  } catch (error) {
    res.status(401).send({ message: error.message.split(":")[2] });
  }
};
