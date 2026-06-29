import cron from "node-cron";
import {
  generateTodayAttendance,
  markTodayWeekOffAttendances,
} from "../controllers/yearattendeceController.js";
import { autoCloseOpenCheckouts } from "./autoCloseAttendance.js";
import { startMissingAttendanceCron, markMissingAttendanceAsAbsent } from "./missingAttendanceCron.js";
import { aggregateAllLiveTrackingSummaries } from "../controllers/liveTrackingController.js";

export const startAttendanceCron = () => {
  // autoCloseOpenCheckouts();
  // Auto-close at 6:30 PM
  cron.schedule("1 1 * * *", () => {
    console.log("⏰ Running auto‑close cron job...");
    autoCloseOpenCheckouts();
  });
  
  // Daily at 12:00 AM - generate tomorrow's attendance
  cron.schedule("0 0 * * *", async () => {
    console.log("🕛 Daily Attendance CRON START:", new Date().toLocaleString());
    await generateTodayAttendance();
    console.log("✅ Daily Attendance CRON END");
  });

  // Daily at 1:00 PM - mark week-offs
  cron.schedule("18 13 * * *", async () => {
    console.log("🕐 Week-off Attendance CRON START:", new Date().toLocaleString());
    try {
      const inserted = await markTodayWeekOffAttendances();
      console.log(`✅ Week-off Attendance CRON END: inserted ${inserted} rows`);
      if (inserted === 0) {
        console.log("ℹ️  Note: 0 rows means either today is not a week-off day or all employees already have records");
      }
    } catch (err) {
      console.error("❌ Week-off Attendance CRON ERROR:", err);
    }
  });

  // Daily at 11:59 PM - aggregate all live tracking summaries for today
  cron.schedule("59 23 * * *", async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    console.log(`⏰ Running live tracking route summaries aggregation for today (${todayStr})...`);
    await aggregateAllLiveTrackingSummaries(todayStr);
  });

  // Daily at 1:00 AM - mark missing attendance as absent (for previous day)
  startMissingAttendanceCron();

  console.log("🟢 All attendance CRON jobs initialized");
};

// Export for manual testing
export { markMissingAttendanceAsAbsent };