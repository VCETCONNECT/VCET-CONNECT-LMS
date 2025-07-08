import express from "express";
import {
  getDefaulterReport,
  getStudentDetailsByRollNo,
  markDefaulter,
  getDefaulters,
  assignWork,
  markAsDone,
  getPendingWorksByStudentId,
  getDefaultersByMentorId,
  getDefaultersByClassInchargeId,
} from "../controllers/defaulter.controller.js";

const router = express.Router();

router.get(
  "/getStudentDetailsByRollforDefaulters/:roll_no",
  getStudentDetailsByRollNo
);

router.post("/markDefaulter/", markDefaulter);

router.get(
  "/getDefaulterReport/:defaulterType/:fromDate/:toDate",
  getDefaulterReport
);

router.get("/getDefaulters", getDefaulters);
router.get("/getDefaultersByMentorId/:mentorId", getDefaultersByMentorId);
router.get("/getDefaultersByClassInchargeId/:classInchargeId", getDefaultersByClassInchargeId);
router.post("/assignwork/:defaulterId", assignWork);

router.post("/markasdone/:defaulterId", markAsDone);
router.get("/pendingworks/:studentId", getPendingWorksByStudentId);

export default router;
