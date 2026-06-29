import { Router } from "express";
import {
  geoHeartbeat,
  getGeoFenceNotifications,
  markNotificationRead,
} from "../controllers/geoFenceMonitorController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = Router();

// ── Employee: heartbeat (any authenticated employee) ──────────────────────────
router.post("/attendance/geo-heartbeat", checkAuth, geoHeartbeat);

// ── All authenticated users: system-wide notification feed ────────────────────
router.get("/geo-fence/notifications",          checkAuth, getGeoFenceNotifications);
router.put("/geo-fence/notifications/:id/read", checkAuth, markNotificationRead);

export default router;
