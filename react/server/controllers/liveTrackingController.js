import db from "../config/db.js";

// ======================== CONFIGURATION ========================
const ENABLE_LIVE_TRACKING = true;

// Interval in seconds — minimum time between accepted pings (throttle)
const MIN_UPDATE_INTERVAL_SECONDS = 30;

// Minimum movement in metres that bypasses the throttle window
// (significant movement is always recorded regardless of time)
const SIGNIFICANT_MOVEMENT_METRES = 50;

// Radius in metres within which consecutive points count as "stopped"
const STOP_RADIUS_METRES = 20;

// Minimum stationary duration (seconds) before a stop event is created
const STOP_MIN_DURATION_SECONDS = 120;

// Shift grace window in minutes — pings within this margin of shift start/end are accepted
const SHIFT_GRACE_MINUTES = 15;

// ======================== SHARED DB HELPER ========================
const executeQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) { console.error("DB ERROR:", err); reject(err); }
      else resolve(results);
    });
  });

// ======================== HAVERSINE DISTANCE ========================
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in metres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ======================== CENTROID HELPER ========================
/**
 * Returns the geographic centroid of an array of {latitude, longitude} points.
 * Used to anchor a stop zone to the average position rather than the first point,
 * which reduces phantom stop drift caused by GPS jitter.
 */
const computeCentroid = (points) => {
  const n = points.length;
  if (n === 0) return null;
  const lat = points.reduce((s, p) => s + parseFloat(p.latitude), 0) / n;
  const lon = points.reduce((s, p) => s + parseFloat(p.longitude), 0) / n;
  return { latitude: lat, longitude: lon };
};

// ======================== SHIFT GATE HELPERS ========================
const getShiftWindowForDate = (row, dateStr) => {
  if (!row) {
    const start = new Date(`${dateStr}T09:30:00`);
    const end = new Date(`${dateStr}T18:30:00`);
    return { start, end };
  }

  const dayName = new Date(`${dateStr}T00:00:00`)
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();

  const inVal = row[`${dayName}_in`];
  const outVal = row[`${dayName}_out`];
  const isWeekoff =
    (inVal === null || inVal === undefined || inVal === "") &&
    (outVal === null || outVal === undefined || outVal === "");
  if (isWeekoff) return null;

  const shift_start = inVal && inVal.includes(":") ? inVal.substring(0, 5) : "09:30";
  const shift_end = outVal && outVal.includes(":") ? outVal.substring(0, 5) : "18:30";

  const start = new Date(`${dateStr}T${shift_start}:00`);
  let end;
  if (shift_end < shift_start) {
    // Crosses midnight
    const nextDay = new Date(
      new Date(`${dateStr}T00:00:00`).getTime() + 24 * 60 * 60 * 1000
    );
    const nextDayStr = [
      nextDay.getFullYear(),
      String(nextDay.getMonth() + 1).padStart(2, "0"),
      String(nextDay.getDate()).padStart(2, "0"),
    ].join("-");
    end = new Date(`${nextDayStr}T${shift_end}:00`);
  } else {
    end = new Date(`${dateStr}T${shift_end}:00`);
  }

  return { start, end };
};

/**
 * Returns { inShift: bool, window: {start, end} | undefined }
 *
 * Enhancement: A grace buffer of SHIFT_GRACE_MINUTES is applied on both edges
 * so pings arriving slightly before shift start or shortly after shift end
 * are still accepted. This prevents legitimate location updates being silently
 * dropped at boundary conditions.
 */
export const isCurrentlyInShift = async (employee_id) => {
  const empShift = await executeQuery(
    `SELECT os.* FROM employees e
     LEFT JOIN office_shifts os ON e.office_shift_id = os.id
     WHERE e.id = ?`,
    [employee_id]
  );

  const now = new Date();
  const graceMs = SHIFT_GRACE_MINUTES * 60 * 1000;

  const formatLocal = (d) =>
    [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");

  const todayStr = formatLocal(now);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = formatLocal(yesterday);

  const shiftRow = empShift[0] || null;

  // Check today's window (with grace)
  const todayWindow = getShiftWindowForDate(shiftRow, todayStr);
  if (
    todayWindow &&
    now >= new Date(todayWindow.start.getTime() - graceMs) &&
    now <= new Date(todayWindow.end.getTime() + graceMs)
  ) {
    return { inShift: true, window: todayWindow };
  }

  // Check yesterday's window — covers overnight / night-shift scenarios
  const yesterdayWindow = getShiftWindowForDate(shiftRow, yesterdayStr);
  if (
    yesterdayWindow &&
    now >= new Date(yesterdayWindow.start.getTime() - graceMs) &&
    now <= new Date(yesterdayWindow.end.getTime() + graceMs)
  ) {
    return { inShift: true, window: yesterdayWindow };
  }

  return { inShift: false };
};

// ======================== END-OF-SHIFT AGGREGATION HELPER ========================
export const aggregateRouteSummary = async (employee_id, attendance_log_id, dateStr) => {
  try {
    const [empData] = await executeQuery(
      `SELECT attendance_method FROM employees WHERE id = ?`,
      [employee_id]
    );
    if (!empData || empData.attendance_method !== "location_tracking") return;

    // 1. Total distance travelled
    let totalDistanceM = 0;
    if (attendance_log_id) {
      const [distanceRow] = await executeQuery(
        `SELECT SUM(distance_from_last) AS total_distance_m
         FROM employee_live_tracking
         WHERE employee_id = ? AND attendance_log_id = ?`,
        [employee_id, attendance_log_id]
      );
      totalDistanceM = distanceRow?.total_distance_m || 0;
    } else {
      const [distanceRow] = await executeQuery(
        `SELECT SUM(distance_from_last) AS total_distance_m
         FROM employee_live_tracking
         WHERE employee_id = ? AND attendance_log_id IS NULL AND DATE(created_at) = ?`,
        [employee_id, dateStr]
      );
      totalDistanceM = distanceRow?.total_distance_m || 0;
    }
    const totalDistanceKm = Math.round((totalDistanceM / 1000) * 100) / 100;

    // 2. Stop aggregates
    let stops = [];
    if (attendance_log_id) {
      stops = await executeQuery(
        `SELECT id, duration_seconds FROM employee_tracking_stops
         WHERE employee_id = ? AND attendance_log_id = ?`,
        [employee_id, attendance_log_id]
      );
    } else {
      stops = await executeQuery(
        `SELECT id, duration_seconds FROM employee_tracking_stops
         WHERE employee_id = ? AND attendance_log_id IS NULL AND DATE(start_time) = ?`,
        [employee_id, dateStr]
      );
    }
    const totalStops = stops.length;
    const stoppedSeconds = stops.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    // 3. Total session duration → derive moving time
    let movingSeconds = 0;
    if (attendance_log_id) {
      const [logRow] = await executeQuery(
        `SELECT clock_in, clock_out FROM attendance_logs WHERE id = ?`,
        [attendance_log_id]
      );
      if (logRow && logRow.clock_in && logRow.clock_out) {
        const durationMs = new Date(logRow.clock_out) - new Date(logRow.clock_in);
        const durationSeconds = Math.max(0, Math.floor(durationMs / 1000));
        // Clamp: stopped time cannot exceed total session duration
        movingSeconds = Math.max(0, durationSeconds - Math.min(stoppedSeconds, durationSeconds));
      }
    } else {
      const [spanRow] = await executeQuery(
        `SELECT MIN(created_at) AS first_ping, MAX(created_at) AS last_ping
         FROM employee_live_tracking
         WHERE employee_id = ? AND attendance_log_id IS NULL AND DATE(created_at) = ?`,
        [employee_id, dateStr]
      );
      if (spanRow && spanRow.first_ping && spanRow.last_ping) {
        const spanMs = new Date(spanRow.last_ping) - new Date(spanRow.first_ping);
        const spanSeconds = Math.max(0, Math.floor(spanMs / 1000));
        movingSeconds = Math.max(0, spanSeconds - Math.min(stoppedSeconds, spanSeconds));
      }
    }

    // 4. Upsert summary
    await executeQuery(
      `INSERT INTO employee_route_summaries
        (employee_id, attendance_log_id, attendance_date, total_distance_km, total_stops, moving_seconds, stopped_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        attendance_log_id = COALESCE(attendance_log_id, VALUES(attendance_log_id)),
        total_distance_km = VALUES(total_distance_km),
        total_stops       = VALUES(total_stops),
        moving_seconds    = VALUES(moving_seconds),
        stopped_seconds   = VALUES(stopped_seconds)`,
      [employee_id, attendance_log_id || null, dateStr, totalDistanceKm, totalStops, movingSeconds, stoppedSeconds]
    );

    console.log(
      `Route summary aggregated for employee ${employee_id}, log ${attendance_log_id || "NONE"}: ` +
      `${totalDistanceKm}km, ${totalStops} stops`
    );
  } catch (error) {
    console.error("Error in aggregateRouteSummary:", error);
  }
};

export const aggregateAllLiveTrackingSummaries = async (dateStr) => {
  try {
    console.log(`Running daily route summary aggregation for date: ${dateStr}`);
    const rows = await executeQuery(
      `SELECT DISTINCT employee_id, attendance_log_id
       FROM employee_live_tracking
       WHERE DATE(created_at) = ?`,
      [dateStr]
    );
    for (const r of rows) {
      await aggregateRouteSummary(r.employee_id, r.attendance_log_id, dateStr);
    }
    console.log(
      `Finished daily route summary aggregation for date: ${dateStr}. Aggregated ${rows.length} routes.`
    );
  } catch (error) {
    console.error("Error in aggregateAllLiveTrackingSummaries:", error);
  }
};

// ======================== POST /api/attendance/live-tracking/heartbeat ========================
export const liveTrackingHeartbeat = async (req, res) => {
  try {
    if (!ENABLE_LIVE_TRACKING) {
      return res.json({ status: "ok", reason: "live_tracking_disabled" });
    }

    const {
      employee_id,
      latitude,
      longitude,
      attendance_log_id,
      accuracy,
      speed,
      heading,
      altitude,
      battery_level,
      device_info,
    } = req.body;

    const ip_address =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      null;

    if (!employee_id || latitude == null || longitude == null) {
      return res.status(400).json({
        error: "employee_id, latitude, and longitude are required",
      });
    }

    // ── Employee fetch ──────────────────────────────────────────────────────────
    const [empData] = await executeQuery(
      `SELECT e.id, e.attendance_method, e.location_id, e.company_id,
              CONCAT(e.first_name, ' ', e.last_name) AS full_name,
              g.latitude AS office_lat, g.longitude AS office_lon, g.radius AS office_radius
       FROM employees e
       LEFT JOIN geo_locations g ON e.location_id = g.id
       WHERE e.id = ?`,
      [employee_id]
    );

    if (!empData) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (empData.attendance_method !== "location_tracking") {
      return res.status(403).json({
        error: "Live tracking not enabled for this employee",
        attendance_method: empData.attendance_method,
      });
    }

    // ── Shift gate ──────────────────────────────────────────────────────────────
    const shiftGate = await isCurrentlyInShift(employee_id);
    if (!shiftGate.inShift) {
      return res.json({ status: "ok", reason: "outside_shift" });
    }

    // ── Resolve attendance log ──────────────────────────────────────────────────
    let currentLogId = attendance_log_id;
    if (!currentLogId) {
      const [openLog] = await executeQuery(
        `SELECT id FROM attendance_logs
         WHERE employee_id = ? AND clock_out IS NULL
         ORDER BY clock_in DESC LIMIT 1`,
        [employee_id]
      );
      if (openLog) currentLogId = openLog.id;
    }

    // ── Geofence distance ───────────────────────────────────────────────────────
    let isInsideGeofence = null;
    let distanceFromOffice = null;

    if (empData.office_lat && empData.office_lon) {
      distanceFromOffice = calculateHaversineDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(empData.office_lat),
        parseFloat(empData.office_lon)
      );
      const allowedRadius = empData.office_radius || 100;
      isInsideGeofence = distanceFromOffice <= allowedRadius;
    }

    // ── Throttle check ──────────────────────────────────────────────────────────
    // Fetch the last point scoped to this employee's current log (or today if no log).
    // This avoids a global last-point lookup that would incorrectly throttle an
    // employee who clocked in under a new log shortly after clocking out.
    let lastPoint = null;
    if (currentLogId) {
      [lastPoint] = await executeQuery(
        `SELECT id, latitude, longitude, created_at, stop_id
         FROM employee_live_tracking
         WHERE employee_id = ? AND attendance_log_id = ?
         ORDER BY created_at DESC LIMIT 1`,
        [employee_id, currentLogId]
      );
    } else {
      [lastPoint] = await executeQuery(
        `SELECT id, latitude, longitude, created_at, stop_id
         FROM employee_live_tracking
         WHERE employee_id = ? AND attendance_log_id IS NULL AND DATE(created_at) = CURDATE()
         ORDER BY created_at DESC LIMIT 1`,
        [employee_id]
      );
    }

    // Calculate movement from last known point before deciding to throttle
    let distanceFromLast = 0.0;
    if (lastPoint) {
      distanceFromLast = calculateHaversineDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(lastPoint.latitude),
        parseFloat(lastPoint.longitude)
      );

      const secondsSinceLastUpdate =
        (new Date() - new Date(lastPoint.created_at)) / 1000;

      const significantMovement = distanceFromLast >= SIGNIFICANT_MOVEMENT_METRES;

      if (
        secondsSinceLastUpdate < MIN_UPDATE_INTERVAL_SECONDS &&
        !significantMovement
      ) {
        // Throttled — not enough time has passed AND no meaningful movement
        return res.json({
          status: "throttled",
          seconds_until_next_update: Math.ceil(
            MIN_UPDATE_INTERVAL_SECONDS - secondsSinceLastUpdate
          ),
          employee_id,
          location: { latitude, longitude },
          is_inside_geofence: isInsideGeofence,
          distance_from_office: distanceFromOffice
            ? Math.round(distanceFromOffice)
            : null,
        });
      }
    }

    // ── Insert tracking record ──────────────────────────────────────────────────
    const insertResult = await executeQuery(
      `INSERT INTO employee_live_tracking (
        employee_id, attendance_log_id, latitude, longitude, ip_address,
        accuracy, speed, heading, altitude, is_inside_geofence,
        distance_from_office, distance_from_last, battery_level, device_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        currentLogId || null,
        latitude,
        longitude,
        ip_address,
        accuracy || null,
        speed || null,
        heading || null,
        altitude || null,
        isInsideGeofence,
        distanceFromOffice
          ? Math.round(distanceFromOffice * 100) / 100
          : null,
        Math.round(distanceFromLast * 100) / 100,
        battery_level || null,
        device_info || null,
      ]
    );

    const currentInsertId = insertResult.insertId;

    // ── Stop detection ──────────────────────────────────────────────────────────
    // Fetch the PREVIOUS points only (excluding the one we just inserted) so
    // index arithmetic is predictable and never off-by-one.
    const recentPrevPoints = await executeQuery(
      `SELECT id, latitude, longitude, created_at, stop_id
       FROM employee_live_tracking
       WHERE employee_id = ?
         AND id != ?
         AND (attendance_log_id = ? OR (attendance_log_id IS NULL AND DATE(created_at) = CURDATE()))
       ORDER BY created_at DESC LIMIT 29`,
      [employee_id, currentInsertId, currentLogId || null]
    );

    const previousPoint = recentPrevPoints[0]; // Most recent point before current insert

    if (previousPoint && previousPoint.stop_id !== null) {
      // ── Branch A: a stop is already active ─────────────────────────────────
      const [stopEvent] = await executeQuery(
        `SELECT id, latitude, longitude, start_time
         FROM employee_tracking_stops WHERE id = ?`,
        [previousPoint.stop_id]
      );

      if (stopEvent) {
        const distFromStopCenter = calculateHaversineDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(stopEvent.latitude),
          parseFloat(stopEvent.longitude)
        );

        if (distFromStopCenter < STOP_RADIUS_METRES) {
          // Still within the stop zone — extend stop duration and tag current point
          const now = new Date();
          const durationSec = Math.max(
            0,
            Math.floor((now - new Date(stopEvent.start_time)) / 1000)
          );
          await executeQuery(
            `UPDATE employee_tracking_stops
             SET end_time = ?, duration_seconds = ?
             WHERE id = ?`,
            [now, durationSec, stopEvent.id]
          );
          await executeQuery(
            `UPDATE employee_live_tracking SET stop_id = ? WHERE id = ?`,
            [stopEvent.id, currentInsertId]
          );
        }
        // else: employee left the stop zone — stop event stays closed, nothing more to do
      }
    } else {
      // ── Branch B: no stop currently active ─────────────────────────────────
      // Collect the contiguous run of previous points that are within
      // STOP_RADIUS_METRES of the *centroid* of the cluster (not just the
      // current point). Recompute centroid as we grow the cluster.
      // This eliminates phantom stops caused by GPS drift around a real position.

      const candidatePoints = []; // Points in the potential stationary cluster
      let clusterCentroid = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };

      for (const p of recentPrevPoints) {
        if (p.stop_id !== null) break; // Hit an already-classified stop; stop looking back

        // Recompute centroid including this candidate
        const testPoints = [
          ...candidatePoints,
          p,
          { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        ];
        const testCentroid = computeCentroid(testPoints);

        // Check distance of this point from the candidate centroid
        const distFromCentroid = calculateHaversineDistance(
          parseFloat(p.latitude),
          parseFloat(p.longitude),
          testCentroid.latitude,
          testCentroid.longitude
        );

        if (distFromCentroid < STOP_RADIUS_METRES) {
          candidatePoints.push(p);
          clusterCentroid = testCentroid;
        } else {
          break; // Sequence broken — point is too far from centroid
        }
      }

      if (candidatePoints.length > 0) {
        // Earliest point in the stationary cluster
        const earliestPoint = candidatePoints[candidatePoints.length - 1];
        const now = new Date();
        const earliestTime = new Date(earliestPoint.created_at);
        const durationSec = Math.floor((now - earliestTime) / 1000);

        if (durationSec >= STOP_MIN_DURATION_SECONDS) {
          // Enough time has elapsed — create a new stop anchored at the centroid
          const stopInsert = await executeQuery(
            `INSERT INTO employee_tracking_stops
              (employee_id, attendance_log_id, latitude, longitude, start_time, end_time, duration_seconds)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              employee_id,
              currentLogId || null,
              clusterCentroid.latitude,
              clusterCentroid.longitude,
              earliestTime,
              now,
              durationSec,
            ]
          );
          const newStopId = stopInsert.insertId;

          // Tag current insert + all cluster members
          const pointsToMark = [
            currentInsertId,
            ...candidatePoints.map((p) => p.id),
          ];
          await executeQuery(
            `UPDATE employee_live_tracking SET stop_id = ? WHERE id IN (${pointsToMark.map(() => "?").join(",")})`,
            [newStopId, ...pointsToMark]
          );
        }
      }
    }

    // ── Response — identical contract to original ───────────────────────────────
    res.json({
      status: "ok",
      employee_id,
      location: { latitude, longitude },
      is_inside_geofence: isInsideGeofence,
      distance_from_office: distanceFromOffice
        ? Math.round(distanceFromOffice)
        : null,
      ip_address,
    });
  } catch (err) {
    console.error("liveTrackingHeartbeat error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================== GET /api/attendance/live-tracking/history/:employee_id ========================
export const getLiveTrackingHistory = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { date, limit = 100 } = req.query;

    if (!employee_id) {
      return res.status(400).json({ error: "employee_id is required" });
    }

    let query = `
      SELECT
        id, employee_id, attendance_log_id, latitude, longitude,
        ip_address, accuracy, speed, heading, altitude,
        is_inside_geofence, distance_from_office,
        battery_level, device_info, created_at
      FROM employee_live_tracking
      WHERE employee_id = ?
    `;
    const params = [employee_id];

    if (date) {
      query += ` AND DATE(created_at) = ?`;
      params.push(date);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const history = await executeQuery(query, params);

    const [employee] = await executeQuery(
      `SELECT id, first_name, last_name, staff_id, attendance_method, location_id
       FROM employees WHERE id = ?`,
      [employee_id]
    );

    res.json({ employee, history, count: history.length });
  } catch (err) {
    console.error("getLiveTrackingHistory error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================== GET /api/attendance/live-tracking/active ========================
export const getActiveLiveTracking = async (req, res) => {
  try {
    // Fixed: the original self-join on employee_live_tracking produced duplicate rows
    // when an employee had multiple pings. Using a subquery to guarantee only the
    // single latest ping per employee is joined.
    const activeEmployees = await executeQuery(
      `SELECT
        e.id, e.first_name, e.last_name, e.staff_id, e.company_id,
        g.latitude  AS office_lat,
        g.longitude AS office_lon,
        g.radius    AS office_radius,
        g.id        AS office_location_id,
        latest.latitude          AS current_lat,
        latest.longitude         AS current_lon,
        latest.created_at        AS last_update,
        latest.is_inside_geofence,
        latest.distance_from_office,
        latest.ip_address,
        al.id       AS active_log_id,
        al.clock_in AS check_in_time
      FROM employees e
      INNER JOIN attendance_logs al
        ON e.id = al.employee_id AND al.clock_out IS NULL
      LEFT JOIN geo_locations g ON e.location_id = g.id
      LEFT JOIN (
        SELECT elt.*
        FROM employee_live_tracking elt
        INNER JOIN (
          SELECT employee_id, MAX(created_at) AS max_created_at
          FROM employee_live_tracking
          GROUP BY employee_id
        ) newest
          ON elt.employee_id = newest.employee_id
         AND elt.created_at  = newest.max_created_at
      ) latest ON e.id = latest.employee_id
      WHERE e.attendance_method = 'location_tracking'
        AND e.is_active = 1`
    );

    res.json({ count: activeEmployees.length, employees: activeEmployees });
  } catch (err) {
    console.error("getActiveLiveTracking error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================== GET /api/attendance/live-tracking/session/:employee_id ========================
export const getCurrentSessionTracking = async (req, res) => {
  try {
    const { employee_id } = req.params;

    if (!employee_id) {
      return res.status(400).json({ error: "employee_id is required" });
    }

    const [activeLog] = await executeQuery(
      `SELECT id, attendance_date, clock_in
       FROM attendance_logs
       WHERE employee_id = ? AND clock_out IS NULL
       ORDER BY clock_in DESC LIMIT 1`,
      [employee_id]
    );

    if (!activeLog) {
      return res.json({
        is_active: false,
        message: "No active attendance session found",
      });
    }

    const trackingPoints = await executeQuery(
      `SELECT
        latitude, longitude, ip_address, accuracy, speed,
        is_inside_geofence, distance_from_office,
        battery_level, created_at
       FROM employee_live_tracking
       WHERE employee_id = ? AND attendance_log_id = ?
       ORDER BY created_at ASC`,
      [employee_id, activeLog.id]
    );

    const sessionDuration = new Date() - new Date(activeLog.clock_in);
    const insideGeofenceCount = trackingPoints.filter(
      (p) => p.is_inside_geofence
    ).length;
    const outsideGeofenceCount = trackingPoints.filter(
      (p) => p.is_inside_geofence === false
    ).length;
    const avgDistance =
      trackingPoints.length > 0
        ? trackingPoints.reduce(
            (sum, p) => sum + (p.distance_from_office || 0),
            0
          ) / trackingPoints.length
        : null;

    res.json({
      is_active: true,
      session: {
        log_id: activeLog.id,
        attendance_date: activeLog.attendance_date,
        clock_in: activeLog.clock_in,
        duration_minutes: Math.floor(sessionDuration / 60000),
      },
      tracking_points: trackingPoints,
      stats: {
        total_updates: trackingPoints.length,
        inside_geofence: insideGeofenceCount,
        outside_geofence: outsideGeofenceCount,
        avg_distance_from_office: avgDistance ? Math.round(avgDistance) : null,
      },
    });
  } catch (err) {
    console.error("getCurrentSessionTracking error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================== GET /api/attendance/live-tracking/route/:employee_id ========================
export const getHistoricalRoute = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { date } = req.query;

    if (!employee_id || !date) {
      return res
        .status(400)
        .json({ error: "employee_id and date are required" });
    }

    const points = await executeQuery(
      `SELECT latitude, longitude, created_at, accuracy, speed, battery_level, distance_from_last
       FROM employee_live_tracking
       WHERE employee_id = ? AND DATE(created_at) = ?
       ORDER BY created_at ASC`,
      [employee_id, date]
    );

    const stops = await executeQuery(
      `SELECT id, latitude, longitude, start_time, end_time, duration_seconds
       FROM employee_tracking_stops
       WHERE employee_id = ? AND DATE(start_time) = ?
       ORDER BY start_time ASC`,
      [employee_id, date]
    );

    let [summary] = await executeQuery(
      `SELECT total_distance_km, total_stops, moving_seconds, stopped_seconds
       FROM employee_route_summaries
       WHERE employee_id = ? AND attendance_date = ?`,
      [employee_id, date]
    );

    if (!summary) {
      // Live on-the-fly calculation for active / not-yet-summarised days
      const totalDistanceM = points.reduce(
        (sum, p) => sum + parseFloat(p.distance_from_last || 0),
        0
      );
      const totalDistanceKm = Math.round((totalDistanceM / 1000) * 100) / 100;
      const totalStops = stops.length;
      const stoppedSec = stops.reduce(
        (sum, s) => sum + (s.duration_seconds || 0),
        0
      );

      let movingSec = 0;
      if (points.length >= 2) {
        const first = new Date(points[0].created_at);
        const last = new Date(points[points.length - 1].created_at);
        // Use clock_in → now / clock_out span, not just breadcrumb span,
        // so idle time between the last ping and clock-out is included.
        const [logRow] = await executeQuery(
          `SELECT al.clock_in, al.clock_out
           FROM attendance_logs al
           WHERE al.employee_id = ?
             AND (DATE(al.clock_in) = ? OR DATE(al.attendance_date) = ?)
           ORDER BY al.clock_in DESC LIMIT 1`,
          [employee_id, date, date]
        );

        let durationSeconds;
        if (logRow && logRow.clock_in) {
          const end = logRow.clock_out ? new Date(logRow.clock_out) : new Date();
          durationSeconds = Math.max(
            0,
            Math.floor((end - new Date(logRow.clock_in)) / 1000)
          );
        } else {
          // Fallback: breadcrumb span
          durationSeconds = Math.max(
            0,
            Math.floor((last - first) / 1000)
          );
        }
        movingSec = Math.max(
          0,
          durationSeconds - Math.min(stoppedSec, durationSeconds)
        );
      }

      summary = {
        total_distance_km: totalDistanceKm,
        total_stops: totalStops,
        moving_seconds: movingSec,
        stopped_seconds: stoppedSec,
        is_computed_live: true,
      };
    }

    res.json({ points, stops, summary });
  } catch (error) {
    console.error("getHistoricalRoute error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ======================== GET /api/attendance/live-tracking/shift-status ========================
export const getLiveTrackingShiftStatus = async (req, res) => {
  try {
    const { employee_id } = req.query;
    if (!employee_id) {
      return res.status(400).json({ error: "employee_id is required" });
    }

    const [emp] = await executeQuery(
      `SELECT attendance_method FROM employees WHERE id = ?`,
      [employee_id]
    );

    if (!emp) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const shiftGate = await isCurrentlyInShift(employee_id);
    res.json({
      attendance_method: emp.attendance_method,
      inShift: shiftGate.inShift,
      window: shiftGate.window || null,
    });
  } catch (error) {
    console.error("getLiveTrackingShiftStatus error:", error);
    res.status(500).json({ error: error.message });
  }
};