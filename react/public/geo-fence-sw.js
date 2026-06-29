/* ============================================================
   GEO-FENCE MONITORING SERVICE WORKER
   File: public/geo-fence-sw.js

   Message API (from main thread → SW):
     { type: 'START_GEOFENCE_MONITORING', employee_id, attendance_log_id, token, apiBase }
     { type: 'STOP_GEOFENCE_MONITORING' }
     { type: 'LOCATION_RESPONSE', latitude, longitude }   ← reply to GET_LOCATION

   Message API (SW → main thread):
     { type: 'GET_LOCATION' }                              ← request current GPS
     { type: 'GEOFENCE_STATUS_UPDATE', status, message, grace_ends_at?, distance_metres? }
   ============================================================ */

const HEARTBEAT_INTERVAL_MS = 1 * 60 * 1000; // 1 minute (dev mode)

let heartbeatTimer   = null;
let monitoringState  = null; // { employee_id, attendance_log_id, token, apiBase }
let pendingLocResolve = null; // resolves the in-flight location promise

// ── Helpers ────────────────────────────────────────────────────────────────────
function broadcastToClients(msg) {
  self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
    clients.forEach((c) => c.postMessage(msg));
  });
}

function requestLocation() {
  return new Promise((resolve) => {
    pendingLocResolve = resolve;
    broadcastToClients({ type: "GET_LOCATION" });
    // If main thread never responds (tab frozen / hidden), resolve null after 10 s
    setTimeout(() => {
      if (pendingLocResolve) {
        pendingLocResolve({ latitude: null, longitude: null });
        pendingLocResolve = null;
      }
    }, 10000);
  });
}

async function sendHeartbeat() {
  if (!monitoringState) return;

  const { employee_id, attendance_log_id, token, apiBase, attendance_method } = monitoringState;

  // Ask main thread for current GPS coordinates
  const locData = await requestLocation();
  const { latitude, longitude, accuracy, speed, heading, altitude, battery_level, device_info } = locData;

  const isLocTracking = attendance_method === "location_tracking";
  const url = isLocTracking
    ? `${apiBase}/api/attendance/live-tracking/heartbeat`
    : `${apiBase}/api/attendance/geo-heartbeat`;

  const body = {
    employee_id,
    attendance_log_id,
    latitude,
    longitude
  };

  if (isLocTracking) {
    body.accuracy = accuracy;
    body.speed = speed;
    body.heading = heading;
    body.altitude = altitude;
    body.battery_level = battery_level;
    body.device_info = device_info;
  }

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn("[GeoFenceSW] heartbeat HTTP error:", res.status);
      return;
    }

    const data = await res.json();

    // Stop monitoring internally if employee is no longer clocked in
    if (data.reason === "not_clocked_in") {
      stopMonitoring();
      return;
    }

    // If outside shift window, return early (no need to warn/checkout)
    if (data.reason === "outside_shift") {
      return;
    }

    // Relay status to all open tabs
    if (data.status === "warning" || data.status === "auto_checkout") {
      broadcastToClients({
        type:            "GEOFENCE_STATUS_UPDATE",
        status:          data.status,
        message:         data.message,
        grace_ends_at:   data.grace_ends_at   || null,
        distance_metres: data.distance_metres || null,
      });
    } else if (data.status === "ok" && data.resolved) {
      broadcastToClients({
        type:    "GEOFENCE_STATUS_UPDATE",
        status:  "ok",
        message: null,
      });
    }

    // Auto-checkout: stop the heartbeat loop — nothing left to monitor
    if (data.status === "auto_checkout") {
      stopMonitoring();
    }
  } catch (err) {
    console.warn("[GeoFenceSW] heartbeat fetch error:", err.message);
  }
}


function startMonitoring(state) {
  stopMonitoring(); // clear any existing timer first
  monitoringState = state;
  // Fire first heartbeat immediately, then every 5 min
  sendHeartbeat();
  heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
}

function stopMonitoring() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  monitoringState   = null;
  pendingLocResolve = null;
}


// ── Message handler ────────────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case "START_GEOFENCE_MONITORING":
      startMonitoring({
        employee_id:        msg.employee_id,
        attendance_log_id:  msg.attendance_log_id,
        token:              msg.token,
        apiBase:            msg.apiBase || "",
        attendance_method:  msg.attendance_method || "geofence"
      });
      console.log("[GeoFenceSW] Started monitoring:", msg.employee_id, msg.attendance_log_id, msg.attendance_method);
      break;

    case "STOP_GEOFENCE_MONITORING":
      stopMonitoring();
      break;

    case "LOCATION_RESPONSE":
      // Main thread is replying to our GET_LOCATION request
      if (pendingLocResolve) {
        pendingLocResolve({
          latitude:      msg.latitude  ?? null,
          longitude:     msg.longitude ?? null,
          accuracy:      msg.accuracy  ?? null,
          speed:         msg.speed     ?? null,
          heading:       msg.heading   ?? null,
          altitude:      msg.altitude  ?? null,
          battery_level: msg.battery_level ?? null,
          device_info:   msg.device_info   ?? null
        });
        pendingLocResolve = null;
      }
      break;

    default:
      break;
  }
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────
self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
