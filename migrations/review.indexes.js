import mongoose from 'mongoose';
import Review from '../models/review/review.model.js';
import dotenv from 'dotenv';
import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8'])
dotenv.config();
const reviewIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        await Review.collection.createIndex({ userId: 1 }, { name: "User Id Index" });
        await Review.collection.createIndex({ courseId: 1 }, { name: " Course Id Index" });
        await Review.collection.createIndex({ userId: 1, courseId: 1 }, { name: "User Id and Course Id Index" });
    } catch (err) {
        console.error("Error creating indexes:", err.message);
    }
}

reviewIndexes()