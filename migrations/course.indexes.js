import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import Course from "../models/courses/courses.model.js";
configDotenv()
const courseIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Course.collection.createIndex({ slug: 1 }, { unique: true, name: 'Course slug uniqueness' });

        await Course.collection.createIndex({ category: 1, level: 1 }, { name: 'Course Category Level' });

        await Course.collection.createIndex({ status: 1, isActive: 1 }, { name: 'Course Visibility' });

        await Course.collection.createIndex({ instructor: 1 }, { name: 'Course Course Instructor' });

        await Course.collection.createIndex({ rating: -1 }, { name: 'Course rating descending' });

        await Course.collection.createIndex({ createdAt: -1 }, { name: 'Course createdAt descending' })
        console.log('Courses indexes created successfully')
    } catch (error) {
        console.log("Error creating courses indexes", error.message)
        process.exit(1)
    }
}

courseIndexes()