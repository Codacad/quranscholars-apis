import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
import RecordedCourse from '../models/recorded-course/recorded-course.model.js';
import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);
configDotenv();
const recordedCourseIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await RecordedCourse.collection.createIndex({ slug: 1 }, { unique: true, name: 'Recorded Course slug uniqueness index' });
        await RecordedCourse.collection.createIndex({ category: 1, level: 1, published: 1, status: 1 }, { name: 'Recorded Course Category, Level, Published & Status index' });
        await RecordedCourse.collection.createIndex({ featured: 1, published: 1 }, { name: 'Recorded Course Featured and Published index' });
        await RecordedCourse.collection.createIndex({ instructor: 1, status: 1 }, { name: "Recorded Course Instructor & Status index" })
        await RecordedCourse.collection.createIndex({ createdAt: -1 }, { name: 'Recorded Course createdAt descending index' });
        console.log('Recorded Course indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error.message);
    }
}

recordedCourseIndexes();