import express from "express";
import {
  changePassword,
  studentsignin,
  staffsignin,
  signout,
  updateProfile,
  forgotPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/studentsignin", studentsignin);

router.post("/staffsignin", staffsignin);

router.put("/changePassword/:userType/:id", changePassword);

router.put("/updateProfile/:userType/:id", updateProfile);

router.post("/signout", signout);

router.post("/forgot-password", forgotPassword);

export default router;
