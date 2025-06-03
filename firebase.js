import admin from 'firebase-admin'
import fs from 'fs'
import { configDotenv } from 'dotenv';
configDotenv()
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serviceAccount = JSON.parse(
    fs.readFileSync(path.join(__dirname, './serviceAccountKey.json'), 'utf-8')
)

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    storageBucket:process.env.FIREBASE_STORAGE_BUCKET
})

const bucket = admin.storage().bucket()
export default bucket