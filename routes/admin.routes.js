import express from "express";
import {
  deleteAdmissionForAdmin,
  getAdmissionByIdForAdmin,
  getAdmissionsForAdmin,
  updateAdmissionForAdmin,
  updateAdmissionStatusForAdmin,
} from "../controllers/adminAdmission.controller.js";


const router = express.Router();

// Admission Routes
router.get("/admissions", getAdmissionsForAdmin);
router.get("/admissions/:id", getAdmissionByIdForAdmin);
router.patch("/admissions/:id/status", updateAdmissionStatusForAdmin);
router.patch("/admissions/:id", updateAdmissionForAdmin);
router.delete("/admissions/:id", deleteAdmissionForAdmin);


export default router;
