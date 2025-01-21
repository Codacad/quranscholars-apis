import mongoose from "mongoose";

export const dbCOnnection = async () => {
  const uri = "mongodb://0.0.0.0:27017/users"
  try {
       const db = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Mongodb connected`);
        const result = await db.connection.db.admin().ping()
        console.log(result);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}