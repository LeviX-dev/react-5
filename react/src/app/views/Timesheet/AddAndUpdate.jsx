import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Button,
  Table,
  Modal,
} from "react-bootstrap";
import api from "app/services/api";

const AttendanceUI = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filters, setFilters] = useState({
    department_id: "",
    designation_id: "",
    employee_id: "",
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // existingLogs — fetched from DB, shown read-only in Mark mode
  const [existingLogs, setExistingLogs] = useState([]);
  // logs — editable rows (new entries in Mark; all rows in Edit/View)
  const [logs, setLogs] = useState([]);
  // store attendance record ID (if any) for deletion
  const [attendanceId, setAttendanceId] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isMarkMode, setIsMarkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const todayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [date, setDate] = useState(todayLocal());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    attendance_status: "present",
    total_work: "00:00",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const loggedEmployeeId = user?.employee_id;

  // ---------- master data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get("/api/employees");
        const empList = Array.isArray(empRes.data) ? empRes.data : empRes.data.data;
        setAllEmployees(empList || []);
        const deptRes = await api.get("/api/departments");
        setDepartments(deptRes.data.departments || []);
        const desRes = await api.get("/api/designations");
        setDesignations(desRes.data.designations || []);
      } catch (err) {
        console.error("Master data fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const filteredEmployees = allEmployees.filter((emp) => {
    const selectedDept = departments.find(
      (d) => String(d.id) === String(filters.department_id)
    )?.department_name;
    const selectedDesig = designations.find(
      (d) => String(d.id) === String(filters.designation_id)
    )?.designation_name;
    if (filters.department_id && emp.department !== selectedDept) return false;
    if (filters.designation_id && emp.designation !== selectedDesig) return false;
    return true;
  });

  const filteredDesignations = designations.filter((d) => {
    const selectedDept = departments.find(
      (dep) => String(dep.id) === String(filters.department_id)
    )?.department_name;
    if (filters.department_id && d.department_name !== selectedDept) return false;
    return true;
  });

  // ---------- attendance list ----------
  useEffect(() => {
    const loadData = async () => {
      const params = { date };
      if (filters.employee_id) params.employee_id = filters.employee_id;
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.designation_id) params.designation_id = filters.designation_id;
      try {
        const res = await api.get("/api/attendance/by-date", { params });
        const list = Array.isArray(res.data) ? res.data : res.data.data;
        setEmployees(list || []);
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setEmployees([]);
      }
    };
    loadData();
  }, [date, filters, refreshKey]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt.getTime() === today.getTime();
  };

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentEmployees = employees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(employees.length / rowsPerPage);
const finalEmployees = isAdmin
    ? currentEmployees
    : currentEmployees.filter((emp) => 
        String(emp.employee_id) === String(loggedEmployeeId) && 
        emp.attendance_date === date
      );

  useEffect(() => { setCurrentPage(1); }, [filters, date]);

  // ---------- time helpers ----------
  const toMinutes = (t) => {
    if (!t || !t.includes(":")) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const formatMinutes = (total) => {
    const abs = Math.abs(total);
    return `${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  };

  const overlaps = (aIn, aOut, bIn, bOut) => {
    const a1 = toMinutes(aIn);
    const a2 = aOut && aOut.trim() !== "" ? toMinutes(aOut) : 1440;
    const b1 = toMinutes(bIn);
    const b2 = bOut && bOut.trim() !== "" ? toMinutes(bOut) : 1440;
    if (a1 === null || b1 === null) return false;
    return a1 < b2 && b1 < a2;
  };

  const validateNoOverlap = (newRows, existing) => {
    for (let i = 0; i < newRows.length; i++) {
      const { clock_in: aIn, clock_out: aOut } = newRows[i];
      if (!aIn) continue;

      if (aOut && aOut.trim() !== "") {
        if (toMinutes(aOut) <= toMinutes(aIn)) {
          return `Row ${i + 1}: Check-out (${aOut}) must be after check-in (${aIn}).`;
        }
      }

      for (const ex of existing) {
        if (overlaps(aIn, aOut, ex.clock_in, ex.clock_out)) {
          return (
            `New entry ${aIn}–${aOut || "open"} overlaps with ` +
            `existing entry ${ex.clock_in}–${ex.clock_out || "open"}.`
          );
        }
      }

      for (let j = i + 1; j < newRows.length; j++) {
        const { clock_in: bIn, clock_out: bOut } = newRows[j];
        if (!bIn) continue;
        if (overlaps(aIn, aOut, bIn, bOut)) {
          return (
            `New row ${i + 1} (${aIn}–${aOut || "open"}) overlaps ` +
            `new row ${j + 1} (${bIn}–${bOut || "open"}).`
          );
        }
      }
    }
    return null;
  };

  const calculateTotal = (logsArr) => {
    let total = 0;
    logsArr.forEach((l) => {
      if (l.clock_in && l.clock_out && l.clock_out.trim() !== "") {
        const diff = toMinutes(l.clock_out) - toMinutes(l.clock_in);
        if (diff > 0) total += diff;
      }
    });
    return formatMinutes(total);
  };

  useEffect(() => {
    if (logs.length > 0 && (isAdmin || isEditMode)) {
      setFormData((prev) => ({ ...prev, total_work: calculateTotal(logs) }));
    }
  }, [logs, isAdmin, isEditMode]);

  const isLastLogOpen = (logArr) => {
    if (!logArr || logArr.length === 0) return false;
    const last = logArr[logArr.length - 1];
    return !!(last.clock_in && (!last.clock_out || last.clock_out.trim() === ""));
  };

  // ---------- modal open handlers ----------
  const handleMark = async (emp) => {
    setIsMarkMode(true);
    setIsEditMode(false);
    setIsViewMode(false);
    setSelectedEmployee(emp);
    setExistingLogs([]);
    setLogs([{ id: null, clock_in: "", clock_out: "" }]);
    setFormData({ attendance_status: "present", total_work: "00:00" });
    setAttendanceId(null);
    setLoadingLogs(true);
    setShowModal(true);
    try {
      const res = await api.get(
        `/api/attendance/${emp.employee_id}?date=${emp.attendance_date || date}`
      );
      const fetched = (res.data.logs || []).map((l) => ({
        id: l.id,
        clock_in: l.clock_in || "",
        clock_out: l.clock_out || "",
      }));
      setExistingLogs(fetched);
      if (res.data.attendance_status && res.data.attendance_status !== "absent") {
        setFormData((prev) => ({ ...prev, attendance_status: res.data.attendance_status }));
      }
      // store attendance_id for possible deletion (if any)
      if (res.data.id) setAttendanceId(res.data.id);
    } catch (_) {
      setExistingLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleEdit = async (emp) => {
    setIsMarkMode(false);
    setIsEditMode(true);
    setIsViewMode(false);
    setSelectedEmployee(emp);
    setExistingLogs([]);
    setAttendanceId(null);
    setLoadingLogs(true);
    try {
      const res = await api.get(
        `/api/attendance/${emp.employee_id}?date=${emp.attendance_date}`
      );
      const fetched = (res.data.logs || []).map((l) => ({
        id: l.id,
        clock_in: l.clock_in || "",
        clock_out: l.clock_out || "",
      }));
      setLogs(fetched);
      setFormData({
        attendance_status: res.data.attendance_status || "present",
        total_work: res.data.total_work || "00:00",
      });
      if (res.data.id) setAttendanceId(res.data.id);
    } catch (err) {
      console.error("Edit fetch error:", err);
      setLogs([]);
      setFormData({ attendance_status: "present", total_work: "00:00" });
    } finally {
      setLoadingLogs(false);
    }
    setShowModal(true);
  };

  const handleView = async (emp) => {
    setIsMarkMode(false);
    setIsEditMode(false);
    setIsViewMode(true);
    setSelectedEmployee(emp);
    setExistingLogs([]);
    setAttendanceId(null);
    setLoadingLogs(true);
    try {
      const res = await api.get(
        `/api/attendance/${emp.employee_id}?date=${emp.attendance_date}`
      );
      const fetched = (res.data.logs || []).map((l) => ({
        id: l.id,
        clock_in: l.clock_in || "",
        clock_out: l.clock_out || "",
      }));
      setLogs(fetched);
      setFormData({
        attendance_status: res.data.attendance_status || "present",
        total_work: res.data.total_work || "00:00",
      });
      if (res.data.id) setAttendanceId(res.data.id);
    } catch (err) {
      console.error("View error:", err);
    } finally {
      setLoadingLogs(false);
    }
    setShowModal(true);
  };

  // ---------- DELETE individual log entry ----------
  const handleDeleteLog = async (logId) => {
    if (!logId) return; // Only delete if log has been saved to DB
    if (!window.confirm("Delete this log entry?")) return;

    try {
      await api.delete(`/api/attendance/log/${logId}`);
      setLogs(logs.filter((log) => log.id !== logId));
      alert("Log entry deleted ✅");
    } catch (err) {
      console.error("Delete log error:", err);
      alert(err.response?.data?.error || "Failed to delete log entry");
    }
  };

  // ---------- DELETE attendance record (admin only) ----------
  const handleDeleteAttendanceClick = () => {
    if (!attendanceId) {
      alert("No attendance record found for this day.");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/attendance/${attendanceId}`);
      setShowDeleteConfirm(false);
      setShowModal(false);
      setRefreshKey((k) => k + 1);
      alert("Attendance record deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete attendance record.");
      setShowDeleteConfirm(false);
    }
  };

  // ---------- save handlers ----------

  // MARK — append only, never deletes existing logs
  const handleMarkSave = async () => {
    const newLogs = logs.filter((l) => l.clock_in && l.clock_in.trim() !== "");

    if (formData.attendance_status === "present" && newLogs.length === 0) {
      alert("Please enter at least one check-in time.");
      return;
    }

    for (let i = 0; i < newLogs.length; i++) {
      const { clock_in, clock_out } = newLogs[i];
      const [ih, im] = clock_in.split(":").map(Number);
      if (ih > 23 || im > 59) {
        alert(`Row ${i + 1}: Invalid check-in time (${clock_in}).`);
        return;
      }
      if (clock_out && clock_out.trim() !== "") {
        const [oh, om] = clock_out.split(":").map(Number);
        if (oh > 23 || om > 59) {
          alert(`Row ${i + 1}: Invalid check-out time (${clock_out}).`);
          return;
        }
      }
    }

    const overlapError = validateNoOverlap(newLogs, existingLogs);
    if (overlapError) {
      alert(`Overlap detected:\n\n${overlapError}`);
      return;
    }

    // Get GPS location for geo-fence validation
    let latitude = null;
    let longitude = null;
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (geoErr) {
      // If geo-fencing is required, this will fail on server side
      // Still try to submit - server will return error if geo-fence is enforced
      console.warn("Could not get location:", geoErr.message);
    }

    try {
      await api.post("/api/attendance/append", {
        employee_id: selectedEmployee.employee_id,
        attendance_date: date,
        attendance_status: formData.attendance_status,
        logs: newLogs.map((l) => ({
          clock_in: l.clock_in,
          clock_out: l.clock_out || "",
        })),
        latitude,
        longitude,
      });
      setShowModal(false);
      setRefreshKey((k) => k + 1);
      alert("Saved ✅");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Save failed");
    }
  };

  // ADMIN EDIT — full replace
  const handleAdminFullSave = async () => {
    for (const log of logs) {
      if (log.clock_in) {
        const [h, m] = log.clock_in.split(":").map(Number);
        if (h > 23 || m > 59) { alert(`Invalid check-in time (${log.clock_in}).`); return; }
      }
      if (log.clock_out) {
        const [h, m] = log.clock_out.split(":").map(Number);
        if (h > 23 || m > 59) { alert(`Invalid check-out time (${log.clock_out}).`); return; }
      }
    }

    // Get GPS location for geo-fence validation
    let latitude = null;
    let longitude = null;
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (geoErr) {
      console.warn("Could not get location:", geoErr.message);
    }

    const payload = {
      employee_id: selectedEmployee.employee_id,
      attendance_date: date,
      attendance_status: formData.attendance_status,
      logs: logs.map((l) => ({ clock_in: l.clock_in, clock_out: l.clock_out || "" })),
      latitude,
      longitude,
    };
    try {
      if (isEditMode) {
        await api.put("/api/attendance/update", payload);
      } else {
        await api.post("/api/attendance/addnew", payload);
      }
      setShowModal(false);
      setRefreshKey((k) => k + 1);
      alert("Saved ✅");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "Save failed";
      alert(`Save failed ❌\n${errorMessage}`);
    }
  };

  // Non-admin: save individual checkout
  const handleUpdateCheckout = async (logId, clock_out) => {
    if (clock_out) {
      const [h, m] = clock_out.split(":").map(Number);
      if (h > 23 || m > 59) { alert(`Invalid check-out time (${clock_out}).`); return; }
    }

    // Get GPS location for geo-fence validation
    let latitude = null;
    let longitude = null;
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (geoErr) {
      console.warn("Could not get location:", geoErr.message);
    }

    try {
      await api.put("/api/attendance/checkout", { 
        log_id: logId, 
        clock_out,
        latitude,
        longitude,
      });
      setRefreshKey((k) => k + 1);
      setShowModal(false);
      alert("Check-out saved ✅");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save check-out");
    }
  };

  const getColor = (status) => {
    switch (status) {
      case "present":  return "#16a34a";
      case "leave":    return "#f59e0b";
      case "holiday":  return "#3b82f6";
      case "weekoff":  return "#8b5cf6";
      case "half_day": return "#14b8a6";
      default:         return "#ef4444";
    }
  };

  const resolveAttendanceStatus = (emp) => {
   if (emp.logs && Array.isArray(emp.logs) && emp.logs.length > 0) {
      return "present";
    }

    const rawStatus = (emp.attendance_status || "absent").toLowerCase();
    if (rawStatus !== "absent") return rawStatus === "week_off" ? "weekoff" : rawStatus;

    const attendanceDate = emp.attendance_date || date;
    const dayName = new Date(attendanceDate)
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();

    if (emp[`${dayName}_in`] == null && emp[`${dayName}_out`] == null) {
      return "weekoff";
    }

    return rawStatus;
  };

  const formatAttendanceLabel = (status) => {
    if (status === "weekoff" || status === "week_off") return "Week Off";
    return status.replace(/_/g, " ").toUpperCase();
  };

  // ---------- render ----------
  return (
    <Container className="p-4" style={{ background: "#f0f4f8" }}>
      <h2 className="mb-4">Attendance Management</h2>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="fw-semibold">Select Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {isAdmin && (
        <Row className="mb-3">
          <Col md={3}>
            <Form.Select
              value={filters.department_id}
              onChange={(e) =>
                setFilters({ department_id: e.target.value, designation_id: "", employee_id: "" })
              }
            >
              <option value="">All Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.department_name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={filters.designation_id}
              onChange={(e) =>
                setFilters({ ...filters, designation_id: e.target.value, employee_id: "" })
              }
            >
              <option value="">All Designation</option>
              {filteredDesignations.map((d) => (
                <option key={d.id} value={d.id}>{d.designation_name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={filters.employee_id}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, employee_id: e.target.value }))
              }
            >
              <option value="">All Employee</option>
              {filteredEmployees.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.employee} ({e.id})
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      )}

      <Card className="p-2 shadow-sm">
        <div className="w-100 overflow-auto">
          <Table bordered hover responsive className="w-100 align-middle mb-0">
            <thead style={{ background: "#cfc7d9" }}>
              <tr>
                <th>No</th><th>Employee</th><th>Shift</th><th>Department</th>
                <th>Designation</th><th>Role</th><th>Date</th><th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {finalEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-3">No records found</td>
                </tr>
              ) : (
                finalEmployees.map((emp, index) => {
                  const status = resolveAttendanceStatus(emp);
                  const canEdit =
                    isAdmin ||
                    (loggedEmployeeId && Number(loggedEmployeeId) === Number(emp.employee_id));
                  return (
                    <tr key={`${emp.employee_id}_${emp.attendance_date}_${index}`}>
                      <td>{indexOfFirst + index + 1}</td>
                      <td className="text-nowrap">{emp.employee}</td>
                      <td>{emp.shift_name || "-"}</td>
                      <td>{emp.department_name || "-"}</td>
                      <td>{emp.designation_name || "-"}</td>
                      <td>{emp.role_name || "-"}</td>
                      <td>
                        {emp.attendance_date
                          ? (() => {
                              const [y, m, d] = emp.attendance_date.split("T")[0].split("-");
                              return `${d}/${m}/${y}`;
                            })()
                          : "-"}
                      </td>
                      <td>
                        <span
                          style={{
                            background: getColor(status),
                            color: "#fff",
                            padding: "5px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {formatAttendanceLabel(status)}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            size="sm"
                            style={{ background: "#22c55e", border: "none", minWidth: "65px" }}
                            onClick={() => handleMark(emp)}
                          >
                            Mark
                          </Button>
                          {canEdit && (
                            <Button
                              size="sm"
                              style={{ background: "#3b82f6", border: "none", minWidth: "65px" }}
                              onClick={() => handleEdit(emp)}
                            >
                              Edit
                            </Button>
                          )}
                          {!canEdit && (
                            <Button
                              size="sm"
                              style={{ background: "#6b7280", border: "none", minWidth: "65px" }}
                              onClick={() => handleView(emp)}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span>Rows per page</span>
            <Form.Select
              value={rowsPerPage}
              onChange={(e) => {
                const val =
                  e.target.value === "all" ? employees.length : Number(e.target.value);
                setRowsPerPage(val);
                setCurrentPage(1);
              }}
              style={{ width: "90px" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value="all">All</option>
            </Form.Select>
          </div>
          <span>
            {indexOfFirst + 1}–{Math.min(indexOfLast, employees.length)} of {employees.length}
          </span>
          <div className="d-flex gap-1">
            <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>⏮</Button>
            <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>◀</Button>
            <Button variant="secondary" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>▶</Button>
            <Button variant="secondary" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)}>⏭</Button>
          </div>
        </div>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEmployee?.employee} —{" "}
            {selectedEmployee?.attendance_date
              ? (() => {
                  const [y, m, d] = selectedEmployee.attendance_date.split("T")[0].split("-");
                  return `${d}/${m}/${y}`;
                })()
              : date}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!isViewMode && (
            <Form.Select
              className="mb-3"
              value={formData.attendance_status}
              onChange={(e) =>
                setFormData({ ...formData, attendance_status: e.target.value })
              }
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="half_day">Half Day</option>
              <option value="weekoff">Week Off</option>
              <option value="holiday">Holiday</option>
            </Form.Select>
          )}

          {loadingLogs && <div className="text-center py-3">Loading logs…</div>}

          {!loadingLogs && (
            <>
              {isMarkMode && (
                <>
                  {existingLogs.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1 small fw-semibold" style={{ color: "#6b7280" }}>
                        Existing entries (read-only)
                      </p>
                      {existingLogs.map((log, idx) => (
                        <Row key={idx} className="mb-1 align-items-center">
                          <Col>
                            <Form.Control
                              type="time"
                              value={log.clock_in}
                              disabled
                              style={{ background: "#f3f4f6", color: "#6b7280" }}
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="time"
                              value={log.clock_out}
                              disabled
                              style={{ background: "#f3f4f6", color: "#6b7280" }}
                            />
                          </Col>
                          <Col md="auto">
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: log.clock_out ? "#16a34a" : "#f59e0b",
                              }}
                            >
                              {log.clock_out ? "✓ closed" : "⏳ open"}
                            </span>
                          </Col>
                        </Row>
                      ))}
                      <hr className="my-3" />
                    </div>
                  )}

                  <p className="mb-1 small fw-semibold" style={{ color: "#374151" }}>
                    Add new entries
                  </p>
                  {logs.map((log, idx) => (
                    <Row key={idx} className="mb-2 align-items-center">
                      <Col>
                        <Form.Control
                          type="time"
                          value={log.clock_in || ""}
                          onChange={(e) => {
                            const updated = [...logs];
                            updated[idx].clock_in = e.target.value;
                            setLogs(updated);
                          }}
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="time"
                          value={log.clock_out || ""}
                          onChange={(e) => {
                            const updated = [...logs];
                            updated[idx].clock_out = e.target.value;
                            setLogs(updated);
                          }}
                        />
                      </Col>
                      <Col md="auto">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setLogs(logs.filter((_, i) => i !== idx))}
                        >
                          X
                        </Button>
                      </Col>
                    </Row>
                  ))}

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="mt-1"
                    disabled={isLastLogOpen(logs)}
                    onClick={() =>
                      setLogs([...logs, { id: null, clock_in: "", clock_out: "" }])
                    }
                  >
                    + Add More
                  </Button>
                  {isLastLogOpen(logs) && (
                    <p className="text-warning small mt-2 mb-0">
                      Fill the check-out for the last open entry before adding another.
                    </p>
                  )}
                </>
              )}

              {!isMarkMode && (
                <>
                  {logs.map((log, idx) => {
                    const isOpen =
                      log.clock_in && (!log.clock_out || log.clock_out.trim() === "");
                    return (
                      <Row key={idx} className="mb-2 align-items-center">
                        <Col>
                          <Form.Control
                            type="time"
                            value={log.clock_in || ""}
                            disabled={isViewMode || (isEditMode && !isAdmin)}
                            onChange={(e) => {
                              const updated = [...logs];
                              updated[idx].clock_in = e.target.value;
                              setLogs(updated);
                            }}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="time"
                            value={log.clock_out || ""}
                            disabled={isViewMode || (isEditMode && !isAdmin && !isOpen)}
                            onChange={(e) => {
                              if (isEditMode && !isAdmin && isOpen && log.id) {
                                const newCheckout = e.target.value;
                                if (newCheckout) handleUpdateCheckout(log.id, newCheckout);
                              } else {
                                const updated = [...logs];
                                updated[idx].clock_out = e.target.value;
                                setLogs(updated);
                              }
                            }}
                          />
                        </Col>
                        {!isViewMode && isAdmin && (
                          <Col md="auto" className="d-flex gap-1">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (log.id) {
                                  handleDeleteLog(log.id);
                                } else {
                                  setLogs(logs.filter((_, i) => i !== idx));
                                }
                              }}
                            >
                              X
                            </Button>
                          </Col>
                        )}
                      </Row>
                    );
                  })}

                  {!isViewMode && isAdmin && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      disabled={isLastLogOpen(logs)}
                      onClick={() =>
                        setLogs([...logs, { id: null, clock_in: "", clock_out: "" }])
                      }
                    >
                      + Add More
                    </Button>
                  )}

                  {!isViewMode && isEditMode && !isAdmin && (
                    <div className="mt-2 text-muted small">
                      {isLastLogOpen(logs)
                        ? "Fill checkout time for the last open entry before adding a new check-in."
                        : "You can add a new check-in only after closing the previous one."}
                    </div>
                  )}
                </>
              )}

              {!isMarkMode && (
                <Form.Group className="mt-3">
                  <Form.Label>Total Work</Form.Label>
                  <Form.Control value={formData.total_work} disabled />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          {!isViewMode && (
            isMarkMode ? (
              <Button variant="primary" onClick={handleMarkSave}>Save</Button>
            ) : isAdmin ? (
              <>
                <Button variant="primary" onClick={handleAdminFullSave}>Save All</Button>
                {/* Delete button for admin (only if attendance exists) */}
                {attendanceId && (
                  <Button variant="danger" onClick={handleDeleteAttendanceClick}>
                    Delete Record
                  </Button>
                )}
              </>
            ) : (
              <Button variant="secondary" disabled>Auto-save</Button>
            )
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton style={{ background: "#fee2e2", borderColor: "#fecaca" }}>
          <Modal.Title style={{ color: "#991b1b" }}>⚠️ Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ marginBottom: "0.5rem" }} className="fw-semibold">
            Are you sure you want to delete this attendance record?
          </p>
          <p style={{ color: "#666", marginBottom: 0 }} className="small">
            This action <strong>cannot be undone</strong>. All associated logs will be deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Record
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AttendanceUI;