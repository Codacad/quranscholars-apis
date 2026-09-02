import express from "express";
import {
  deleteAdmissionForAdmin,
  getAdmissionByIdForAdmin,
  getAdmissionsForAdmin,
  updateAdmissionForAdmin,
  updateAdmissionStatusForAdmin,
} from "../controllers/adminAdmission.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Admission Routes
router.get("/admissions", isAuthenticatedUser, isAdmin, getAdmissionsForAdmin);
router.get("/admissions/:id", isAuthenticatedUser, isAdmin, getAdmissionByIdForAdmin);
router.patch("/admissions/:id/status", isAuthenticatedUser, isAdmin, updateAdmissionStatusForAdmin);
router.patch("/admissions/:id", isAuthenticatedUser, isAdmin, updateAdmissionForAdmin);
router.delete("/admissions/:id", isAuthenticatedUser, isAdmin, deleteAdmissionForAdmin);


export default router;
