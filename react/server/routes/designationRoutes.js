// designationRoutes.js
import express from "express";
import {
  
  addDesignation,
  updateDesignation,
  deleteDesignation,
  getDesignations,
} from "../controllers/designationController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/designations", checkAuth, getDesignations);
router.post("/designations/add", checkAuth, addDesignation);
router.put("/designations/update/:id", checkAuth, updateDesignation);
router.delete("/designations/delete/:id", checkAuth, deleteDesignation);

export default router;
