import express from "express";
import {
  getEvents,
  addEvent,
  deleteEvent,
  markHolidayById,
  markEventById,
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  getUpcomingHolidays,
  getUpcomingEvents,
} from "../controllers/calendarController.js";

const router = express.Router();

router.get("/calendar", getEvents);
router.post("/calendar", addEvent);
router.delete("/calendar/:id", deleteEvent);
router.put("/calendar/mark-holiday", markHolidayById);
router.put("/calendar/mark-event", markEventById);

// Holiday management routes
router.get("/calendar/holidays", getHolidays);
router.post("/calendar/holidays", addHoliday);
router.put("/calendar/holidays/:id", updateHoliday);
router.delete("/calendar/holidays/:id", deleteHoliday);
router.get("/calendar/holidays/:id", deleteHoliday);
router.get("/calendar/upcoming-holidays", getUpcomingHolidays);
router.get("/calendar/upcoming-events", getUpcomingEvents);

export default router;
