import express from "express";

import {
  previewPayslip, generatePayslip,
  getPayslips, getPayslipById, deletePayslip,
  getAvailableEmployees,
  getPayslipsByMonth,
  updatePayslipStatus,
} from "../controllers/Payslipcontroller.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get   ("/preview",   checkAuth, previewPayslip);   // MUST be before /:id
router.get(
  "/available-employees",checkAuth,
  getAvailableEmployees
);
router.get("/by-month",checkAuth, getPayslipsByMonth);  

router.get   ("/",          checkAuth, getPayslips);

router.get   ("/:id",       checkAuth, getPayslipById);
router.post  ("/generate",  checkAuth, generatePayslip);
router.put   ("/:id/status", checkAuth, updatePayslipStatus);
router.delete("/:id",       checkAuth, deletePayslip);
export default router;
