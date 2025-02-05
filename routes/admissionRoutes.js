import Router from "express";
import {
  admissions,
  getAdmission,
} from "../controllers/admissionController.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";

const router = Router();

router.get("/admissions", isAuthenticatedUser, admissions);
router.post("/admission/join", isAuthenticatedUser, getAdmission);

export default router;
