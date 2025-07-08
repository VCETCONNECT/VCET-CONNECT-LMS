import express from "express";
import {
  getClassInchargeBySectionId,
  getMentorById,
  getMenteeByMentorId,
  getWardDetailsByRollNumber
} from "../controllers/fetch.controller.js";

const router = express.Router();

router.get("/class-incharge/:sectionId", getClassInchargeBySectionId);
router.get("/mentor/:id", getMentorById);
router.get("/mentee/:mentorId", getMenteeByMentorId);
router.get("/getWardDetailsByRollNumber/:rollNo", getWardDetailsByRollNumber);

export default router;
