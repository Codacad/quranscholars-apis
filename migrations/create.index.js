import mongoose from "mongoose";
import User from "../models/user/user.model.js";
import { configDotenv } from "dotenv";
configDotenv()
async function createUserIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await User.collection.createIndex({ email: 1 }, { unique: true })
        console.log("✅ Unique index on email created");
    } catch (error) {
        console.error("❌ Index creation failed:", error.message);
        process.exit(1)
    }
}

createUserIndex()