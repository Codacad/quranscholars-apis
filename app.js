import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import filesUploadRoutes from './routes/filesupload.routes.js'
import admissionRoutes from "./routes/admission.routes.js";
import { dbCOnnection } from "./db.connection.js";
import cookieParser from "cookie-parser";
import courseRoutes from './routes/course.routes.js'
// import paymentRoutes from './routes/paymentRoute.js'


const app = express();

const PORT = process.env.PORT || 3000;
app.use(cookieParser());
const allowedOrigins = process.env.ORIGIN_URLS
  ? process.env.ORIGIN_URLS.split(",")
  : ["http://localhost:3001", "https://www.quranscholar.in"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({ Api: "Hello" });
});
app.use("/api/auth", userRoutes);
app.use("/api", messageRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", admissionRoutes);
app.use("/api", filesUploadRoutes);
app.use("/api", courseRoutes);
// app.use("/api", paymentRoutes);

dbCOnnection().catch(err => {
  console.log('Initial DB connection failed', err.message)
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} Port`);
})

export default app;
