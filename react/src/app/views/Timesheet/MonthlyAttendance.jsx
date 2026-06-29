import { useEffect, useState, useCallback } from "react";
import {
  Row, Col, Card, Button, Form, Modal,
  Table, Badge, Spinner,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─────────────────────────────────────────────
// HELPERS  (same utils used across attendance pages)
// ─────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

const timeToMinutes = (t) => {
  if (!t || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const generateAllDaysInMonth = (year, month) => {
  const totalDays = new Date(Number(year), Number(month), 0).getDate();
  return Array.from({ length: totalDays }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return `${year}-${String(month).padStart(2, "0")}-${day}`;
  });
};

const getDayName = (dateStr) => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[new Date(`${dateStr}T00:00:00`).getDay()];
};

const isShiftWeekOff = (shift, dayName) => {
  if (!shift) return false;
  return shift[`${dayName}_in`] == null && shift[`${dayName}_out`] == null;
};

const normalizeStatus = (status) => {
  if (!status) return "absent";
  return status === "week_off" ? "weekoff" : status.toLowerCase();
};

const formatAttendanceLabel = (status) => {
  if (status === "weekoff" || status === "week_off") return "Week Off";
  return status.replace(/_/g, " ").toUpperCase();
};

const minutesToTime = (total) => {
  const abs = Math.abs(total);
  return `${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
};

// Same badge colours used in AttendanceRangeReport
const getBadgeVariant = (status) => {
  switch (status?.toLowerCase().trim()) {
    case "present":  return "success";
    case "leave":    return "warning";
    case "holiday":  return "primary";
    case "weekoff":  return "info";
    case "half_day": return "secondary";
    default:         return "danger";
  }
};

const MONTHS = [
  { value: "1",  label: "January"   },
  { value: "2",  label: "February"  },
  { value: "3",  label: "March"     },
  { value: "4",  label: "April"     },
  { value: "5",  label: "May"       },
  { value: "6",  label: "June"      },
  { value: "7",  label: "July"      },
  { value: "8",  label: "August"    },
  { value: "9",  label: "September" },
  { value: "10", label: "October"   },
  { value: "11", label: "November"  },
  { value: "12", label: "December"  },
];

// ─────────────────────────────────────────────
// SUMMARY CARD  (extracted for clarity)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function MonthlyAttendance() {
  const currentYear = new Date().getFullYear();

  // ── master data ──
  const [companies,    setCompanies]    = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [designations, setDesignations] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  // ── filters ──
  const [filters, setFilters] = useState({
    company_id:     "",
    department_id:  "",
    designation_id: "",
    employee_id:    "",
    month:          String(new Date().getMonth() + 1),
    year:           String(currentYear),
  });

  // ── results ──
  const [data,       setData]       = useState([]);
  const [summary,    setSummary]    = useState({
    present: 0, absent: 0, lateDays: 0, earlyLeavingDays: 0,
    leave: 0, holiday: 0, weekoff: 0, totalWorkMin: 0,
  });
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [logViewer, setLogViewer] = useState({ show: false, title: "", logs: [] });

  // ── pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  // ─────────────────────────────────────────
  // Load master data once
  // ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [compRes, deptRes, desRes, empRes] = await Promise.all([
          api.get("/api/companies"),
          api.get("/api/departments"),
          api.get("/api/designations"),
          api.get("/api/employees"),
        ]);
        setCompanies(compRes.data.companies || []);
        setDepartments(deptRes.data.departments || []);
        setDesignations(desRes.data.designations || []);
        const empList = Array.isArray(empRes.data) ? empRes.data : empRes.data?.data || [];
        setAllEmployees(empList);
      } catch (err) {
        console.error("❌ Master data error:", err);
      }
    };
    load();
  }, []);

  // ─────────────────────────────────────────
  // Cascading filter helpers
  // ─────────────────────────────────────────
  const filteredDepartments = departments.filter((d) => {
    if (!filters.company_id) return true;
    return String(d.company_id) === String(filters.company_id);
  });

  const filteredDesignations = designations.filter((d) => {
    if (!filters.department_id) return true;
    const dept = departments.find((dep) => String(dep.id) === String(filters.department_id));
    return d.department_name === dept?.department_name;
  });

  const filteredEmployees = allEmployees.filter((emp) => {
    // Only show active employees
    if (emp.is_active === 0 || emp.is_active === false) return false;
    if (filters.company_id    && String(emp.company_id)    !== String(filters.company_id))    return false;
    if (filters.department_id && String(emp.department_id) !== String(filters.department_id)) return false;
    if (filters.designation_id) {
      const desig = designations.find((d) => String(d.id) === String(filters.designation_id));
      if (desig && emp.designation !== desig.designation_name) return false;
    }
    return true;
  });

  // When company/dept changes, reset downstream
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "company_id")    { next.department_id = ""; next.designation_id = ""; next.employee_id = ""; }
      if (key === "department_id") { next.designation_id = ""; next.employee_id = ""; }
      if (key === "designation_id") { next.employee_id = ""; }
      return next;
    });
  };

  // ─────────────────────────────────────────
  // Build summary from mapped rows
  // ─────────────────────────────────────────
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
      if (item.late         && item.late         !== "00:00") s.lateDays++;
      if (item.earlyLeaving && item.earlyLeaving !== "00:00") s.earlyLeavingDays++;
      s.totalWorkMin += timeToMinutes(item.totalWork);
    });
    return s;
  };

  // ─────────────────────────────────────────
  // Excel Export Function
  // ─────────────────────────────────────────
  const handleExportExcel = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const selectedEmployee = allEmployees.find(
      (emp) => String(emp.id) === String(filters.employee_id)
    );
    const employeeName = selectedEmployee?.employee || "Employee";

    // Prepare data for Excel
    const exportData = data.map((item, index) => ({
      "#": index + 1,
      "Employee": item.employee,
      "Date": formatDate(item.date),
      "Status": formatAttendanceLabel(item.status || "absent"),
      "Log Count": item.logs?.length || 0,
      "Clock In": item.clockIn,
      "Clock Out": item.clockOut,
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
      ["Monthly Attendance Summary"],
      [`Month: ${MONTHS.find(m => m.value === filters.month)?.label} ${filters.year}`],
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
    const filename = `Monthly_Attendance_${employeeName}_${filters.month}_${filters.year}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // ─────────────────────────────────────────
  // Fetch attendance
  // ─────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!filters.employee_id || !filters.month || !filters.year) {
      setError("Please select Employee, Month and Year.");
      return;
    }
    setError(null);
    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const selectedEmployee = allEmployees.find(
        (emp) => String(emp.id) === String(filters.employee_id)
      );
      const monthStart = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
      const monthEnd = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(new Date(Number(filters.year), Number(filters.month), 0).getDate()).padStart(2, "0")}`;

      const res = await api.get("/api/attendance/range", {
        params: {
          employee_id: filters.employee_id,
          from_date: monthStart,
          to_date: monthEnd,
        },
      });

      const apiRecords = Array.isArray(res.data) ? res.data : [];
      const employeeName = apiRecords[0]?.employee || selectedEmployee?.employee || "N/A";
      const mapped = apiRecords.map((record, index) => ({
        id:           index + 1,
        employee:     record.employee || employeeName,
        date:         record.attendance_date,
        status:       normalizeStatus(record.attendance_status),
        clockIn:      record.first_clock_in || "-",
        clockOut:     record.last_clock_out || "-",
        late:         record.time_late || "00:00",
        earlyLeaving: record.early_leaving || "00:00",
        overtime:     record.overtime || "00:00",
        totalWork:    record.total_work || "00:00",
        totalRest:    record.total_rest || "00:00",
        logs:         Array.isArray(record.logs) ? record.logs : [],
      }));

      setData(mapped);
      setSummary(buildSummary(mapped));
    } catch (err) {
      console.error("❌ Monthly attendance error:", err);
      setError(err.response?.data?.error || "Failed to fetch attendance data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ─────────────────────────────────────────
  // Clear
  // ─────────────────────────────────────────
  const handleClear = () => {
    setFilters({
      company_id: "", department_id: "", designation_id: "", employee_id: "",
      month: String(new Date().getMonth() + 1),
      year:  String(currentYear),
    });
    setData([]);
    setHasSearched(false);
    setError(null);
    setSummary({ present: 0, absent: 0, lateDays: 0, earlyLeavingDays: 0, leave: 0, holiday: 0, weekoff: 0, totalWorkMin: 0 });
  };

  // ─────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────
  const totalPages   = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const indexOfFirst = (currentPage - 1) * rowsPerPage;
  const indexOfLast  = indexOfFirst + rowsPerPage;
  const currentRows  = data.slice(indexOfFirst, indexOfLast);

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Monthly Attendance" },
        ]}
      />

      {/* ── FILTER CARD ── */}
      <Card className="mt-4 shadow-sm">
        <Card.Body className="p-4">
          <h4 className="text-center mb-4">Monthly Attendance Report</h4>

          {/* Row 1: Company / Department / Designation */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Company</Form.Label>
              <Form.Select
                value={filters.company_id}
                onChange={(e) => handleFilterChange("company_id", e.target.value)}
              >
                <option value="">All Companies</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={filters.department_id}
                onChange={(e) => handleFilterChange("department_id", e.target.value)}
              >
                <option value="">All Departments</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>{d.department_name}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label>Designation</Form.Label>
              <Form.Select
                value={filters.designation_id}
                onChange={(e) => handleFilterChange("designation_id", e.target.value)}
              >
                <option value="">All Designations</option>
                {filteredDesignations.map((d) => (
                  <option key={d.id} value={d.id}>{d.designation_name}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Row 2: Employee / Month / Year */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Label>Employee *</Form.Label>
              <Form.Select
                value={filters.employee_id}
                onChange={(e) => handleFilterChange("employee_id", e.target.value)}
              >
                <option value="">Select Employee</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee} ({emp.id})
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label>Month *</Form.Label>
              <Form.Select
                value={filters.month}
                onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))}
              >
                <option value="">Select Month</option>
                {MONTHS.map((m) => {
                  // Disable future months
                  const isDisabled = filters.year > String(currentYear) || 
                    (filters.year === String(currentYear) && m.value > String(new Date().getMonth() + 1));
                  return (
                    <option key={m.value} value={m.value} disabled={isDisabled}>
                      {m.label}
                    </option>
                  );
                })}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label>Year *</Form.Label>
              <Form.Control
                type="number"
                min="2000"
                max={String(currentYear)}
                value={filters.year}
                onChange={(e) => {
                  const newYear = e.target.value;
                  setFilters((p) => {
                    const next = { ...p, year: newYear };
                    // If year changed to future, reset month to current month
                    if (newYear > String(currentYear)) {
                      next.month = "";
                    }
                    return next;
                  });
                }}
              />
            </Col>
          </Row>

          {/* Actions */}
          <div className="d-flex justify-content-center align-items-center gap-2">
            <Button
              onClick={handleSearch}
              disabled={loading || !filters.employee_id || !filters.month || !filters.year}
              style={{ backgroundColor: "#7B5CD6", border: "none", padding: "8px 28px" }}
            >
              {loading
                ? <><Spinner animation="border" size="sm" className="me-2" />Searching…</>
                : <><i className="i-Search me-2" />Search</>
              }
            </Button>

            <Button variant="secondary" onClick={handleClear} disabled={loading}>
              Clear
            </Button>
          </div>

          {error && (
            <div className="text-danger text-center mt-3 small">{error}</div>
          )}
        </Card.Body>
      </Card>

      {/* ── SUMMARY CARD ── */}
      {hasSearched && !loading && <SummaryCard summary={summary} />}

      {/* ── RESULTS TABLE ── */}
      <Card className="mt-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title>Attendance Records</Card.Title>
            {hasSearched && data.length > 0 && (
              <Button
                onClick={handleExportExcel}
                style={{ backgroundColor: "#27ae60", border: "none", padding: "8px 16px", fontSize: "14px" }}
              >
                <i className="i-Download me-2" />
                Export to Excel
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" style={{ color: "#7B5CD6" }} />
            </div>
          ) : !hasSearched ? (
            <p className="text-muted text-center py-4">
              Use the filters above and click Search to view attendance records.
            </p>
          ) : data.length === 0 ? (
            <p className="text-center py-4">No records found.</p>
          ) : (
            <>
              <div className="table-responsive">
                <Table bordered hover className="align-middle mb-0">
                  <thead style={{ background: "#cfc7d9" }}>
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Logs</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Late</th>
                      <th>Early Leaving</th>
                      <th>Overtime</th>
                      <th>Total Work</th>
                      <th>Total Rest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((item, index) => (
                      <tr key={item.id}>
                        <td>{indexOfFirst + index + 1}</td>
                        <td className="text-nowrap">{item.employee}</td>
                        <td className="text-nowrap">{formatDate(item.date)}</td>
                        <td>
                          <Badge bg={getBadgeVariant(item.status)}>
                            {formatAttendanceLabel(item.status || "absent")}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            disabled={!item.logs?.length}
                            onClick={() => setLogViewer({
                              show: true,
                              title: `${item.employee} - ${formatDate(item.date)}`,
                              logs: item.logs || [],
                            })}
                          >
                            {item.logs?.length ? `${item.logs.length} Logs` : "No Logs"}
                          </Button>
                        </td>
                        <td>{item.clockIn}</td>
                        <td>{item.clockOut}</td>
                        <td>
                          <span style={{ color: item.late !== "00:00" ? "#ef4444" : "inherit" }}>
                            {item.late}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: item.earlyLeaving !== "00:00" ? "#f59e0b" : "inherit" }}>
                            {item.earlyLeaving}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: item.overtime !== "00:00" ? "#16a34a" : "inherit" }}>
                            {item.overtime}
                          </span>
                        </td>
                        <td>{item.totalWork}</td>
                        <td>{item.totalRest}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

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
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value="all">All</option>
                  </Form.Select>
                </div>

                <span className="text-muted small">
                  {indexOfFirst + 1}–{Math.min(indexOfLast, data.length)} of {data.length}
                </span>

                <div className="d-flex gap-1">
                  <Button variant="secondary" size="sm" disabled={currentPage === 1}          onClick={() => setCurrentPage(1)}>⏮</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === 1}          onClick={() => setCurrentPage((p) => p - 1)}>◀</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === totalPages}  onClick={() => setCurrentPage((p) => p + 1)}>▶</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === totalPages}  onClick={() => setCurrentPage(totalPages)}>⏭</Button>
                </div>
              </div>
            </>
          )}
        </Card.Body>
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