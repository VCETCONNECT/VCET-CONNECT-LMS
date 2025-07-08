import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import leaveRequestRoutes from "./routes/leave.route.js";
import odRequestRoutes from "./routes/od.route.js";
import departmentRoutes from "./routes/department.route.js";
import defaulterRoutes from "./routes/defaulter.route.js";
import dataRoutes from "./routes/data.route.js";
import mailRoutes from "./routes/mail.route.js";
import fetchRoutes from "./routes/fetch.route.js";
import cgpaRoutes from "./routes/cgpa.route.js";
import notificationRoutes from "./routes/notification.route.js";
dotenv.config();

// MongoDB connection setup
mongoose
  .connect(process.env.MONGO, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  })
  .then(() => {
    console.log("DB 🚀");
  })
  .catch((err) => {
    console.log("DB ❌", err);
  });

const __dirname = path.resolve();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/cgpa", cgpaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", leaveRequestRoutes);
app.use("/api", odRequestRoutes);
app.use("/api", departmentRoutes);
app.use("/api/defaulter", defaulterRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/fetch", fetchRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/notification", notificationRoutes);

// Serve static files from React build (ensure 'client/dist' exists)
app.use(express.static(path.join(__dirname, "client", "dist")));

// Fallback to index.html for other routes (SPA behavior)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Global error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`VCET 🚀 on port ${port}`);
});
