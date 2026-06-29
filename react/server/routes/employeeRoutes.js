import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  addAttendance,
  addEmployee,
  deleteEmployee,
  deleteEmployees,
  getAllEmployeesDropdown,
  getAllGeoLocations,
  getAttendance,
  getCompanies,
  getDesignations,
  getEmployeeById,
  getEmployees,
  getOfficeShifts,
  getRoles,
  saveEmployeeSalary,
  updateEmployee,
  updateEmployeeStatus,
  uploadEmployeePhoto,
  getRecentEmployees,   // ✅ NEW
  applyLeavePolicyToEmployee,
  importEmployees,    // ✅ NEW - Import employees from Excel/CSV
  importAttendance,   // ✅ NEW - Import attendance from Excel/CSV
  addBulkAttendance,  // ✅ NEW - Bulk add attendance from Employee List
} from "../controllers/employeeController.js";
import { getDepartments } from "../controllers/departmentController.js";
import { checkAuth } from "../middleware/authMiddleware.js";
import { getEmployeeSalary, saveEmployeeSalary2 } from "../controllers/employeeSalaryController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../../public/uploads/employees");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "employee-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|jfif|gif/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error("Only gif, jpg, jpeg, png, jfif allowed"));
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// ─── Multer config for import files (Excel/CSV) ─────────────────────────────
const importUploadDir = path.join(__dirname, "../../public/uploads/imports");
if (!fs.existsSync(importUploadDir)) fs.mkdirSync(importUploadDir, { recursive: true });

const importStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, importUploadDir),
  filename:    (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "import-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const importFileFilter = (req, file, cb) => {
  const allowedExts = /\.xls|\.xlsx|\.csv/;
  const allowedMimes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/csv",
  ];
  const extValid = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedMimes.includes(file.mimetype) || file.mimetype === "application/octet-stream";
  if (extValid || mimeValid) {
    return cb(null, true);
  }
  cb(new Error("Only .xls, .xlsx, and .csv files are allowed"));
};

const uploadImport = multer({
  storage: importStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: importFileFilter,
});

const router = express.Router();

// ─── Dropdown / lookup routes (before :id wildcards) ───────────────────────
router.get("/employees/dropdown", getAllEmployeesDropdown);
router.get("/employees/recent",   getRecentEmployees);    // ✅ NEW — ?limit=8

// ─── Reference data ─────────────────────────────────────────────────────────
router.get("/company/all",    getCompanies);
router.get("/departments",    getDepartments);
router.get("/designations",   getDesignations);
router.get("/office-shifts",  getOfficeShifts);
router.get("/roles/all",      getRoles);
router.get("/geo-locations",  getAllGeoLocations);

// ─── Employee CRUD ───────────────────────────────────────────────────────────
router.post("/add/employees",             checkAuth, addEmployee);
router.get("/employees",                  getEmployees);
router.get("/employees/:id",              getEmployeeById);
router.put("/employees/:id",              updateEmployee);
router.put("/employees/:id/status",       updateEmployeeStatus);
router.delete("/employees/:id",           deleteEmployee);
router.post("/employees/delete",          deleteEmployees);
router.post("/employees/upload-photo",    upload.single("photo"), uploadEmployeePhoto);
router.post("/employees/import",         checkAuth, uploadImport.single("file"), importEmployees);

// ─── Attendance ──────────────────────────────────────────────────────────────
router.post("/attendance/add",      addAttendance);
router.get("/attendance",           getAttendance);
router.post("/attendance/import",   checkAuth, uploadImport.single("file"), importAttendance);
router.post("/attendance/bulk-add", checkAuth, addBulkAttendance);  // ✅ NEW

// ─── Salary ─────────────────────────────────────────────────────────────────
router.get("/employees/:employeeId/salary", getEmployeeSalary);
router.post("/employees/save-salary",       saveEmployeeSalary2);
router.post("/apply-leave-policy", applyLeavePolicyToEmployee);
export default router;