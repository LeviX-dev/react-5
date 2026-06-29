import express from "express";
import {
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/announcements", checkAuth, getAnnouncements);
router.post("/announcements", checkAuth, addAnnouncement);
router.put("/announcements/:id", checkAuth, updateAnnouncement);
router.delete("/announcements/:id", checkAuth, deleteAnnouncement);

export default router;
