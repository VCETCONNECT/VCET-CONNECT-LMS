import Student from "../models/student.model.js";
import { sendEmail } from "./email.service.js";
import {
  NOTIFICATION_TYPES,
  EMAIL_TEMPLATES,
  generateCustomTemplate,
} from "../constants/notificationTemplates.js";

// Utility function to log notifications
const logNotification = (recipientEmail, type, status, error = null) => {
  console.log(`Email notification sent to ${recipientEmail}:`, {
    type,
    status,
    timestamp: new Date(),
    error: error ? error.message : null,
  });
};

// Send notification to a specific student
export const sendNotificationToStudent = async (req, res) => {
  try {
    const { studentId, type, customTitle, customMessage } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let emailContent;

    // Handle custom notifications
    if (customTitle && customMessage) {
      emailContent = generateCustomTemplate(
        type,
        customTitle,
        customMessage,
        student.name
      );
    } else {
      // Handle predefined notifications
      if (!EMAIL_TEMPLATES[type]) {
        return res.status(400).json({ message: "Invalid notification type" });
      }
      emailContent = EMAIL_TEMPLATES[type].template(student.name);
    }

    // Send email using the HTML content
    await sendEmail(
      student.email,
      emailContent.subject,
      emailContent.html || emailContent.text
    );
    logNotification(student.email, type, "success");

    res.status(200).json({
      message: "Email notification sent successfully",
      recipient: student.email,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
};

// Send notification to all students
export const sendNotificationToAllStudents = async (req, res) => {
  try {
    const { type, customTitle, customMessage, filter } = req.body;

    let query = {};
    if (filter) {
      if (filter.section) query.section_name = filter.section;
      if (filter.batch) query.batchId = filter.batch;
      if (filter.department) query.departmentId = filter.department;
    }

    const students = await Student.find(query);
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    const results = {
      total: students.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Process each student
    for (const student of students) {
      try {
        let emailContent;

        if (customTitle && customMessage) {
          emailContent = generateCustomTemplate(
            type,
            customTitle,
            customMessage,
            student.name
          );
        } else {
          if (!EMAIL_TEMPLATES[type]) {
            throw new Error("Invalid notification type");
          }
          emailContent = EMAIL_TEMPLATES[type].template(student.name);
        }

        // Send email using the HTML content
        await sendEmail(
          student.email,
          emailContent.subject,
          emailContent.html || emailContent.text
        );
        logNotification(student.email, type, "success");
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          student: student.email,
          error: error.message,
        });
        logNotification(student.email, type, "failed", error);
      }
    }

    res.status(200).json({
      message: "Bulk email notification process completed",
      results,
    });
  } catch (error) {
    console.error("Error in bulk notification:", error);
    res.status(500).json({ message: "Failed to process bulk notification" });
  }
};

// Send notification to students with incomplete profiles
export const sendProfileUpdateReminder = async (req, res) => {
  try {
    const incompleteProfiles = await Student.find({
      $or: [
        { linkedin_url: { $exists: false } },
        { github_url: { $exists: false } },
        { leetcode_url: { $exists: false } },
        { hackerrank_url: { $exists: false } },
        { portfolio_url: { $exists: false } },
        { resume_url: { $exists: false } },
        { linkedin_url: "" },
        { github_url: "" },
        { leetcode_url: "" },
        { hackerrank_url: "" },
        { portfolio_url: "" },
        { resume_url: "" },
      ],
    });
    console.log("Incomplete profiles:", incompleteProfiles.length);
    if (incompleteProfiles.length === 0) {
      return res.status(200).json({ message: "No incomplete profiles found" });
    }

    const results = {
      total: incompleteProfiles.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (const student of incompleteProfiles) {
      try {
        const emailContent = EMAIL_TEMPLATES[
          NOTIFICATION_TYPES.PROFILE_UPDATE_REMINDER
        ].template(student.name);
        // console.log("Email content:", emailContent);
        // Send email using the HTML content
        await sendEmail(
          // "navinkumaran2004@gmail.com",
          student.email,
          emailContent.subject,
          emailContent.html || emailContent.text
        );
        console.log("Email sent to:", student.email);
        logNotification(
          student.email,
          NOTIFICATION_TYPES.PROFILE_UPDATE_REMINDER,
          "success"
        );
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          student: student.email,
          error: error.message,
        });
        logNotification(
          student.email,
          NOTIFICATION_TYPES.PROFILE_UPDATE_REMINDER,
          "failed",
          error
        );
      }
    }

    res.status(200).json({
      message: "Profile update reminder emails sent",
      results,
    });
  } catch (error) {
    console.error("Error sending profile update reminders:", error);
    res
      .status(500)
      .json({ message: "Failed to send profile update reminders" });
  }
};
