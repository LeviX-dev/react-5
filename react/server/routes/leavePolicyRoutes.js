import express from "express";
import {
  createPolicy,
  getPolicies,
  updatePolicy,
  deletePolicy,
} from "../controllers/leavePolicyController.js";
import { bulkAssignLeavePolicy } from "../controllers/bulkPolicyController.js";

const router = express.Router();

router.post("/create", createPolicy);
router.post("/bulk-assign", bulkAssignLeavePolicy);
router.get("/list", getPolicies);
router.put("/update/:id", updatePolicy);
router.delete("/delete/:id", deletePolicy);

export default router;