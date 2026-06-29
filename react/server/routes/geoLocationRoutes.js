import { Router } from "express";
import {
  getAllGeoLocations,
  getGeoLocationById,
  createGeoLocation,
  updateGeoLocation,
  deleteGeoLocation,
  bulkDeleteGeoLocations,
} from "../controllers/geoLocationController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/geo-locations", checkAuth, getAllGeoLocations);
// router.get("/:id", checkAuth, getGeoLocationById);
router.post("/add/geo-locations", checkAuth, createGeoLocation);
router.put("/geo-locations/:id", checkAuth, updateGeoLocation);
router.delete("/geo-locations/delete/:id", checkAuth, deleteGeoLocation);
router.post("/geo-locations/bulk-delete", checkAuth, bulkDeleteGeoLocations);

export default router;
