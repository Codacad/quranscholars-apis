import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import { configDotenv } from "dotenv";
import { dbCOnnection } from "./db.connection.js";
import cookieParser from "cookie-parser";
import { performance } from "perf_hooks";
import compression from "compression";
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
    origin: ["http://localhost:3001", "https://www.quranscholar.in"],
    methods: ["GET, POST, PUT, DELETE, PATCH"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  const start = performance.now();
  res.on("finish", () => {
    const end = performance.now();
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${(
        end - start
      ).toFixed(2)}ms`
    );
  });
  next();
});

app.use(express.json());
app.get("/", (req, res) => {
  res.send({ Api: "Hello" });
});
app.use("/api", userRoutes);
app.use("/api", messageRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", admissionRoutes);

app.use(compression());
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} Port`);
});
