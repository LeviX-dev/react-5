import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Badge, Form, Modal } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

export default function AttendanceDashboard() {
  // ── state ────────────────────────────────────────────
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logViewer, setLogViewer] = useState({ show: false, title: "", logs: [] });
  const [logLoading, setLogLoading] = useState(false);

  const todayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(todayLocal());
  const [filters, setFilters] = useState({
    department_id: "",
    designation_id: "",
  });

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // ── master data (once) ───────────────────────────────
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          api.get("/api/departments"),
          api.get("/api/designations"),
        ]);
        setDepartments(deptRes.data.departments || []);
        setDesignations(desigRes.data.designations || []);
      } catch (err) {
        console.error("Master data error:", err);
      }
    };
    fetchMaster();
  }, []);

  // ── filter designations by department ────────────────
  const filteredDesignations = designations.filter((d) => {
    if (!filters.department_id) return true;
    const selectedDept = departments.find(
      (dep) => String(dep.id) === String(filters.department_id)
    )?.department_name;
    return d.department_name === selectedDept;
  });

  // ── fetch daily attendance ───────────────────────────
  const fetchData = async () => {
    setError(null);
    setLoading(true);

    try {
      const params = { date: selectedDate };
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.designation_id) params.designation_id = filters.designation_id;

      const res = await api.get("/api/attendance/daily-summary", { params });
      const list = Array.isArray(res.data) ? res.data : [];

      // format data for table
      const formatted = list.map((item) => ({
        id: item.id,
        employeeId: item.employee_id,
        key: String(item.employee_id),
        employee: item.employee,
        department: item.department_name || "-",
        designation: item.designation_name || "-",
        role: item.role_name || "-",
        date: selectedDate,
        status: item.attendance_status,
        firstIn: item.first_clock_in || "-",
        lastOut: item.last_clock_out || "-",
        totalWork: item.total_work || "00:00",
      }));

      setData(formatted);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.error || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = async (item) => {
    try {
      setLogLoading(true);
      const res = await api.get(`/api/attendance/${item.employeeId}`, {
        params: { date: selectedDate },
      });

      const logs = Array.isArray(res.data?.logs) ? res.data.logs : [];
      setLogViewer({
        show: true,
        title: `${item.employee} - ${formatDisplayDate(selectedDate)}`,
        logs,
      });
    } catch (err) {
      console.error("Failed to load logs:", err);
      setError(err.response?.data?.error || "Failed to load attendance logs");
    } finally {
      setLogLoading(false);
    }
  };

  // ── load on mount / when date or filters change ───────
  useEffect(() => {
    fetchData();
  }, [selectedDate, filters]);

  // ── badge color ──────────────────────────────────────
  const getBadge = (status) => {
    switch (status) {
      case "present": return "success";
      case "leave":   return "warning";
      case "holiday": return "primary";
      case "weekoff": return "info";
      default:        return "danger";
    }
  };

  const formatAttendanceLabel = (status) => {
    if (status === "weekoff" || status === "week_off") return "Week Off";
    return status.replace(/_/g, " ").toUpperCase();
  };

  // Properly resolve attendance status (including week-off detection)
  const resolveAttendanceStatus = (item) => {
    const rawStatus = (item.status || "absent").toLowerCase();
    if (rawStatus !== "absent") {
      return rawStatus === "week_off" ? "weekoff" : rawStatus;
    }
    // If "absent", check if it's actually a week-off (for fallback logic)
    return rawStatus;
  };

  // ── date formatter ───────────────────────────────────
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");   // YYYY-MM-DD
    return `${d}/${m}/${y}`;
  };

  // ── pagination helpers ─────────────────────────────────
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const indexOfFirst = (currentPage - 1) * rowsPerPage;
  const indexOfLast = currentPage * rowsPerPage;
  const currentData = data.slice(indexOfFirst, indexOfLast);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Daily Attendance" },
        ]}
      />

      {/* Date & Filters */}
      <Card className="p-3 shadow-sm mt-3">
        <Row className="align-items-end g-2">
          <Col md={2}>
            <Form.Label className="mb-1 small">Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="mb-1 small">Department</Form.Label>
            <Form.Select
              value={filters.department_id}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  department_id: e.target.value,
                  designation_id: "",   // reset on department change
                })
              }
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="mb-1 small">Designation</Form.Label>
            <Form.Select
              value={filters.designation_id}
              onChange={(e) =>
                setFilters({ ...filters, designation_id: e.target.value })
              }
            >
              <option value="">All Designations</option>
              {filteredDesignations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.designation_name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md="auto">
            <Button
              variant="outline-secondary"
              onClick={fetchData}
              className="mb-1"
            >
              Refresh
            </Button>
          </Col>
        </Row>
        {error && (
          <Row className="mt-2">
            <Col>
              <small className="text-danger">{error}</small>
            </Col>
          </Row>
        )}
      </Card>

      {/* Table */}
      <Card className="p-2 mt-4 shadow-sm">
        <div className="w-100 overflow-auto">
          <table className="table table-bordered table-hover align-middle">
            <thead style={{ background: "#cfc7d9" }}>
              <tr>
                <th>No</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Date</th>
                <th>First In</th>
                <th>Last Out</th>
                <th>Total Work</th>
                <th>Status</th>
                <th>Logs</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                    <td colSpan={11} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                    <td colSpan={11} className="text-center">
                    {error ? "Could not load data" : "No records found"}
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={item.key}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{item.employee}</td>
                    <td>{item.department}</td>
                    <td>{item.designation}</td>
                    <td>{item.role}</td>
                    <td>{formatDisplayDate(item.date)}</td>
                    <td>{item.firstIn}</td>
                    <td>{item.lastOut}</td>
                    <td>{item.totalWork}</td>
                    <td>
                      <Badge bg={getBadge(resolveAttendanceStatus(item))}>
                        {formatAttendanceLabel(resolveAttendanceStatus(item))}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleViewLogs(item)}
                        disabled={logLoading}
                      >
                        View Logs
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span>Rows per page</span>
              <Form.Select
                value={rowsPerPage}
                onChange={(e) => {
                  const val =
                    e.target.value === "all"
                      ? data.length
                      : Number(e.target.value);
                  setRowsPerPage(val);
                  setCurrentPage(1);
                }}
                style={{ width: "90px" }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </Form.Select>
            </div>
            <span>
              {indexOfFirst + 1}–{Math.min(indexOfLast, data.length)} of{" "}
              {data.length}
            </span>
            <div className="d-flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                ⏮
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ◀
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ▶
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
              >
                ⏭
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal show={logViewer.show} onHide={() => setLogViewer({ show: false, title: "", logs: [] })} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{logViewer.title || "Attendance Logs"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {logViewer.logs.length === 0 ? (
            <p className="text-muted mb-0">No logs found for this day.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logViewer.logs.map((log, index) => (
                    <tr key={`${log.clock_in || index}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{log.clock_in || "-"}</td>
                      <td>{log.clock_out || "-"}</td>
                      <td>
                        <Badge bg={log.clock_out ? "success" : "warning"}>
                          {log.clock_out ? "Closed" : "Open"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </section>
  );
}