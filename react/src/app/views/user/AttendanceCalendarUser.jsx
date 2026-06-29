import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Modal, Form, Badge } from "react-bootstrap";
import api from "app/services/api";
import { useSelector } from "react-redux";

// ------------------------------------------------------
// Helpers (unchanged)
// ------------------------------------------------------
const formatDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getFirstDayOfMonth = (year, month) => new Date(year, month, 1);
const getLastDayOfMonth = (year, month) => new Date(year, month + 1, 0);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const toTimeStr = (dt) => {
  if (!dt) return null;
  try {
    const t = dt.includes("T") ? dt.split("T")[1] : dt.split(" ")[1];
    return t ? t.substring(0, 5) : dt.substring(0, 5);
  } catch {
    return dt;
  }
};

const formatLogsForDisplay = (logs) => {
  if (!logs || logs.length === 0) return "";
  return logs.map(log => {
    const inTime  = toTimeStr(log.clock_in) || "";
    const outTime = log.clock_out ? toTimeStr(log.clock_out) : "?";
    return `${inTime}→${outTime}`;
  }).join("\n");
};

const hasPositiveDuration = (value) => {
  if (!value || value === "00:00") return false;
  const [hours, minutes] = String(value).split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) && (hours > 0 || minutes > 0);
};

// Time conversion helpers (unchanged)
const parse24To12 = (timeStr) => {
  if (!timeStr) return { h: "09", m: "00", period: "AM" };
  const [hRaw, mRaw] = timeStr.split(":").map(Number);
  const period = hRaw >= 12 ? "PM" : "AM";
  const h12    = hRaw % 12 || 12;
  return {
    h:      String(h12).padStart(2, "0"),
    m:      String(mRaw || 0).padStart(2, "0"),
    period,
  };
};

const build24 = (h, m, period) => {
  let hour = parseInt(h, 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${m}`;
};

const display12h = (timeStr24) => {
  if (!timeStr24) return "—";
  const { h, m, period } = parse24To12(timeStr24);
  return `${h}:${m} ${period}`;
};

const HOURS_12   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const DEFAULT_TIME = { h: "09", m: "00", period: "AM" };

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const STATUS_COLORS = {
  present:  { bg: "#d4edda", color: "#155724", border: "#c3e6cb" },
  absent:   { bg: "#f8d7da", color: "#721c24", border: "#f5c6cb" },
  leave:    { bg: "#d1ecf1", color: "#0c5460", border: "#bee5eb" },
  halfday:  { bg: "#fff3cd", color: "#856404", border: "#ffeeba" },
  holiday:  { bg: "#ff4d4f", color: "#fff",    border: "#ff0000" },
  weekoff:  { bg: "#e2e3e5", color: "#383d41", border: "#d6d8db" },
};

const getStatusStyle = (status, isFuture) => {
  if (isFuture) return { bg: "#f8f9fa", color: "#bbb", border: "#eee" };
  return STATUS_COLORS[status] || { bg: "#FFFFFF", color: "#000", border: "#eee" };
};

// TimePicker (unchanged)
const TimePicker = ({ value, onChange, label, required, isMobile }) => {
  const selStyle = {
    fontSize:        isMobile ? 13 : 14,
    padding:         "6px 4px",
    borderRadius:    6,
    border:          "1px solid #ced4da",
    backgroundColor: "#fff",
    cursor:          "pointer",
  };

  return (
    <div>
      {label && (
        <Form.Label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
          {label}
          {required && <span style={{ color: "#dc3545", marginLeft: 2 }}>*</span>}
        </Form.Label>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <select
          value={value.h}
          onChange={(e) => onChange({ ...value, h: e.target.value })}
          style={{ ...selStyle, width: isMobile ? 58 : 64 }}
        >
          {HOURS_12.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <span style={{ fontWeight: 700, color: "#555", fontSize: 16, lineHeight: 1 }}>:</span>
        <select
          value={value.m}
          onChange={(e) => onChange({ ...value, m: e.target.value })}
          style={{ ...selStyle, width: isMobile ? 58 : 64 }}
        >
          {MINUTES_60.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={value.period}
          onChange={(e) => onChange({ ...value, period: e.target.value })}
          style={{ ...selStyle, width: isMobile ? 64 : 70 }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

// DayCell (unchanged)
const DayCell = ({ dateStr, day, status, logsDisplay, onClick, isFuture, isClickable, isMobile }) => {
  const style = getStatusStyle(status, isFuture);

  if (isMobile) {
    return (
      <div
        onClick={() => isClickable && onClick(dateStr)}
        style={{
          minHeight: 54, backgroundColor: style.bg,
          border: `1px solid ${style.border}`, borderRadius: 6,
          padding: "4px 2px", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          cursor: isClickable ? "pointer" : "default",
          opacity: isFuture ? 0.5 : 1, position: "relative",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: style.color, lineHeight: 1.2 }}>{day}</div>
        {status && !isFuture && (
          <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: style.color, textAlign: "center", marginTop: 2, letterSpacing: "0.3px", lineHeight: 1.1 }}>
            {status === "present" ? "P" : status === "absent" ? "A" : status === "leave" ? "L"
              : status === "halfday" ? "H" : status === "holiday" ? "HOL" : status === "weekoff" ? "WO"
              : status.substring(0, 3).toUpperCase()}
          </div>
        )}
        {isClickable && (
          <div style={{ position: "absolute", top: 2, right: 3, width: 5, height: 5, borderRadius: "50%", backgroundColor: "#663399" }} />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => isClickable && onClick(dateStr)}
      style={{
        minHeight: 110, backgroundColor: style.bg,
        border: `1px solid ${style.border}`, padding: 8,
        display: "flex", flexDirection: "column", alignItems: "center",
        cursor: isClickable ? "pointer" : "default", opacity: isFuture ? 0.6 : 1,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: style.color, marginBottom: 4 }}>{day}</div>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: style.color, textAlign: "center" }}>
        {status ? status.replace("-", " ") : ""}
      </div>
      {logsDisplay && (
        <div style={{ fontSize: 10, marginTop: 4, color: style.color, textAlign: "center", whiteSpace: "pre-line", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
          {logsDisplay}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------
// Main Component (modified generateDays)
// ------------------------------------------------------
const AttendanceCalendarUser = () => {
  const authUser   = useSelector((state) => state.auth.user);
  const userId     = authUser?.user_id || authUser?.id;
  const employeeId = authUser?.employee_id || userId;
  const isMobile   = useIsMobile();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [currentYear]   = useState(new Date().getFullYear());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [logsMap, setLogsMap]             = useState({});
  const [presentCount, setPresentCount]   = useState(0);
  const [absentCount, setAbsentCount]     = useState(0);
  const [leaveCount, setLeaveCount]       = useState(0);
  const [lateCount, setLateCount]         = useState(0);
  const [earlyLeaveCount, setEarlyLeaveCount] = useState(0);

  // Modal state (unchanged)
  const [showModal, setShowModal]       = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayLogs, setDayLogs]           = useState([]);
  const [dayStatus, setDayStatus]       = useState("");
  const [loadingLogs, setLoadingLogs]   = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  const [editingRow, setEditingRow]       = useState(null);
  const [clockInTime, setClockInTime]     = useState({ ...DEFAULT_TIME });
  const [clockOutTime, setClockOutTime]   = useState({ ...DEFAULT_TIME });
  const [clockOutEmpty, setClockOutEmpty] = useState(false);
  const [formError, setFormError]         = useState("");
  const [employeeData, setEmployeeData]   = useState(null);

  // Overlap check (unchanged)
  const hasTimeOverlap = (newIn24, newOut24, excludeIndex = null) => {
    const toMin = (t) => {
      if (!t) return null;
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const newIn  = toMin(newIn24);
    const newOut = newOut24 ? toMin(newOut24) : null;

    for (let i = 0; i < dayLogs.length; i++) {
      if (excludeIndex !== null && i === excludeIndex) continue;
      const log         = dayLogs[i];
      const existingIn  = toMin(toTimeStr(log.clock_in));
      const existingOut = log.clock_out ? toMin(toTimeStr(log.clock_out)) : null;

      if (existingOut === null) {
        if (newIn >= existingIn) return true;
      } else {
        if (
          (newIn >= existingIn && newIn < existingOut) ||
          (newOut !== null && newOut > existingIn && newOut <= existingOut) ||
          (newIn <= existingIn && (newOut === null || newOut >= existingOut))
        ) return true;
      }
    }
    return false;
  };

  // Fetch month data (unchanged – already only counts up to today for current month)
  const fetchMonthData = useCallback(async () => {
    if (!employeeId) return;
    const first    = getFirstDayOfMonth(currentYear, selectedMonth);
    const today    = new Date();
    const isCurrentMonth = currentYear === today.getFullYear() && selectedMonth === today.getMonth();
    const last     = isCurrentMonth ? today : getLastDayOfMonth(currentYear, selectedMonth);
    const fromDate = formatDate(first);
    const toDate   = formatDate(last);

    try {
      const res = await api.get("/api/attendance/range", {
        params: { employee_id: employeeId, from_date: fromDate, to_date: toDate },
      });

      const statusMap   = {};
      const logsMapTemp = {};
      let present = 0, absent = 0, leave = 0, late = 0, earlyLeave = 0;

      res.data.forEach((item) => {
        const d      = item.attendance_date;
        const status = item.attendance_status?.toLowerCase();
        statusMap[d] = status;
        if (status === "present" || status === "half-day") present++;
        else if (status === "absent") absent++;
        else if (status === "leave")  leave++;
        if (hasPositiveDuration(item.time_late))     late++;
        if (hasPositiveDuration(item.early_leaving)) earlyLeave++;
        logsMapTemp[d] = formatLogsForDisplay(item.logs || []);
      });

      setAttendanceMap(statusMap);
      setLogsMap(logsMapTemp);
      setPresentCount(present);
      setAbsentCount(absent);
      setLeaveCount(leave);
      setLateCount(late);
      setEarlyLeaveCount(earlyLeave);
    } catch (err) {
      console.error("Failed to fetch month data:", err);
    }
  }, [employeeId, currentYear, selectedMonth]);

  useEffect(() => { fetchMonthData(); }, [fetchMonthData]);

  // Fetch employee data to check attendance_method
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!employeeId) return;
      try {
        const res = await api.get(`/api/employees/${employeeId}`);
        // API returns {success: true, data: {...}}
        const empData = res.data?.data || res.data;
        console.log("[DEBUG] Employee data:", empData);
        console.log("[DEBUG] attendance_method:", empData?.attendance_method);
        setEmployeeData(empData);
      } catch (err) {
        console.error("Failed to fetch employee data:", err);
      }
    };
    fetchEmployee();
  }, [employeeId]);

  // Open modal – only for non‑future days (unchanged)
  const handleDayClick = async (dateStr) => {
    const todayStr = formatDate(new Date());
    if (dateStr > todayStr) return;

    setSelectedDate(dateStr);
    setShowModal(true);
    setError("");
    setFormError("");
    setDayStatus((attendanceMap[dateStr] || "absent").toLowerCase());
    setLoadingLogs(true);

    try {
      const res  = await api.get(`/api/attendance/${employeeId}`, { params: { date: dateStr } });
      const logs = (res.data?.logs || []).map((l) => ({
        id: l.id, clock_in: l.clock_in || "", clock_out: l.clock_out || "",
      }));
      setDayLogs(logs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setDayLogs([]);
      setError("Could not load attendance logs.");
    } finally {
      setLoadingLogs(false);
    }

    resetForm();
  };

  // Form helpers (unchanged)
  const resetForm = () => {
    setEditingRow(null);
    setClockInTime({ ...DEFAULT_TIME });
    setClockOutTime({ ...DEFAULT_TIME });
    setClockOutEmpty(false);
    setFormError("");
  };

  const handleEditRow = (index) => {
    const row = dayLogs[index];
    setEditingRow(index);
    setClockInTime(parse24To12(toTimeStr(row.clock_in)));
    if (row.clock_out) {
      setClockOutTime(parse24To12(toTimeStr(row.clock_out)));
      setClockOutEmpty(false);
    } else {
      setClockOutTime({ ...DEFAULT_TIME });
      setClockOutEmpty(true);
    }
    setFormError("");
  };

  const handleCancelEdit = () => resetForm();

  const handleAddOrUpdateRow = () => {
    const in24  = build24(clockInTime.h,  clockInTime.m,  clockInTime.period);
    const out24 = clockOutEmpty ? "" : build24(clockOutTime.h, clockOutTime.m, clockOutTime.period);

    if (out24 && out24 <= in24) {
      setFormError("Clock‑out must be after clock‑in.");
      return;
    }

    if (hasTimeOverlap(in24, out24 || null, editingRow)) {
      setFormError("This time range overlaps with an existing log.");
      return;
    }

    const newRow = { clock_in: in24, clock_out: out24 };

    if (editingRow !== null && editingRow >= 0) {
      const updated = [...dayLogs];
      updated[editingRow] = newRow;
      setDayLogs(updated);
    } else {
      setDayLogs([...dayLogs, newRow]);
    }
    resetForm();
  };

  const handleDeleteRow = async (index) => {
    if (!window.confirm("Remove this log entry?")) return;
    const log = dayLogs[index];
    try {
      if (log.id) await api.delete(`/api/attendance/log/${log.id}`);
      setDayLogs(dayLogs.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete log error:", err);
      setError("Failed to delete log: " + (err.response?.data?.error || err.message));
    }
  };

  const handleSaveDay = async () => {
    console.log("Saving day:", selectedDate, employeeId);
    if (!selectedDate || !employeeId) return;
    setSaving(true);
    setError("");
    const status = dayLogs.length > 0 ? "present" : "absent";

    // Wait for employee data to load
    if (!employeeData) {
      setError("Employee data loading... Please try again.");
      setSaving(false);
      return;
    }

    // Check if employee requires location (geofence or location_tracking)
    const requiresLocation = employeeData.attendance_method === "geofence" || 
                            employeeData.attendance_method === "location_tracking";

    let latitude = null;
    let longitude = null;
console.log("requiresLocation:", requiresLocation, "attendance_method:", employeeData.attendance_method);

    if (requiresLocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        console.log("Position:", position);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoErr) {
        console.error("Geolocation error:", geoErr);
        setError("Location access required. Please enable location permissions to mark attendance.");
        setSaving(false);
        return;
      }

      // Double-check we have coordinates
      if (latitude === null || longitude === null) {
        setError("Failed to get location coordinates. Please try again.");
        setSaving(false);
        return;
      }
    }

    try {
      await api.put("/api/attendance/update", {
        employee_id: employeeId, attendance_date: selectedDate,
        logs: dayLogs, attendance_status: status,
        latitude, longitude,
      });
      const res  = await api.get(`/api/attendance/${employeeId}`, { params: { date: selectedDate } });
      const logs = (res.data?.logs || []).map((l) => ({
        id: l.id, clock_in: l.clock_in || "", clock_out: l.clock_out || "",
      }));
      setDayLogs(logs);
      setDayStatus(status);
      await fetchMonthData();
      setShowModal(false);
    } catch (err) {
      console.error("Save attendance error:", err);
      setError("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------
  // Calendar grid – MODIFIED: show full month (all days)
  // ------------------------------------------------------
const generateDays = () => {
  const firstDayOfMonth = new Date(currentYear, selectedMonth, 1).getDay();
  const daysInMonth     = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const todayStr        = formatDate(new Date());
  const days            = [];

  // Leading empty cells for alignment
  for (let i = 0; i < firstDayOfMonth; i++) days.push({ empty: true });

  // Show ALL days of the month (1 ... daysInMonth)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = `${currentYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isFuture = dateStr > todayStr;

    // For future days: no status, no logs, not clickable
    const status = !isFuture ? (attendanceMap[dateStr] || "absent") : undefined;
    const logsDisplay = !isFuture ? (logsMap[dateStr] || "") : "";

    days.push({
      day: d,
      date: dateStr,
      status,
      logsDisplay,
      isFuture,
      isClickable: !isFuture,
      empty: false,
    });
  }
  return days;
};

  const handlePrevMonth = () => setSelectedMonth((m) => (m === 0 ? 11 : m - 1));
  const handleNextMonth = () => setSelectedMonth((m) => (m === 11 ? 0 : m + 1));
  const handleToday     = () => setSelectedMonth(new Date().getMonth());

  const stats = [
    { label: "Present", shortLabel: "P",  count: presentCount,    bg: "#d4edda", color: "#155724" },
    { label: "Leave",   shortLabel: "L",  count: leaveCount,      bg: "#d1ecf1", color: "#0c5460" },
    { label: "Late",    shortLabel: "Lt", count: lateCount,       bg: "#fff3cd", color: "#856404" },
    { label: "Early",   shortLabel: "E",  count: earlyLeaveCount, bg: "#e2e3e5", color: "#383d41" },
    { label: "Absent",  shortLabel: "Ab", count: absentCount,     bg: "#f8d7da", color: "#721c24" },
  ];

  const DAY_NAMES       = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DAY_NAMES_SHORT = ["S",   "M",   "T",   "W",   "T",   "F",   "S"];

  // Render (unchanged except the grid uses the new generateDays)
  return (
    <div style={{ backgroundColor: "#F4F7F9", minHeight: "100vh", padding: isMobile ? "12px 8px" : "40px" }}>
      <Card style={{ maxWidth: 1200, margin: "0 auto", borderRadius: isMobile ? 12 : 20, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
        <Card.Body style={{ padding: isMobile ? "12px 10px" : 30 }}>
          {/* Header (unchanged) */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: isMobile ? 10 : 0, marginBottom: isMobile ? 12 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Button onClick={handleToday} size={isMobile ? "sm" : undefined} style={{ backgroundColor: "#f1f3f5", border: "none", color: "#333", fontWeight: 500, borderRadius: 6 }}>Today</Button>
              <Button onClick={handlePrevMonth} size={isMobile ? "sm" : undefined} style={{ backgroundColor: "#f1f3f5", border: "none", color: "#333", fontWeight: 600, borderRadius: 6, minWidth: 32 }}>‹</Button>
              <span style={{ fontWeight: 700, color: "#333", fontSize: isMobile ? 15 : 18, whiteSpace: "nowrap" }}>
                {isMobile ? `${MONTHS_SHORT[selectedMonth]} ${currentYear}` : `${MONTHS[selectedMonth]} ${currentYear}`}
              </span>
              <Button onClick={handleNextMonth} size={isMobile ? "sm" : undefined} style={{ backgroundColor: "#f1f3f5", border: "none", color: "#333", fontWeight: 600, borderRadius: 6, minWidth: 32 }}>›</Button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 6 : 8, justifyContent: isMobile ? "flex-start" : "flex-end" }}>
              {stats.map((s) => (
                <div key={s.label} style={{ backgroundColor: s.bg, color: s.color, borderRadius: 20, padding: isMobile ? "4px 10px" : "5px 14px", fontSize: isMobile ? 11 : 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                  <span>{isMobile ? s.shortLabel : s.label}:</span>
                  <span>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day names (unchanged) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: isMobile ? 4 : 8 }}>
            {(isMobile ? DAY_NAMES_SHORT : DAY_NAMES).map((d, i) => (
              <div key={i} style={{ fontSize: isMobile ? 11 : 14, fontWeight: 700, color: "#888", padding: isMobile ? "2px 0" : "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Grid – uses full month days */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 3 : 1, backgroundColor: isMobile ? "transparent" : "#F0F0F0", borderRadius: isMobile ? 8 : 12, overflow: "hidden" }}>
            {generateDays().map((item, i) =>
              item.empty ? (
                <div key={i} style={{ minHeight: isMobile ? 54 : 110, backgroundColor: isMobile ? "transparent" : "#FFF", border: isMobile ? "none" : "1px solid #eee" }} />
              ) : (
                <DayCell key={i} dateStr={item.date} day={item.day} status={item.status}
                  logsDisplay={item.logsDisplay} isFuture={item.isFuture}
                  isClickable={item.isClickable} onClick={handleDayClick} isMobile={isMobile} />
              )
            )}
          </div>

          {/* Mobile legend (unchanged) */}
          {isMobile && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 14, padding: "10px 8px", backgroundColor: "#f8f9fa", borderRadius: 8 }}>
              {[
                { label: "Present",  bg: "#d4edda", color: "#155724" },
                { label: "Absent",   bg: "#f8d7da", color: "#721c24" },
                { label: "Leave",    bg: "#d1ecf1", color: "#0c5460" },
                { label: "Half Day", bg: "#fff3cd", color: "#856404" },
                { label: "Holiday",  bg: "#ff4d4f", color: "#fff"    },
                { label: "Week Off", bg: "#e2e3e5", color: "#383d41" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: l.bg, border: `1px solid ${l.color}33`, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "#555", fontWeight: 500 }}>{l.label}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#663399", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#555", fontWeight: 500 }}>Tap to edit (today)</span>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal (unchanged) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
        <Modal.Header closeButton style={{ padding: isMobile ? "12px 14px" : undefined }}>
          <Modal.Title style={{ fontSize: isMobile ? 15 : 18 }}>{selectedDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: isMobile ? "12px 14px" : "16px 20px" }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Status: </span>
            <Badge bg={dayStatus === "present" ? "success" : dayStatus === "absent" ? "danger" : "secondary"}>
              {dayStatus}
            </Badge>
            <small className="ms-2 text-muted" style={{ fontSize: 11 }}>(auto‑calculated)</small>
          </div>

          {loadingLogs ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status" />
              <p className="mt-2 text-muted" style={{ fontSize: 13 }}>Loading logs...</p>
            </div>
          ) : (
            <>
              {dayLogs.length > 0 ? (
                <div style={{ overflowX: "auto", marginBottom: 12 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 12 : 14 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        {["Clock In", "Clock Out", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "6px 8px", border: "1px solid #dee2e6", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dayLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: "6px 8px", border: "1px solid #dee2e6", whiteSpace: "nowrap" }}>
                            {display12h(toTimeStr(log.clock_in))}
                          </td>
                          <td style={{ padding: "6px 8px", border: "1px solid #dee2e6", whiteSpace: "nowrap" }}>
                            {log.clock_out
                              ? display12h(toTimeStr(log.clock_out))
                              : <span style={{ color: "#999" }}>Still working</span>}
                          </td>
                          <td style={{ padding: "6px 8px", border: "1px solid #dee2e6" }}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <Button size="sm" variant="outline-primary" onClick={() => handleEditRow(idx)} style={{ fontSize: 11, padding: "2px 8px" }}>Edit</Button>
                              <Button size="sm" variant="outline-danger"  onClick={() => handleDeleteRow(idx)} style={{ fontSize: 11, padding: "2px 8px" }}>Del</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: "#999", fontSize: 13, marginBottom: 12 }}>No attendance logs for this day.</p>
              )}

              <div style={{ marginTop: 4, padding: isMobile ? "12px" : "14px 16px", border: "1px solid #dee2e6", borderRadius: 8, backgroundColor: "#fafafa" }}>
                <h6 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                  {editingRow !== null ? "✏️ Edit Log" : "➕ Add New Log"}
                </h6>
                {formError && (
                  <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "6px 10px", borderRadius: 6, fontSize: 12, marginBottom: 10 }}>
                    {formError}
                  </div>
                )}
                <div style={{ marginBottom: 14 }}>
                  <TimePicker label="Clock In" required value={clockInTime} onChange={setClockInTime} isMobile={isMobile} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <Form.Label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Clock Out</Form.Label>
                  <Form.Check
                    type="checkbox"
                    id="still-working"
                    label="Still working (no clock‑out yet)"
                    checked={clockOutEmpty}
                    onChange={(e) => setClockOutEmpty(e.target.checked)}
                    style={{ fontSize: 12, marginBottom: clockOutEmpty ? 0 : 8, cursor: "pointer" }}
                  />
                  {!clockOutEmpty && (
                    <div style={{ marginTop: 8 }}>
                      <TimePicker value={clockOutTime} onChange={setClockOutTime} isMobile={isMobile} />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {editingRow !== null && (
                    <Button variant="secondary" size="sm" onClick={handleCancelEdit} style={{ fontSize: 12 }}>Cancel</Button>
                  )}
                  <Button size="sm" onClick={handleAddOrUpdateRow}
                    style={{ backgroundColor: "#663399", border: "none", fontSize: 12, minWidth: 60 }}>
                    {editingRow !== null ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </>
          )}
          {error && (
            <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "8px 12px", borderRadius: 6, fontSize: 12, marginTop: 10 }}>
              {error}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ padding: isMobile ? "10px 14px" : undefined }}>
          <Button variant="light" onClick={() => setShowModal(false)} size={isMobile ? "sm" : undefined}>Close</Button>
          <Button onClick={handleSaveDay} disabled={saving || loadingLogs} size={isMobile ? "sm" : undefined}
            style={{ backgroundColor: "#28a745", border: "none" }}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AttendanceCalendarUser;