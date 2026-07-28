import dns from 'node:dns';
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import compression from "compression";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import filesUploadRoutes from './routes/filesupload.routes.js'
import admissionRoutes from "./routes/admission.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { dbCOnnection } from "./db.connection.js";
import cookieParser from "cookie-parser";
import courseRoutes from './routes/course.routes.js'
import recordedCourseRoutes from './routes/recorded-course.routes.js'; 
import instructorRecordedCoursesRoutes from './routes/instructor.recorded-courses.routes.js'; 
import errorMiddleware from './middlewares/errorMiddleware.js';
import helmet from 'helmet';
import { isAuthenticatedUser } from './middlewares/isAuthenticated.js';
import { isAdmin } from './middlewares/isAdmin.js';
import isInstructor from './middlewares/isInstructor.js';
// import paymentRoutes from './routes/paymentRoute.js'

dns.setServers(['1.1.1.1', '8.8.8.8']);
const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
const allowedOrigins = process.env.ORIGIN_URLS
  ? process.env.ORIGIN_URLS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://www.quranscholar.in",
  ];
const isProduction = process.env.NODE_ENV === "production";

const createInMemoryRateLimiter = ({ windowMs, max }) => {
  const bucket = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const entry = bucket.get(key);
    if (!entry || now - entry.start > windowMs) {
      bucket.set(key, { count: 1, start: now });
      return next();
    }
    if (entry.count >= max) {
      return res.status(429).json({ message: "Too many requests" });
    }
    entry.count += 1;
    return next();
  };
};

const globalLimiter = createInMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
const authLimiter = createInMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
});


app.use(compression());
app.use(helmet({
  contentSecurityPolicy:false
}))
app.use(globalLimiter);

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

app.use("/api/auth", authLimiter, userRoutes);
app.use("/api/admin", isAuthenticatedUser, isAdmin, adminRoutes);
app.use("/api/instructor", isAuthenticatedUser, isInstructor, instructorRecordedCoursesRoutes);
app.use("/api", messageRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", admissionRoutes);
app.use("/api", filesUploadRoutes);
app.use("/api", courseRoutes);
app.use("/api", recordedCourseRoutes);

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await dbCOnnection();
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT} Port`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
