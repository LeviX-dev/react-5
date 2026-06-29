  import express from "express";
  import {
    getAllOfficeShifts,
    getOfficeShiftById,
    createOfficeShift,
    updateOfficeShift,
    deleteOfficeShift,
    bulkDeleteOfficeShift 
    
  } from "../controllers/officeShiftController.js";

  const router = express.Router();

  router.get("/office-shifts", getAllOfficeShifts);
  router.get("/office-shifts/:id", getOfficeShiftById);
  router.post("/office-shifts", createOfficeShift);

  // ✅ NEW
  router.put("/office-shifts/:id", updateOfficeShift);
  router.delete("/office-shifts/:id", deleteOfficeShift);

  // ✅ BULK DELETE (VERY IMPORTANT)
router.post("/office-shifts/bulk-delete", bulkDeleteOfficeShift);

  export default router;