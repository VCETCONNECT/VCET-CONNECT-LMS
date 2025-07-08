import express from "express";
import {
  deleteUser,
  updateUser,
  getStaffProfile,
  getStudent,
  getStaff,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.put("/update/:id", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/staff/:userId", verifyToken, getStaffProfile);
router.get("/student/:id", getStudent);
router.get("/staff/:id", getStaff);

export default router;
