import express from "express";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  deleteAdmissionForAdmin,
  getAdmissionByIdForAdmin,
  getAdmissionsForAdmin,
  updateAdmissionForAdmin,
  updateAdmissionStatusForAdmin,
} from "../controllers/adminAdmission.controller.js";

const router = express.Router();

router.use("/admin", isAuthenticatedUser, isAdmin);

router.get("/admin/admissions", getAdmissionsForAdmin);
router.get("/admin/admissions/:id", getAdmissionByIdForAdmin);
router.patch("/admin/admissions/:id/status", updateAdmissionStatusForAdmin);
router.patch("/admin/admissions/:id", updateAdmissionForAdmin);
router.delete("/admin/admissions/:id", deleteAdmissionForAdmin);

export default router;
