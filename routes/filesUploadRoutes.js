import express from "express";
import { profilePictureUpload } from "../controllers/filesUploadContoller.js";
import multer from "multer";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })
router.post('/upload/profile_picture', isAuthenticatedUser, upload.single('file'), profilePictureUpload)

export default router