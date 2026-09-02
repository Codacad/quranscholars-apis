import express from "express";
import {
  admission,
  join,
  updateAdmissionDetails,
} from "../controllers/admission.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
import isAdmissionOwner from "../middlewares/isAdmissionOwner.js";

const router = express.Router();

router.post("/admission/me", isAuthenticatedUser, join);
router.get("/admission/me", isAuthenticatedUser, admission);
router.patch("/admission/me", isAuthenticatedUser, updateAdmissionDetails);

export default router;
