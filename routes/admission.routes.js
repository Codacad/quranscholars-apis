import express from "express";
import {
  admissions,
  join,
  updateAdmissionDetails,
} from "../controllers/admission.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/admissions", isAuthenticatedUser, admissions);
router.post("/admission/join", isAuthenticatedUser, join);
router.patch("/admission/update", isAuthenticatedUser, updateAdmissionDetails);

export default router;
