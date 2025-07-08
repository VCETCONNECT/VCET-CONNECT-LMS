import express from "express";
import {
  uploadCourseDataForDepartment,
  getCourseDataForDepartment,
  getNormalCoursesForDepartment,
  getVerticalCoursesForDepartment,
  editCourseDataUsingCourseId,
  addOpenElectiveCourse,
  calculateSemesterResults,
  getSemesterResults,
  saveSemesterResults,
  clearSemesterResults,
  getStudentResultsByClassInchargeId,
} from "../controllers/cgpa.controller.js";

const router = express.Router();

router.post("/uploadCourseDataForDepartment", uploadCourseDataForDepartment);
router.get("/getCourseDataForDepartment", getCourseDataForDepartment);
router.get("/getNormalCoursesForDepartment", getNormalCoursesForDepartment);
router.get("/getVerticalCoursesForDepartment", getVerticalCoursesForDepartment);
router.put("/editCourseDataUsingCourseId", editCourseDataUsingCourseId);
router.post("/addOpenElectiveCourse", addOpenElectiveCourse);
router.post("/calculateSemesterResults", calculateSemesterResults);
router.get("/getSemesterResults", getSemesterResults);
router.post("/saveSemesterResults", saveSemesterResults);
router.post("/clearSemesterResults", clearSemesterResults);
router.get("/getStudentResults", getSemesterResults);
router.get(
  "/getStudentResultsByClassInchargeId/:userId",
  getStudentResultsByClassInchargeId
);

export default router;
