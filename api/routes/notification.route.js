import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  sendNotificationToStudent,
  sendNotificationToAllStudents,
  sendProfileUpdateReminder,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Route to send notification to a specific student
router.post("/send-to-student", verifyToken, sendNotificationToStudent);

// Route to send notification to all students (with optional filters)
router.post("/send-to-all", verifyToken, sendNotificationToAllStudents);

// Route to send profile update reminders to students with incomplete profiles
router.post("/send-profile-reminder", verifyToken, sendProfileUpdateReminder);

export default router;
