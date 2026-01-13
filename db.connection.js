import mongoose from "mongoose";
export const dbCOnnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`Mongodb connected`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}