import express from 'express';
import {
  getDepartments,
  getDepartmentIdByName,
  getBatches,
  getSections,
  getMentors,
  getClassIncharges,
  getSectionIdByBatchAndName,
  getDepartmentById,
  getBatchById ,
  getSectionNameById,
  getDepartmentNameByCurrentUserId,
  deleteMentor,
  addSection,
  addDepartment,
  deleteSection,
  addNewBatch,
  deleteBatch,
  deleteDepartment,

  deleteClassIncharge,
  getLeaveRequests,
  getODRequests,
  getDefaulters
} from '../controllers/department.controller.js';

const router = express.Router();


// TODO: Seperate the section and batch route to a seperate file

router.get('/departments', getDepartments);
router.get('/departments/:id', getDepartmentById);
router.get('/department/:departmentName', getDepartmentIdByName); 
router.get('/departments/:departmentId/batches', getBatches);
router.get('/getDepartmentNameByCurrentUserId', getDepartmentNameByCurrentUserId);
router.get('/batches/:id', getBatchById);
router.get('/batches/:batchId/sections', getSections);
router.get('/batches/:batchId/sections/:sectionName', getSectionIdByBatchAndName);
router.get('/section/:id', getSectionNameById);
router.get('/sections/:sectionId/mentors', getMentors);
router.get("/sections/:sectionId/classIncharges", getClassIncharges);
router.delete('/deletementors/:mentorId',deleteMentor);
router.delete('/deleteClassIncharge/:inchargeId',deleteClassIncharge);
router.post('/addSection',addSection);
router.post('/departments/addDepartment',addDepartment)
router.post('/batches/addBatch',addNewBatch)
router.delete('/sections/deleteSection/:sectionId',deleteSection);
router.delete('/batches/deleteBatch/:batchId',deleteBatch);
router.delete('/departments/deleteDepartment/:deptId',deleteDepartment);

router.get('/department/:departmentId/leaveRequests',getLeaveRequests);
router.get('/department/:departmentId/odRequests',getODRequests);
router.get('/department/:departmentId/defaulters',getDefaulters);

export default router;
