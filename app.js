import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
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
const allowedOrigins = process.env.ORIGIN_URLS.split(",");
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET, POST, PUT, DELETE, PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options("*", cors());

app.get("/", (req, res) => {
  res.send({ Api: "Hello" });
});
app.use("/api", userRoutes);
app.use("/api", messageRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", admissionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} Port`);
});

export default app;
