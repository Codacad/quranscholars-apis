import Router from "express";
import {
  admissions,
  join,
  updateAdmissionDetails,
} from "../controllers/admissionController.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";

const router = Router();

router.get("/admissions", isAuthenticatedUser, admissions);
router.post("/admission/join", isAuthenticatedUser, join);
router.patch("/admission/update", isAuthenticatedUser, updateAdmissionDetails);

export default router;
