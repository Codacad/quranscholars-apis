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
import { requestOriginGuard } from "./middlewares/requestOriginGuard.js";
// import paymentRoutes from './routes/paymentRoute.js'


const app = express();

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

const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0");
  if (isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
  next();
};

app.use(compression());
app.use(securityHeaders);
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
app.use(requestOriginGuard(allowedOrigins));

app.get("/", (req, res) => {
  res.send({ Api: "Hello" });
});
app.use("/api/auth", authLimiter, userRoutes);
app.use("/api", messageRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", admissionRoutes);
app.use("/api", adminRoutes);
app.use("/api", filesUploadRoutes);
app.use("/api", courseRoutes);
// app.use("/api", paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const message = isProduction ? "Internal server error" : err.message;
  return res.status(err.status || 500).json({ message });
});

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
