// services/missingAttendanceCron.js
import db from "../config/db.js";
import cron from "node-cron";

const executeQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) {
        console.error("DB ERROR:", err);
        reject(err);
      } else resolve(results);
    });
  });

const formatDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getDayName = (date) =>
  new Date(date).toLocaleString("en-US", { weekday: "long" }).toLowerCase();

const isWeekOff = (shift, date) => {
  if (!shift) return false;
  const dayName = getDayName(date);
  const dayIn = shift[`${dayName}_in`];
  const dayOut = shift[`${dayName}_out`];
  return (!dayIn || dayIn === '') && (!dayOut || dayOut === '');
};

const isHoliday = async (date) => {
  const rows = await executeQuery(
    `SELECT id FROM calendar_events 
     WHERE event_date = ? AND is_holiday_marked = 1`,
    [date]
  );
  return rows.length > 0;
};

export const markMissingAttendanceAsAbsent = async (targetDate = null) => {
  const dateToProcess = targetDate || formatDate(new Date());
  console.log(`🕒 Running missing attendance check for: ${dateToProcess}`);

  try {
    const employees = await executeQuery(
      `SELECT e.id, e.office_shift_id, os.* 
       FROM employees e
       LEFT JOIN office_shifts os ON e.office_shift_id = os.id
       WHERE e.is_active = 1`
    );

    if (employees.length === 0) {
      console.log("No active employees found.");
      return;
    }

    const isDateHoliday = await isHoliday(dateToProcess);
    
    if (isDateHoliday) {
      console.log(`📅 ${dateToProcess} is a holiday. Skipping missing attendance check.`);
      return;
    }

    let insertedCount = 0;
    let weekoffCount = 0;
    let alreadyExistsCount = 0;

    for (const emp of employees) {
      const existing = await executeQuery(
        `SELECT id FROM attendances 
         WHERE employee_id = ? AND DATE(attendance_date) = ?`,
        [emp.id, dateToProcess]
      );

      if (existing.length > 0) {
        alreadyExistsCount++;
        continue;
      }

      if (isWeekOff(emp, dateToProcess)) {
        weekoffCount++;
        continue;
      }

      await executeQuery(
        `INSERT INTO attendances 
         (employee_id, attendance_date, attendance_status, total_work, total_rest, time_late, early_leaving, overtime)
         VALUES (?, ?, 'absent', '00:00', '00:00', '00:00', '00:00', '00:00')`,
        [emp.id, dateToProcess]
      );
      insertedCount++;
    }

    console.log(
      `✅ Missing attendance check complete: 
       - Marked as ABSENT: ${insertedCount} employees
       - Week-offs skipped: ${weekoffCount}
       - Already had records: ${alreadyExistsCount}`
    );
    
    return { insertedCount, weekoffCount, alreadyExistsCount };
  } catch (err) {
    console.error("❌ markMissingAttendanceAsAbsent error:", err);
    throw err;
  }
};

export const startMissingAttendanceCron = () => {
  cron.schedule("0 1 * * *", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    console.log(`⏰ Missing Attendance CRON triggered at 1:00 AM for ${yesterdayStr}`);
    await markMissingAttendanceAsAbsent(yesterdayStr);
  });
  
  console.log("🟢 Missing Attendance CRON initialized (runs daily at 1:00 AM)");
};