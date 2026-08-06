import multer from 'multer';
import path from "node:path";
import { randomUUID } from "node:crypto";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/temp/images',)
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname)
        const uniqueName = `${randomUUID()}${extension}`
        cb(null, uniqueName)
    },
})

const fileFilter = function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and WEBP files are allowed!"), false)
    }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } })

export default upload;