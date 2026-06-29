import express from "express";
import {
  getAllCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
  getMyCompany,
  updateMyCompany,
} from "../controllers/companyController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", checkAuth, getAllCompanies);
router.post("/", checkAuth, addCompany);
router.put("/:id", checkAuth, updateCompany);
router.delete("/:id", checkAuth, deleteCompany);
router.get("/me", checkAuth, getMyCompany);
router.put("/me", checkAuth, updateMyCompany);

export default router;
