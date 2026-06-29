import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Badge, Form, Spinner, Modal } from "react-bootstrap";
import * as XLSX from "xlsx";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

export default function AttendanceRangeReport() {
  const navigate = useNavigate();

  // ---- filter master data ----
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // ---- filter values ----
  const [companyId, setCompanyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ---- result & UI states ----
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    present: 0, absent: 0, lateDays: 0, earlyLeavingDays: 0,
    leave: 0, holiday: 0, weekoff: 0, totalWorkMin: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [logViewer, setLogViewer] = useState({ show: false, title: "", logs: [] });

  // ---- pagination ----
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  // ---- helper functions ----
  const timeToMinutes = (t) => {
    if (!t || !t.includes(":")) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (total) => {
    const abs = Math.abs(total);
    return `${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  };

  // ---- load master data once ----
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [compRes, deptRes, empRes] = await Promise.all([
          api.get("/api/companies"),
          api.get("/api/departments"),
          api.get("/api/employees"),
        ]);
        setCompanies(compRes.data.companies || []);
        setDepartments(deptRes.data.departments || []);
        const empList = Array.isArray(empRes.data)
          ? empRes.data
          : empRes.data?.data || [];
        setEmployees(empList);
      } catch (err) {
        console.error("Master data error:", err);
      }
    };
    loadMaster();
  }, []);

  // ---- filtered employees based on company & department (ONLY ACTIVE) ----
  const filteredEmployees = employees.filter((emp) => {
    // Filter only active employees
    if (emp.is_active === 0 || emp.is_active === false) return false;
    if (companyId && emp.company_id !== Number(companyId)) return false;
    if (departmentId && emp.department_id !== Number(departmentId)) return false;
    return true;
  });

  // ---- build summary from data ----
  const buildSummary = (rows) => {
    const s = { present: 0, absent: 0, lateDays: 0, earlyLeavingDays: 0, leave: 0, holiday: 0, weekoff: 0, totalWorkMin: 0 };
    rows.forEach((item) => {
      switch (item.status) {
        case "present":  s.present++;  break;
        case "leave":    s.leave++;    break;
        case "holiday":  s.holiday++;  break;
        case "weekoff":  s.weekoff++;  break;
        default:         s.absent++;   break;
      }
      if (item.late !== "00:00") s.lateDays++;
      if (item.earlyLeaving !== "00:00") s.earlyLeavingDays++;
      s.totalWorkMin += timeToMinutes(item.totalWork);
    });
    return s;
  };

  // ---- export to excel ----
  const handleExportExcel = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const selectedEmployee = employees.find((emp) => String(emp.id) === String(employeeId));
    const employeeName = selectedEmployee?.employee || "Employee";

    // Prepare data for Excel
    const exportData = data.map((item, index) => ({
      "#": index + 1,
      "Employee": item.employee,
      "Department": item.department,
      "Company": item.company,
      "Date": item.date,
      "Status": formatAttendanceLabel(item.status || "absent"),
      "Log Count": item.logs?.length || 0,
      "First In": item.firstIn,
      "Last Out": item.lastOut,
      "Late": item.late,
      "Early Leaving": item.earlyLeaving,
      "Overtime": item.overtime,
      "Total Work": item.totalWork,
      "Total Rest": item.totalRest,
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    // Add summary sheet
    const summaryData = [
      ["Date Wise Attendance Summary"],
      [`Date Range: ${fromDate} to ${toDate}`],
      [`Employee: ${employeeName}`],
      [],
      ["Metric", "Count"],
      ["Present", summary.present],
      ["Absent", summary.absent],
      ["Late Days", summary.lateDays],
      ["Early Leaving", summary.earlyLeavingDays],
      ["Leave", summary.leave],
      ["Holiday", summary.holiday],
      ["Week Off", summary.weekoff],
      ["Total Hours", minutesToTime(summary.totalWorkMin)],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Download file
    const filename = `Date_Wise_Attendance_${employeeName}_${fromDate}_to_${toDate}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // ---- search handler ----
  const handleSearch = useCallback(async () => {
    if (!employeeId || !fromDate || !toDate) {
      setError("Please select Employee, Start Date and End Date.");
      return;
    }
    setError(null);
    setLoading(true);
    setSearched(true);
    setCurrentPage(1);

    try {
      const res = await api.get("/api/attendance/range", {
        params: {
          employee_id: employeeId,
          from_date: fromDate,
          to_date: toDate,
        },
      });

      const list = res.data || [];
      const formatted = list.map((item, idx) => ({
        id: idx,
        employee: item.employee || "N/A",
        department: item.department_name || "-",
        company: item.company_name || "-",
        date: item.attendance_date,
        status: item.attendance_status,
        firstIn: item.first_clock_in || "-",
        lastOut: item.last_clock_out || "-",
        late: item.time_late || "00:00",
        earlyLeaving: item.early_leaving || "00:00",
        overtime: item.overtime || "00:00",
        totalWork: item.total_work || "00:00",
        totalRest: item.total_rest || "00:00",
        logs: Array.isArray(item.logs) ? item.logs : [],
      }));

      setData(formatted);
      setSummary(buildSummary(formatted));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.error || "Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  }, [employeeId, fromDate, toDate]);

  // ---- reset employee when company / department change ----
  useEffect(() => {
    setEmployeeId("");
  }, [companyId, departmentId]);

  // ---- helper: status badge colour ----
  const getBadgeVariant = (status) => {
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

  // ---- format date for display ----
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  // ---- pagination calculations ----
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const indexOfFirst = (currentPage - 1) * rowsPerPage;
  const indexOfLast = indexOfFirst + rowsPerPage;
  const currentRows = data.slice(indexOfFirst, indexOfLast);

  // ---- Summary Card Component ----
  const SummaryCard = ({ summary }) => (
    <Card className="mt-3 shadow-sm">
      <Card.Body>
        <Row className="text-center g-2">
          {[
            { label: "Present",       value: summary.present,                    color: "#16a34a" },
            { label: "Absent",        value: summary.absent,                     color: "#ef4444" },
            { label: "Late Days",     value: summary.lateDays,                   color: "#f59e0b" },
            { label: "Early Leaving", value: summary.earlyLeavingDays,           color: "#8b5cf6" },
            { label: "Leave",         value: summary.leave,                      color: "#f59e0b" },
            { label: "Holiday",       value: summary.holiday,                    color: "#3b82f6" },
            { label: "Week Off",      value: summary.weekoff,                    color: "#8b5cf6" },
            { label: "Total Hours",   value: minutesToTime(summary.totalWorkMin), color: "#0d6efd" },
          ].map(({ label, value, color }) => (
            <Col key={label} xs={6} md={3} lg>
              <div
                style={{
                  padding: "10px 6px",
                  borderRadius: 8,
                  background: "#f8f9fa",
                  borderTop: `3px solid ${color}`,
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Leave", path: "/leave" },
          { name: "Date Wise Attendance" },
        ]}
      />

      {/* Filter Card */}
      <Card className="mt-4 p-4 shadow-sm">
        <h4 className="text-center mb-4">Date Wise Attendance</h4>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Company</Form.Label>
            <Form.Select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4}>
            <Form.Label>Department</Form.Label>
            <Form.Select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4}>
            <Form.Label>Employee *</Form.Label>
            <Form.Select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Select Employee</option>
              {filteredEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.employee} ({e.id})
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Label>Start Date *</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </Col>
          <Col md={6}>
            <Form.Label>End Date *</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </Col>
        </Row>

        <div className="d-flex align-items-center gap-2">
          <Button
            onClick={handleSearch}
            style={{
              backgroundColor: "#7B5CD6",
              border: "none",
              padding: "10px 24px",
            }}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <i className="i-Search me-2" />
            )}
            Search
          </Button>
          {error && <small className="text-danger">{error}</small>}
        </div>
      </Card>

      {/* Results Table */}
      <Card body className="mt-4 shadow-sm">
        <Card.Title>Attendance Records</Card.Title>

        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" />
          </div>
        ) : !searched ? (
          <p className="text-muted text-center py-4">
            Use the filters above and click Search to view attendance records.
          </p>
        ) : data.length === 0 ? (
          <p className="text-center py-4">No records found.</p>
        ) : (
          <>
            {/* Summary Card */}
            <SummaryCard summary={summary} />

            <div className="table-responsive mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Detailed Records</h5>
                <Button
                  onClick={handleExportExcel}
                  style={{ backgroundColor: "#27ae60", border: "none", padding: "8px 16px", fontSize: "14px" }}
                >
                  <i className="i-Download me-2" />
                  Export to Excel
                </Button>
              </div>
              <table className="table table-bordered table-hover align-middle">
                <thead style={{ background: "#cfc7d9" }}>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Company</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Logs</th>
                    <th>First In</th>
                    <th>Last Out</th>
                    <th>Late</th>
                    <th>Early Leaving</th>
                    <th>Overtime</th>
                    <th>Total Work</th>
                    <th>Total Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td>{indexOfFirst + idx + 1}</td>
                      <td className="text-nowrap">{row.employee}</td>
                      <td>{row.company}</td>
                      <td>{formatDate(row.date)}</td>
                      <td>
                        <Badge bg={getBadgeVariant(row.status)}>
                          {formatAttendanceLabel(row.status || "absent")}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          disabled={!row.logs?.length}
                          onClick={() => setLogViewer({
                            show: true,
                            title: `${row.employee} - ${formatDate(row.date)}`,
                            logs: row.logs || [],
                          })}
                        >
                          {row.logs?.length ? `${row.logs.length} Logs` : "No Logs"}
                        </Button>
                      </td>
                      <td>{row.firstIn}</td>
                      <td>{row.lastOut}</td>
                      <td>{row.late}</td>
                      <td>{row.earlyLeaving}</td>
                      <td>{row.overtime}</td>
                      <td>{row.totalWork}</td>
                      <td>{row.totalRest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ── PAGINATION ── */}
              <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Rows per page</span>
                  <Form.Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(
                        e.target.value === "all" ? data.length : Number(e.target.value)
                      );
                      setCurrentPage(1);
                    }}
                    style={{ width: 90 }}
                  >
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value="all">All</option>
                  </Form.Select>
                </div>

                <span className="text-muted small">

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
                  {indexOfFirst + 1}–{Math.min(indexOfLast, data.length)} of {data.length}
                </span>

                <div className="d-flex gap-1">
                  <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>⏮</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>◀</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>▶</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>⏭</Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}