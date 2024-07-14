import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { configDotenv } from "dotenv";
import { dbCOnnection } from "./db.connection.js";
import cookieParser from "cookie-parser";
configDotenv();
dbCOnnection();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: "GET, POST, PUT, DELETE, PATCH",
    credentials: true,
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
})
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} Port`);
});
