import Admission from "../models/admission/admission.js";
export const admissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ email: req.user.email }).populate(
      "user",
      "fullname email role createdAt updatedAT"
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
  // console.log(req.user._id);
  console.log(req.user);
  try {
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
