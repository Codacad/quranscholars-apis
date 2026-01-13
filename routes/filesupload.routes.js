import express from "express";
import { profilePictureUpload, profilePictureUrl } from "../controllers/filesupload.controller.js";
import multer from "multer";
import { isAuthenticatedUser } from "../middlewares/isAuthenticated.js";
const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })
router.post('/upload/profile_picture', isAuthenticatedUser, upload.single('file'), profilePictureUpload)
router.get('/upload/profile_picture_url', isAuthenticatedUser, profilePictureUrl)

export default router