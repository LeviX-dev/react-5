import express from "express";
import {
  getPolicies,
  addPolicy,
  updatePolicy,
  deletePolicy
} from "../controllers/policyController.js";

const router = express.Router();

// GET
router.get("/", getPolicies);

// ADD
router.post("/add", addPolicy);

// UPDATE
router.put("/update/:id", updatePolicy);

// DELETE
router.delete("/delete/:id", deletePolicy);

export default router;