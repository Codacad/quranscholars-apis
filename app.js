import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { configDotenv } from "dotenv";
import { dbCOnnection } from "./db.connection.js";
import cookieParser from "cookie-parser";
configDotenv();
dbCOnnection();
setInterval(() => {
  dbCOnnection();
}, 1000 * 60 * 60 * 24);
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3001", process.env.ORIGIN],
    methods: "GET, POST, PUT, DELETE, PATCH",
    credentials: true,
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api", userRoutes);
app.use("/api", messageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} Port`);
});
