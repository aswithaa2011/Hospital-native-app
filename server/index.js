import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDb from "./config/db.js";
import authRoutes from "./Routes/authRoutes.js";
import patientRoutes from "./Routes/patientRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

connectDb();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hospital API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);

app.listen(port, () => {
  console.log(`Server connected: http://localhost:${port}`);
});
