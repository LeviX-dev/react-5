import React, { useEffect, useState } from "react";

/**
 * GeoFenceWarningBanner
 *
 * Props:
 *   monitorStatus  — 'ok' | 'warning' | 'auto_checkout'
 *   graceEndsAt    — ISO timestamp string (when auto-checkout fires)
 *   warningMessage — string from the backend
 *
 * Renders nothing when monitorStatus === 'ok'.
 * Fixed at top of page; high z-index; cannot be dismissed.
 */
export default function GeoFenceWarningBanner({ monitorStatus, graceEndsAt, warningMessage }) {
  const [countdown, setCountdown] = useState(null);

  // Live countdown ticker
  useEffect(() => {
    if (monitorStatus !== "warning" || !graceEndsAt) {
      setCountdown(null);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, new Date(graceEndsAt) - Date.now());
      const totalSec  = Math.floor(remaining / 1000);
      const mins      = String(Math.floor(totalSec / 60)).padStart(2, "0");
      const secs      = String(totalSec % 60).padStart(2, "0");
      setCountdown(`${mins}:${secs}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [monitorStatus, graceEndsAt]);

  if (monitorStatus === "ok") return null;

  // ── Styles ───────────────────────────────────────────────────────────────────
  const isAutoCheckout = monitorStatus === "auto_checkout";

  const bannerStyle = {
    position:        "fixed",
    top:             0,
    left:            0,
    right:           0,
    zIndex:          99999,
    padding:         "12px 24px",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             16,
    fontFamily:      "inherit",
    fontSize:        14,
    fontWeight:      600,
    boxShadow:       "0 2px 12px rgba(0,0,0,0.25)",
    backgroundColor: isAutoCheckout ? "#dc3545" : "#ff9800",
    color:           "#fff",
    letterSpacing:   "0.01em",
    flexWrap:        "wrap",
    textAlign:       "center",
    minHeight:       52,
    borderBottom:    isAutoCheckout ? "3px solid #a71d2a" : "3px solid #e65100",
    animation:       "geoFencePulse 1.4s ease-in-out infinite",
  };

  const iconStyle = {
    fontSize:   22,
    flexShrink: 0,
  };

  const countdownStyle = {
    display:         "inline-flex",
    alignItems:      "center",
    justifyContent:  "center",
    minWidth:        58,
    padding:         "2px 10px",
    background:      "rgba(0,0,0,0.22)",
    borderRadius:    20,
    fontSize:        15,
    fontWeight:      800,
    letterSpacing:   "0.04em",
    marginLeft:      4,
  };

  return (
    <>
      {/* Inject keyframe animation once */}
      <style>{`
        @keyframes geoFencePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.88; }
        }
      `}</style>

      <div style={bannerStyle} role="alert" aria-live="assertive">
        <span style={iconStyle}>{isAutoCheckout ? "🔴" : "⚠️"}</span>

        <span>
          {warningMessage ||
            (isAutoCheckout
              ? "You have been automatically checked out. Please speak to HR if this was an error."
              : "You are outside your designated work area. Return within 5 minutes or you will be automatically checked out.")}
        </span>

        {/* Live countdown — only in warning state */}
        {monitorStatus === "warning" && countdown !== null && (
          <span style={countdownStyle}>
            ⏱ {countdown}
          </span>
        )}
      </div>

      {/* Spacer so page content is not hidden behind the fixed banner */}
      <div style={{ height: 52 }} aria-hidden="true" />
    </>
  );
}
