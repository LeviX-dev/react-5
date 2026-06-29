// salaryPolicyRoutes.js
import express from "express";
import {
  createSalaryPolicy,
  updateSalaryPolicy,
  deleteSalaryPolicy,
  getSalaryPolicies,
  getEarningsByPolicy,
  getDeductionsByPolicy,
  getContributionsByPolicy,
} from "../controllers/salaryPolicyController.js";
import { bulkAssignSalaryPolicy } from "../controllers/bulkPolicyController.js";

const router = express.Router();

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.post("/add",           createSalaryPolicy);
router.post("/bulk-assign",  bulkAssignSalaryPolicy);
router.put("/update/:id",     updateSalaryPolicy);
router.delete("/delete/:id",  deleteSalaryPolicy);
router.get("/",               getSalaryPolicies);

// ── Per-policy breakdown ──────────────────────────────────────────────────────
// NOTE: these MUST be defined before "export default router"
router.get("/:id/earnings",      getEarningsByPolicy);
router.get("/:id/deductions",    getDeductionsByPolicy);
router.get("/:id/contributions", getContributionsByPolicy);

export default router;