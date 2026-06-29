import express from "express";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} from "../controllers/departmentController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/departments", checkAuth, getDepartments);

router.post("/departments", checkAuth, addDepartment);

router.put("/departments/:id", checkAuth, updateDepartment);

router.delete("/departments/:id", checkAuth, deleteDepartment);
router.get("/dashboard/department-stats", checkAuth, getDepartmentStats);

export default router;
