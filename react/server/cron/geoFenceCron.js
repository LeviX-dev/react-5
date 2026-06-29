import db from "../config/db.js";

// ======================== SHARED DB HELPER ========================
const executeQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) { console.error("DB ERROR:", err); reject(err); }
      else resolve(results);
    });
  });

// ======================== AUTO CHECKOUT HELPER ========================
const triggerAutoCheckout = async (logId, attendanceDate, clockOutTime, reason = "Outside geo-fence") => {
  // Update the log with checkout time
  await executeQuery(
    `UPDATE attendance_logs SET clock_out = ? WHERE id = ?`,
    [clockOutTime, logId]
  );

  // Get all logs for the day to recalculate totals
  const allLogs = await executeQuery(
    `SELECT clock_in, clock_out FROM attendance_logs
     WHERE employee_id = (SELECT employee_id FROM attendance_logs WHERE id = ?)
       AND attendance_date = ?
     ORDER BY clock_in ASC`,
    [logId, attendanceDate]
  );

  // Calculate total work minutes
  let totalMinutes = 0;
  for (const log of allLogs) {
    if (log.clock_in && log.clock_out) {
      const diff = (new Date(log.clock_out) - new Date(log.clock_in)) / 60000;
      if (diff > 0) totalMinutes += diff;
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  const totalWork = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

  // Get first clock in and last clock out
  const [timeData] = await executeQuery(
    `SELECT MIN(clock_in) as first_in, MAX(clock_out) as last_out
     FROM attendance_logs
     WHERE employee_id = (SELECT employee_id FROM attendance_logs WHERE id = ?)
       AND attendance_date = ?`,
    [logId, attendanceDate]
  );

  // Update attendances table
  await executeQuery(
    `INSERT INTO attendances (employee_id, attendance_date, clock_in, clock_out, total_work, attendance_status)
     SELECT employee_id, attendance_date, ?, ?, ?, 'present'
     FROM attendance_logs WHERE id = ?
     ON DUPLICATE KEY UPDATE
       clock_out = VALUES(clock_out),
       total_work = VALUES(total_work),
       attendance_status = 'present'`,
    [timeData?.first_in || null, clockOutTime, totalWork, logId]
  );

  // Log the auto-checkout event
  const now = new Date();
  await executeQuery(
    `INSERT INTO geo_fence_events
       (employee_id, attendance_log_id, event_type, latitude, longitude, distance_metres, first_violation_at)
     SELECT employee_id, ?, 'auto_checkout', NULL, NULL, NULL, ?
     FROM attendance_logs WHERE id = ?`,
    [logId, clockOutTime, logId]
  );

  // Create notification for all admins
  const [empData] = await executeQuery(
    `SELECT CONCAT(first_name, ' ', last_name) as full_name 
     FROM employees 
     WHERE id = (SELECT employee_id FROM attendance_logs WHERE id = ?)`,
    [logId]
  );

  const notifMessage = `${empData?.full_name || 'Employee'} was auto-checked out at ${clockOutTime.split(' ')[1]} — Reason: ${reason}`;
  
  await executeQuery(
    `INSERT INTO geo_fence_notifications
       (employee_id, attendance_log_id, event_type, message, is_read)
     VALUES ((SELECT employee_id FROM attendance_logs WHERE id = ?), ?, 'auto_checkout', ?, 0)`,
    [logId, logId, notifMessage]
  );

  console.log(`[GeoFence Cron] Auto-checkout: ${empData?.full_name} - ${reason}`);
};

// ======================== CHECK MISSING HEARTBEATS ========================
// Runs every minute - checks for employees who haven't sent heartbeat in 2+ minutes (dev)
export const checkMissingHeartbeats = async () => {
  try {
    const now = new Date();
    const timeoutMinutes = 100; // 2 minutes for dev (change to 10 for production)
    const timeoutAgo = new Date(now.getTime() - timeoutMinutes * 60 * 1000);
    const timeoutAgoStr = timeoutAgo.toISOString().slice(0, 19).replace("T", " ");

    // Find all employees who are checked in (no clock_out) and have geo-fence
    // AND haven't sent a heartbeat in the last 2 minutes (dev mode)
    const missingHeartbeats = await executeQuery(
      `SELECT 
        al.id as log_id,
        al.employee_id,
        al.attendance_date,
        al.clock_in,
        e.location_id,
        MAX(gfe.created_at) as last_heartbeat_at
       FROM attendance_logs al
       JOIN employees e ON al.employee_id = e.id
       LEFT JOIN geo_fence_events gfe 
         ON gfe.attendance_log_id = al.id 
         AND gfe.event_type = 'heartbeat_ok'
       WHERE al.clock_out IS NULL
         AND e.attendance_method = 'geofence'
         AND e.location_id IS NOT NULL
       GROUP BY al.id, al.employee_id, al.attendance_date, al.clock_in, e.location_id
       HAVING (last_heartbeat_at IS NULL OR last_heartbeat_at < ?)
          AND NOT EXISTS (
            SELECT 1 FROM geo_fence_events gfe2
            WHERE gfe2.attendance_log_id = al.id
              AND gfe2.event_type = 'auto_checkout'
          )`,
      [timeoutAgoStr]
    );

    for (const record of missingHeartbeats) {
      const nowTime = now.toISOString().slice(0, 19).replace("T", " ");
      await triggerAutoCheckout(
        record.log_id, 
        record.attendance_date.toISOString().split("T")[0], 
        nowTime,
        `No heartbeat for ${timeoutMinutes}+ minutes (phone off or left zone)`
      );
    }

    if (missingHeartbeats.length > 0) {
      console.log(`[GeoFence Cron] Processed ${missingHeartbeats.length} missing heartbeats`);
    }
  } catch (err) {
    console.error("[GeoFence Cron] Error checking missing heartbeats:", err);
  }
};

// ======================== CHECK OUTSIDE ZONE IMMEDIATE ========================
// For immediate auto-checkout when heartbeat shows outside zone (no warning)
export const processOutsideZoneImmediate = async () => {
  // This is now handled directly in the geoHeartbeat API (silent auto-checkout)
  // But we can add any background processing here if needed
};

// ======================== START CRON ========================
export const startGeoFenceCron = () => {
  // Run every minute
  setInterval(checkMissingHeartbeats, 60 * 1000);
  
  console.log("[GeoFence Cron] Started - checking missing heartbeats every minute (10-min timeout)");
  
  // Run immediately on start
  checkMissingHeartbeats();
};

export default startGeoFenceCron;
