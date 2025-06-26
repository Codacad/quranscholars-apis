import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import filesUploadRoutes from './routes/filesUploadRoutes.js'
import admissionRoutes from "./routes/admissionRoutes.js";
import { dbCOnnection } from "./db.connection.js";
import cookieParser from "cookie-parser";
import paymentRoutes from './routes/paymentRoute.js'
dbCOnnection();
setInterval(() => {
  dbCOnnection();
}, 1000 * 60 * 60 * 24);
const app = express();

const PORT = process.env.PORT || 3000;
app.use(cookieParser());
const allowedOrigins = process.env.ORIGIN_URLS
  ? process.env.ORIGIN_URLS.split(",")
  : ["http://localhost:3001", "https://www.quranscholar.in"]; 

console.log("Allowed Origins:", allowedOrigins); 

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Origin:", origin); // Log the origin
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
app.options("*", cors());

app.get("/", (req, res) => {
  res.send({ Api: "Hello" });
});
app.use("/api/auth", userRoutes);
app.use("/api", messageRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", admissionRoutes);
app.use("/api", filesUploadRoutes);
app.use("/api", paymentRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} Port`);
});

export default app;
