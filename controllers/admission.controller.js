import Admission from "../models/admission/admission.model.js";
export const admissions = async (req, res) => {
  try {
    const admissions = await Admission.find({
      email: req.user.email,
    }).populate("user", "fullname email role createdAt updatedAt");
    res.status(200).json(admissions);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
export const join = async (req, res) => {
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
      return res.status(404).send({
        message:
          "Your admission is already registered. A user can have only one admission.",
      });
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

export const updateAdmissionDetails = async (req, res) => {
  try {
    for (let key in req.body) {
      if (key === "email") {
        return res.status(400).json({ message: "Email cannot be updated" });
      }
    }
    const admission = await Admission.findOneAndUpdate(
      { user: req.user._id },
      { ...req.body },
      { new: true }
    );

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
