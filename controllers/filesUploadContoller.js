import multer from "multer";
import bucket from "../firebase.js";
import path from 'path'
import { fileURLToPath } from 'url';
import fs from "fs"
import User from "../models/user/userModel.js";
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const profilePictureUpload = async (req, res) => {
    const file = req.file
    const userId = req.user._id
    try {
        // 1. Check if file is present in the request
        if (!file) res.status(404).send({ message: "no file uploaded" })

        // 2. Create a unique file name for Firebase Storage
        const newFileName = `profile_${userId}_${Date.now()}-${req.file.originalname}`

        // 4. Create reference to the destination file in Firebase Storage
        const fileRef = bucket.file(newFileName)

        // 5. Get user and check for old profile picture
        const user = await User.findById(userId)
        const oldFileName = user.profilePicture?.filename

        // Write stream
        const stream = fileRef.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        })
        stream.on('error', (err) => {
            return res.status(500).json({ error: 'Upload failed', details: err.message });
        })

        stream.on('finish', async () => {
            // 8. Delete old picture from Firebase if it exists
            if (oldFileName) {
                const oldFile = bucket.file(oldFileName)
                await bucket.delete().catch(() => { })
            }

            // 9. save new reference
            user.profilePicture = {
                filename: newFileName,
                uploadedAt: new Date(),
            }
            await user.save()
            
            // 10 Send the response
            res.status(200).send({ message: 'Profile picture updated', profilePicture: newFileName })
        })
        stream.end(req.file.buffer)
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error uploading profile picture" });
    }
}

export const profilePictureUrl = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user?.profilePicture?.filename) {
            return res.status(404).send({ message: "Profile picture not found" })
        }
        const file = bucket.file(user.profilePicture.filename)
        const [signedUrl] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000
        })
        res.json({ url: signedUrl })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}