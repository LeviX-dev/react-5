import { useState, useEffect, useRef, useCallback } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import api from "app/services/api";

const POLL_INTERVAL_MS = 60 * 1000; // 60 seconds

const formatAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function GeoFenceNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [panelOpen,     setPanelOpen]     = useState(false);
  const timerRef = useRef(null);

  // ── Fetch notifications ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/api/geo-fence/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // Silent — non-critical
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    timerRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchNotifications]);

  // ── Mark single notification as read ────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/geo-fence/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Silent
    }
  };

  // ── Mark all as read ─────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.allSettled(
      unread.map((n) => api.put(`/api/geo-fence/notifications/${n.id}/read`))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
  };

  // ── Refresh when panel opens ─────────────────────────────────────────────────
  const handleToggle = (open) => {
    setPanelOpen(open);
    if (open) fetchNotifications();
  };

  return (
    <Dropdown onToggle={handleToggle} show={panelOpen}>
      {/* Bell trigger */}
      <Dropdown.Toggle
        as="div"
        id="dropdownGeoFenceNotification"
        className="badge-top-container toggle-hidden"
        style={{ cursor: "pointer", position: "relative" }}
      >
        {unreadCount > 0 && (
          <span
            className="badge bg-danger cursor-pointer"
            style={{
              position:   "absolute",
              top:        -4,
              right:      -4,
              fontSize:   10,
              minWidth:   18,
              height:     18,
              lineHeight: "18px",
              padding:    "0 5px",
              borderRadius: 10,
              zIndex:     2,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <i className="i-Bell text-muted header-icon" />
      </Dropdown.Toggle>

      {/* Notification panel */}
      <Dropdown.Menu
        className="notification-dropdown mt-2"
        style={{ minWidth: 360, maxWidth: 420, maxHeight: 480, overflowY: "auto" }}
      >
        {/* Panel header */}
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            padding:        "10px 16px 8px",
            borderBottom:   "1px solid #f0f0f0",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>
            Geo-Fence Alerts
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft:      6,
                  background:      "#dc3545",
                  color:           "#fff",
                  borderRadius:    10,
                  fontSize:        11,
                  padding:         "1px 7px",
                  fontWeight:      700,
                }}
              >
                {unreadCount} new
              </span>
            )}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background:  "none",
                border:      "none",
                color:       "#663399",
                fontSize:    12,
                cursor:      "pointer",
                fontWeight:  600,
                padding:     0,
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification rows */}
        {notifications.length === 0 ? (
          <div style={{ padding: "20px 16px", color: "#999", fontSize: 13, textAlign: "center" }}>
            No geo-fence alerts
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="dropdown-item"
              style={{
                display:         "flex",
                alignItems:      "flex-start",
                gap:             10,
                padding:         "10px 16px",
                background:      n.is_read ? "#fff" : "#fff8f0",
                borderBottom:    "1px solid #f5f5f5",
                cursor:          "default",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width:        34,
                  height:       34,
                  borderRadius: "50%",
                  background:   n.is_read ? "#f0f0f0" : "#ffe0e0",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  flexShrink:   0,
                  fontSize:     16,
                }}
              >
                🔴
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize:   13,
                    fontWeight: n.is_read ? 400 : 600,
                    color:      "#333",
                    lineHeight: 1.4,
                    wordBreak:  "break-word",
                  }}
                >
                  {n.message}
                </div>
                <div
                  style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    marginTop:      4,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#999" }}>
                    {formatAgo(n.created_at)}
                  </span>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        background:  "none",
                        border:      "none",
                        color:       "#663399",
                        fontSize:    11,
                        cursor:      "pointer",
                        fontWeight:  600,
                        padding:     "0 0 0 8px",
                        whiteSpace:  "nowrap",
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
                {n.distance_metres && (
                  <div style={{ fontSize: 11, color: "#e65100", marginTop: 2, fontWeight: 500 }}>
                    {Math.round(n.distance_metres)}m outside zone
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
