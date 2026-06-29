import db from "../config/db.js";

// ======================== CONFIGURATION FLAGS ========================
// Set to false to disable heartbeat checking entirely
const ENABLE_HEARTBEAT_CHECK = true;

// ======================== SHARED DB HELPER ========================
const executeQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) { console.error("DB ERROR:", err); reject(err); }
      else resolve(results);
    });
  });

// ======================== HAVERSINE ========================
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ======================== INTERNAL: trigger checkout ========================
const triggerAutoCheckout = async (logId, attendanceDate, clockOutTime) => {
  await executeQuery(
    `UPDATE attendance_logs SET clock_out = ? WHERE id = ?`,
    [clockOutTime, logId]
  );

  const allLogs = await executeQuery(
    `SELECT clock_in, clock_out FROM attendance_logs
     WHERE employee_id = (SELECT employee_id FROM attendance_logs WHERE id = ?)
       AND attendance_date = ?
     ORDER BY clock_in ASC`,
    [logId, attendanceDate]
  );

  const [firstLog] = await executeQuery(
    `SELECT MIN(clock_in) as first_in, MAX(clock_out) as last_out
     FROM attendance_logs
     WHERE id = ? OR (employee_id = (SELECT employee_id FROM attendance_logs WHERE id = ?)
       AND attendance_date = ?)`,
    [logId, logId, attendanceDate]
  );

  let totalMinutes = 0;
  for (const log of allLogs) {
    if (log.clock_in && log.clock_out) {
      const diff = (new Date(log.clock_out) - new Date(log.clock_in)) / 60000;
      if (diff > 0) totalMinutes += diff;
    }
  }

  await executeQuery(
    `INSERT INTO attendances (employee_id, attendance_date, clock_in, clock_out, total_hours, attendance_status)
     SELECT employee_id, attendance_date, ?, ?, ?, 'present'
     FROM attendance_logs WHERE id = ?
     ON DUPLICATE KEY UPDATE
       clock_out = VALUES(clock_out),
       total_hours = VALUES(total_hours),
       attendance_status = 'present'`,
    [firstLog?.first_in || null, clockOutTime, totalMinutes, logId]
  );
};

// ======================== POST /api/attendance/geo-heartbeat ========================
export const geoHeartbeat = async (req, res) => {
  try {
    // Skip heartbeat checking if disabled globally
    if (!ENABLE_HEARTBEAT_CHECK) {
      return res.json({ status: "ok", reason: "heartbeat_check_disabled" });
    }

    const { employee_id, latitude, longitude, attendance_log_id } = req.body;

    // ── Step 1: Guard — validate required fields ──────────────────────────────
    if (!employee_id || !attendance_log_id) {
      return res.status(400).json({ error: "employee_id and attendance_log_id are required" });
    }

    const [empData] = await executeQuery(
      `SELECT e.attendance_method, e.location_id, e.company_id,
              CONCAT(e.first_name, ' ', e.last_name) AS full_name
       FROM employees e WHERE e.id = ?`,
      [employee_id]
    );

    if (!empData) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Not a geo-fence employee — no monitoring needed
    if (empData.attendance_method !== "geofence") {
      return res.json({ status: "ok", reason: "not_geofence" });
    }

    // Confirm the log is still open (clocked in, no checkout yet)
    const [openLog] = await executeQuery(
      `SELECT id, attendance_date FROM attendance_logs
       WHERE id = ? AND employee_id = ? AND clock_out IS NULL`,
      [attendance_log_id, employee_id]
    );

    if (!openLog) {
      return res.json({ status: "ok", reason: "not_clocked_in" });
    }

    const attendanceDate = openLog.attendance_date instanceof Date
      ? openLog.attendance_date.toISOString().split("T")[0]
      : String(openLog.attendance_date).split("T")[0];

    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace("T", " ");

    // ── GPS unavailable: log heartbeat_ok with null distance, never punish ────
    if (latitude == null || longitude == null) {
      await executeQuery(
        `INSERT INTO geo_fence_events
           (employee_id, attendance_log_id, event_type, latitude, longitude, distance_metres, first_violation_at)
         VALUES (?, ?, 'heartbeat_ok', NULL, NULL, NULL, NULL)`,
        [employee_id, attendance_log_id]
      );
      return res.json({ status: "ok", reason: "gps_unavailable" });
    }

    // ── Fetch the employee's assigned geo-location ────────────────────────────
    const [geoLocation] = await executeQuery(
      `SELECT latitude, longitude, radius FROM geo_locations WHERE id = ?`,
      [empData.location_id]
    );

    if (!geoLocation) {
      return res.json({ status: "ok", reason: "no_geo_location_assigned" });
    }

    const clientLat  = parseFloat(latitude);
    const clientLon  = parseFloat(longitude);
    const officeLat  = parseFloat(geoLocation.latitude);
    const officeLon  = parseFloat(geoLocation.longitude);
    const allowedRadius = geoLocation.radius || 100;

    if (isNaN(clientLat) || isNaN(clientLon) || isNaN(officeLat) || isNaN(officeLon)) {
      return res.json({ status: "ok", reason: "invalid_coordinates" });
    }

    const distanceMetres = calculateHaversineDistance(clientLat, clientLon, officeLat, officeLon);
    const isInsideZone   = distanceMetres <= allowedRadius;

    // ── Step 2: Inside zone ───────────────────────────────────────────────────
    if (isInsideZone) {
      // Log heartbeat as OK
      await executeQuery(
        `INSERT INTO geo_fence_events
           (employee_id, attendance_log_id, event_type, latitude, longitude, distance_metres, first_violation_at)
         VALUES (?, ?, 'heartbeat_ok', ?, ?, ?, NULL)`,
        [employee_id, attendance_log_id, clientLat, clientLon, distanceMetres.toFixed(2)]
      );

      return res.json({ status: "ok", inside_zone: true });
    }

    // ── Outside zone — SILENT AUTO CHECKOUT (no warning) ─────────────────────
    // Employee left the zone → auto checkout immediately
    const clockOutFull = `${attendanceDate} ${now.toTimeString().slice(0, 8)}`;
    await triggerAutoCheckout(attendance_log_id, attendanceDate, clockOutFull);

    // Log the outside zone event
    await executeQuery(
      `INSERT INTO geo_fence_events
         (employee_id, attendance_log_id, event_type, latitude, longitude, distance_metres, first_violation_at)
       VALUES (?, ?, 'auto_checkout', ?, ?, ?, ?)`,
      [employee_id, attendance_log_id, clientLat, clientLon, distanceMetres.toFixed(2), nowStr]
    );

    // Notify admins
    const notifMessage = `${empData.full_name} was auto-checked out at ${now.toLocaleTimeString()} — Outside geo-fence: ${Math.round(distanceMetres)}m from office (max: ${allowedRadius}m)`;
    await executeQuery(
      `INSERT INTO geo_fence_notifications
         (employee_id, attendance_log_id, event_type, message, is_read)
       VALUES (?, ?, 'auto_checkout', ?, 0)`,
      [employee_id, attendance_log_id, notifMessage]
    );

    // Silent to employee - they just get auto-checked out
    return res.json({
      status: "auto_checkout",
      message: "Checked out",
    });

  } catch (err) {
    console.error("geoHeartbeat error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================== GET /api/geo-fence/notifications ========================
export const getGeoFenceNotifications = async (req, res) => {
  try {
    const notifications = await executeQuery(
      `SELECT n.id, n.employee_id, n.attendance_log_id, n.event_type, n.message,
              n.is_read, n.created_at,
              CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
              gfe.distance_metres
       FROM geo_fence_notifications n
       JOIN employees e ON e.id = n.employee_id
       LEFT JOIN geo_fence_events gfe
         ON gfe.attendance_log_id = n.attendance_log_id
        AND gfe.event_type = 'auto_checkout'
       ORDER BY n.created_at DESC
       LIMIT 100`
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("getGeoFenceNotifications error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================== PUT /api/geo-fence/notifications/:id/read ========================
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery(
      `UPDATE geo_fence_notifications SET is_read = 1 WHERE id = ?`,
      [id]
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("markNotificationRead error:", err);
    res.status(500).json({ error: err.message });
  }
};
