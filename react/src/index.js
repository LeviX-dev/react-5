import React from "react";
import { createRoot } from "react-dom/client";
// ROOT APP
import App from "./app/App.jsx";

import "./styles/app/app.scss";

// ── Geo-Fence Service Worker registration ─────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/geo-fence-sw.js")
      .then((reg) => {
        console.log("[GeoFenceSW] registered, scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("[GeoFenceSW] registration failed:", err);
      });

    // ── Main-thread relay: SW asks for GPS, we respond ──────────────────────
    navigator.serviceWorker.addEventListener("message", async (event) => {
      const msg = event.data;
      if (!msg || msg.type !== "GET_LOCATION") return;

      if (!navigator.geolocation) {
        event.source?.postMessage({ type: "LOCATION_RESPONSE", latitude: null, longitude: null });
        return;
      }

      // Fetch battery level
      let battery_level = null;
      if (navigator.getBattery) {
        try {
          const battery = await navigator.getBattery();
          battery_level = Math.round(battery.level * 100);
        } catch (e) {}
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          event.source?.postMessage({
            type:          "LOCATION_RESPONSE",
            latitude:      pos.coords.latitude,
            longitude:     pos.coords.longitude,
            accuracy:      pos.coords.accuracy,
            speed:         pos.coords.speed,
            heading:       pos.coords.heading,
            altitude:      pos.coords.altitude,
            battery_level,
            device_info:   navigator.userAgent
          });
        },
        () => {
          // Permission denied or unavailable — send null, never punish employee
          event.source?.postMessage({ type: "LOCATION_RESPONSE", latitude: null, longitude: null });
        },
        { timeout: 8000, maximumAge: 0, enableHighAccuracy: true }
      );
    });
  });
}

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
