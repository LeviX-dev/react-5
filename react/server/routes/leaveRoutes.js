import express from "express";
import {

   updateLeaveStatus,  
   createLeaveApplication,
  getLeaveApplications,
  getRemainingLeaves,
  getLeaveBalance,
} from "../controllers/leaveController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();



router.put("/update-status", checkAuth, updateLeaveStatus);

router.post("/apply", checkAuth, createLeaveApplication);
router.get("/list", checkAuth, getLeaveApplications);
router.get("/employee/:employee_id", checkAuth, getLeaveApplications); // ← Support dashboard endpoint
router.get("/remaining", checkAuth, getRemainingLeaves);
router.get("/balance/:employee_id", checkAuth, getLeaveBalance);

export default router;