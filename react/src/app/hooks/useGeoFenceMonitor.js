import { useEffect, useRef, useState, useCallback } from "react";
import api from "app/services/api";

const API_BASE = "https://react5.myospaz.in";
const SW_PATH  = "/geo-fence-sw.js";

/**
 * useGeoFenceMonitor
 *
 * Manages continuous geo-fence monitoring for an employee who is clocked in.
 * - If attendance_method !== 'geofence', does nothing.
 * - Starts Service Worker monitoring on mount; stops on unmount.
 * - Falls back to a main-thread setInterval if SW is not supported.
 * - Never calls any API directly — delegates entirely to the SW (or fallback).
 *
 * @param {number|string} employee_id
 * @param {number|string} attendance_log_id  — ID of the currently open log
 * @param {string}        attendance_method  — 'geofence' | 'manual' | 'location_tracking'
 *
 * @returns {{ monitorStatus: 'ok'|'warning'|'auto_checkout', graceEndsAt: string|null, warningMessage: string|null }}
 */
export default function useGeoFenceMonitor(employee_id, attendance_log_id, attendance_method) {
  const [monitorStatus,   setMonitorStatus]   = useState("ok");
  const [graceEndsAt,     setGraceEndsAt]     = useState(null);
  const [warningMessage,  setWarningMessage]  = useState(null);
console.log("[GeoFenceMonitor] Hook initialized:", { employee_id, attendance_log_id, attendance_method });
  // Refs for fallback path
  const fallbackTimerRef = useRef(null);
  const isActiveRef      = useRef(false);

  const [inShift, setInShift] = useState(false);

  // Poll shift status for location_tracking
  useEffect(() => {
    if (attendance_method !== "location_tracking" || !employee_id) {
      setInShift(false);
      return;
    }

    const checkShift = async () => {
      try {
        const res = await api.get(`/api/attendance/live-tracking/shift-status`, {
          params: { employee_id }
        });
        setInShift(res.data?.inShift || false);
      } catch (err) {
        console.error("[GeoFenceMonitor] Failed to check shift status:", err);
      }
    };

    checkShift();
    const interval = setInterval(checkShift, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [employee_id, attendance_method]);

  // ── Handle a status payload from either SW message or fallback fetch ────────
  const handleStatusPayload = useCallback((data) => {
    if (!data || data.reason === "not_geofence" || data.reason === "not_clocked_in") return;

    if (data.status === "ok") {
      setMonitorStatus("ok");
      setGraceEndsAt(null);
      setWarningMessage(null);
    } else if (data.status === "warning") {
      setMonitorStatus("warning");
      setGraceEndsAt(data.grace_ends_at || null);
      setWarningMessage(data.message || "You are outside your designated work area.");
    } else if (data.status === "auto_checkout") {
      setMonitorStatus("auto_checkout");
      setGraceEndsAt(null);
      setWarningMessage(data.message || "You have been automatically checked out.");
    }
  }, []);

  // ── Fallback: main-thread heartbeat (no SW support) ─────────────────────────
  const sendFallbackHeartbeat = useCallback(async () => {
    if (!isActiveRef.current) return;

    // api.js handles auth token automatically via interceptor
    let latitude  = null;
    let longitude = null;
    let accuracy  = null;
    let speed     = null;
    let heading   = null;
    let altitude  = null;

    // Try to get GPS; if denied/unavailable → send null (never punish)
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000, maximumAge: 30000, enableHighAccuracy: true
        });
      });
      latitude  = pos.coords.latitude;
      longitude = pos.coords.longitude;
      accuracy  = pos.coords.accuracy;
      speed     = pos.coords.speed;
      heading   = pos.coords.heading;
      altitude  = pos.coords.altitude;
    } catch {
      // GPS unavailable — proceed with null
    }

    let battery_level = null;
    if (navigator.getBattery) {
      try {
        const battery = await navigator.getBattery();
        battery_level = Math.round(battery.level * 100);
      } catch (e) {}
    }

    try {
      const isLocTracking = attendance_method === "location_tracking";
      console.log("============================================")
      console.log("[GeoFenceMonitor] Sending fallback heartbeat:", {
        employee_id,
        attendance_log_id,
        latitude,
        longitude,
        accuracy,
        speed,
        heading,
        altitude,
        battery_level,
        isLocTracking
      }); 
      const endpoint = isLocTracking
        ? "/api/attendance/live-tracking/heartbeat"
        : "/api/attendance/geo-heartbeat";
console.log("endpoint:", endpoint);
      const payload = {
        employee_id,
        attendance_log_id,
        latitude,
        longitude,
      };

      if (isLocTracking) {
        payload.accuracy = accuracy;
        payload.speed = speed;
        payload.heading = heading;
        payload.altitude = altitude;
        payload.battery_level = battery_level;
        payload.device_info = navigator.userAgent;
      }

      // Use api.js for consistent auth handling (auto token refresh on 401)
      const res = await api.post(endpoint, payload);
      const data = res.data;
      handleStatusPayload(data);

      // Stop fallback loop if employee is no longer clocked in or auto-checked out
      if (data.reason === "not_clocked_in" || data.status === "auto_checkout") {
        stopFallback();
      }
      console.log("============================================")

    } catch (err) {
      console.warn("[GeoFenceMonitor] fallback heartbeat error:", err.message);
    }
  }, [employee_id, attendance_log_id, attendance_method, handleStatusPayload]);

  const stopFallback = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    isActiveRef.current = false;
  }, []);

  const startFallback = useCallback(() => {
    isActiveRef.current = true;
    sendFallbackHeartbeat(); // first tick immediately
    fallbackTimerRef.current = setInterval(sendFallbackHeartbeat, 1 * 60 * 1000); // 1 minute (dev mode)
  }, [sendFallbackHeartbeat]);
  // ── Main effect ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // DEBUG: Log why monitoring might not start
    console.log("[GeoFenceMonitor] Effect triggered:", { attendance_method, employee_id, attendance_log_id });

    // Only monitor geo-fence or location_tracking employees
    if (attendance_method !== "geofence" && attendance_method !== "location_tracking") {
      console.log("[GeoFenceMonitor] Skipping: attendance_method is not 'geofence' or 'location_tracking'");
      return;
    }
    if (!employee_id) {
      console.log("[GeoFenceMonitor] Skipping: no employee_id");
      return;
    }
    if (attendance_method === "geofence" && !attendance_log_id) {
      console.log("[GeoFenceMonitor] Skipping: geofence requires active attendance_log_id");
      return;
    }
    if (attendance_method === "location_tracking" && !inShift) {
      console.log("[GeoFenceMonitor] Skipping: location_tracking is outside shift hours");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("[GeoFenceMonitor] Skipping: no accessToken in localStorage");
      return;
    }

    console.log("[GeoFenceMonitor] Starting monitoring for log:", attendance_log_id);

    // ── Service Worker path ────────────────────────────────────────────────────
    if ("serviceWorker" in navigator) {
      const handleSWMessage = (event) => {
        const msg = event.data;
        if (!msg || msg.type !== "GEOFENCE_STATUS_UPDATE") return;
        handleStatusPayload(msg);

        // Auto-checkout: stop monitoring
        if (msg.status === "auto_checkout") {
          navigator.serviceWorker.ready.then((reg) => {
            reg.active?.postMessage({ type: "STOP_GEOFENCE_MONITORING" });
          });
        }
      };

      navigator.serviceWorker.addEventListener("message", handleSWMessage);

      // Wait for SW to be ready (handles hard-refresh where .controller is null)
      navigator.serviceWorker.ready.then((reg) => {
        console.log("[GeoFenceMonitor] SW ready, posting START message:", { attendance_log_id });
        reg.active?.postMessage({
          type:               "START_GEOFENCE_MONITORING",
          employee_id:        employee_id,
          attendance_log_id:  attendance_log_id,
          token:              token,
          apiBase:            API_BASE,
          attendance_method:  attendance_method
        });
      });

      return () => {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
        navigator.serviceWorker.ready.then((reg) => {
          reg.active?.postMessage({ type: "STOP_GEOFENCE_MONITORING" });
        });
      };
    }

    // ── Fallback: no SW support — run in main thread ───────────────────────────
    console.log("[GeoFenceMonitor] Using fallback path (no SW)");
    startFallback();
    return () => stopFallback();

  }, [employee_id, attendance_log_id, attendance_method, handleStatusPayload, startFallback, stopFallback, inShift]);

  // ── Expose a manual stop helper (e.g. after user manually checks out) ────────
  const stopMonitoring = useCallback(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({ type: "STOP_GEOFENCE_MONITORING" });
      });
    }
    stopFallback();
    setMonitorStatus("ok");
    setGraceEndsAt(null);
    setWarningMessage(null);
  }, [stopFallback]);
  console.log("[GeoFenceMonitor] Exposing stopMonitoring helper:", stopMonitoring);


  return { monitorStatus, graceEndsAt, warningMessage, stopMonitoring };
}
