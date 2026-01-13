import Router from "express";
import { dashbaord } from "../controllers/dashboard.controller.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
const router = Router();
router.get("/dashboard", isAuthenticatedUser, dashbaord);
export default router;
