import express from "express";
import cors from "cors";
import  router from "./routes/routes.js";
import { configDotenv } from "dotenv";
configDotenv();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} Port`);
});
