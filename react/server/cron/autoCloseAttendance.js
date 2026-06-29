import db from "../config/db.js";
import { aggregateRouteSummary } from "../controllers/liveTrackingController.js";

const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const formatTime = (minutes) => {
  if (!minutes || isNaN(minutes)) return "00:00";
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(Math.floor(minutes % 60)).padStart(2, "0");
  return `${h}:${m}`;
};

const formatDate = (d) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const autoCloseOpenCheckouts = async () => {
  const today = formatDate(new Date());
  console.log(`🕡 Auto‑close running for ${today}`);

  // Find ALL open logs (clock_out IS NULL) - including past dates
  const openLogs = await executeQuery(
    `SELECT id, employee_id, attendance_date, clock_in FROM attendance_logs 
     WHERE clock_out IS NULL ORDER BY attendance_date ASC`
  );

  if (openLogs.length === 0) {
    console.log("✅ No open check‑ins found.");
    return;
  }

  console.log(`🔓 Found ${openLogs.length} open logs. Closing...`);

  for (const log of openLogs) {
    const logDate = formatDate(new Date(log.attendance_date));
    const isToday = logDate === today;
    
    // For today: close at 18:30, for past: close at 18:00
    const closeTime = isToday ? "18:30:00" : "18:00:00";
    const clockOutDateTime = `${logDate} ${closeTime}`;
    
    console.log(`  └─ Closing log #${log.id} (emp: ${log.employee_id}, date: ${logDate}) at ${closeTime}`);
    
    await executeQuery(
      `UPDATE attendance_logs SET clock_out = ? WHERE id = ?`,
      [clockOutDateTime, log.id]
    );

    // Aggregate live tracking route summary for the shift
    await aggregateRouteSummary(log.employee_id, log.id, logDate);
  }

  // Get unique (employee_id, date) pairs for recalculation
  const affectedPairs = [...new Map(
    openLogs.map(l => [
      `${l.employee_id}_${formatDate(new Date(l.attendance_date))}`,
      { employee_id: l.employee_id, date: formatDate(new Date(l.attendance_date)) }
    ])
  ).values()];

  console.log(`📊 Recalculating totals for ${affectedPairs.length} employee-date combinations...`);

  for (const pair of affectedPairs) {
    const { employee_id: empId, date: attendanceDate } = pair;
    const allLogs = await executeQuery(
      `SELECT clock_in, clock_out FROM attendance_logs WHERE employee_id = ? AND DATE(attendance_date) = ? ORDER BY clock_in ASC`,
      [empId, attendanceDate]
    );
    let totalMinutes = 0, restMinutes = 0;
    for (let i = 0; i < allLogs.length; i++) {
      const log = allLogs[i];
      if (log.clock_in && log.clock_out) {
        const diff = (new Date(log.clock_out) - new Date(log.clock_in)) / (1000 * 60);
        if (diff > 0) totalMinutes += diff;
      }
      if (i > 0 && allLogs[i-1].clock_out && log.clock_in) {
        const gap = (new Date(log.clock_in) - new Date(allLogs[i-1].clock_out)) / (1000 * 60);
        if (gap > 0) restMinutes += gap;
      }
    }
    const firstIn = allLogs[0]?.clock_in || null;
    const lastOut = allLogs[allLogs.length-1]?.clock_out || null;
    const total_work = formatTime(totalMinutes);
    const total_rest = formatTime(restMinutes);

    // Fetch employee shift to compute late, early, overtime
    const empShift = await executeQuery(
      `SELECT os.* FROM employees e LEFT JOIN office_shifts os ON e.office_shift_id = os.id WHERE e.id = ?`,
      [empId]
    );
    let shift_start = "09:00", shift_end = "18:00";
    if (empShift.length && empShift[0]) {
      const day = new Date(attendanceDate).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const shiftRow = empShift[0];
      if (shiftRow?.[`${day}_in`] && shiftRow[`${day}_in`].includes(":")) shift_start = shiftRow[`${day}_in`];
      if (shiftRow?.[`${day}_out`] && shiftRow[`${day}_out`].includes(":")) shift_end = shiftRow[`${day}_out`];
    }
    const isNextDayShift = shift_end < shift_start;
    let shiftStart = new Date(`${attendanceDate} ${shift_start}:00`);
    let shiftEnd = new Date(`${attendanceDate} ${shift_end}:00`);
    if (isNextDayShift) shiftEnd.setDate(shiftEnd.getDate() + 1);
    let late = "00:00", early_leaving = "00:00", overtime = "00:00";
    if (firstIn) {
      let diff = (new Date(firstIn) - shiftStart) / (1000 * 60);
      if (diff < 0) diff = 0;
      late = formatTime(diff);
    }
    if (lastOut) {
      let diffEarly = (shiftEnd - new Date(lastOut)) / (1000 * 60);
      if (diffEarly < 0) diffEarly = 0;
      early_leaving = formatTime(diffEarly);
      let diffOT = (new Date(lastOut) - shiftEnd) / (1000 * 60);
      if (diffOT < 0) diffOT = 0;
      overtime = formatTime(diffOT);
    }

    // Update attendances table
    await executeQuery(
      `UPDATE attendances SET
        clock_in = ?, clock_out = ?,
        total_work = ?, total_rest = ?,
        attendance_status = 'present',
        time_late = ?, early_leaving = ?, overtime = ?
       WHERE employee_id = ? AND DATE(attendance_date) = ?`,
      [firstIn, lastOut, total_work, total_rest, late, early_leaving, overtime, empId, attendanceDate]
    );
  }

  console.log("✅ Auto‑close completed.");
};