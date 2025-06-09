import admin from 'firebase-admin'
// import fs from 'fs'
import { configDotenv } from 'dotenv';
configDotenv()
// import path from 'path'
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// const serviceAccount = JSON.parse(
//     fs.readFileSync(path.join(__dirname, './serviceAccountKey.json'), 'utf-8')
// )
admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: process.env.FIREBASE_AUTH_URI,
        tokenUri: process.env.FIREBASE_TOKEN_URI,
        authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        clientC509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
        universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
})

const bucket = admin.storage().bucket()
export default bucket