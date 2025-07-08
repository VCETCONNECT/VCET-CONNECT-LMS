import express from "express";
import {
  createLeaveRequest,
  getleaverequestbyUserId,
  getleaverequestbyMentorId,
  getleaverequestbyclassinchargeid,
  updateLeaveRequestStatusByMentorId,
  updateLeaveRequestStatusByClassInchargeId,
  mentors,
  getleaverequestsbySectionId,
  updateLeaveRequestStatusByHODId,
  deleteleavebyId,
  updateLeaveRequestStatusByMentorIdForBothRoles,
  createLeaveRequestWithStatus,
} from "../controllers/leave.controller.js";

const router = express.Router();

router.post("/leave-request", createLeaveRequest);
router.post("/leave-request-staff", createLeaveRequestWithStatus);
router.get("/getleaverequest/:id", getleaverequestbyUserId);
router.delete("/deleteleave/:id", deleteleavebyId);
router.get("/getleaverequestbymentorid/:id", getleaverequestbyMentorId);
router.get(
  "/getleaverequestbyclassinchargeid/:id",
  getleaverequestbyclassinchargeid
);

router.get("/mentors", mentors);
// router.get('/getStaffLeaveRequests', getStaffLeaveRequests);
router.get("/leaverequestsbysectionid/:id", getleaverequestsbySectionId);

router.post(
  "/leave-requestsbyclassinchargeid/:id/status",
  updateLeaveRequestStatusByClassInchargeId
);
router.post(
  "/leave-requestsbyhodid/:id/status",
  updateLeaveRequestStatusByHODId
);
router.post(
  "/leave-requestsbymentorid/:requestId/status",
  updateLeaveRequestStatusByMentorIdForBothRoles
);

export default router;


