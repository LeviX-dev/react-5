import { useEffect, useState, useCallback } from "react";
import {
  Row, Col, Card, Button, Badge, Modal,
  Form, Table, Spinner,
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const STATUS_META = {
  pending:  { bg: "warning",  label: "Pending"  },
  approved: { bg: "success",  label: "Approved" },
  rejected: { bg: "danger",   label: "Rejected" },
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AttendanceRegularization() {
  // ── master data ──
  const [employees,   setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);

  // ── filters ──
  const [filters, setFilters] = useState({
    employee_id:   "",
    department_id: "",
    from_date:     "",
    to_date:       todayStr(),
    status:        "",
  });

  // ── table ──
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ── pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── modal ──
  const [showModal,   setShowModal]   = useState(false);
  const [modalMode,   setModalMode]   = useState("view"); // "view" | "edit" | "add"
  const [selected,    setSelected]    = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState({
    employee_id: "", date: todayStr(),
    clock_in: "", clock_out: "", reason: "", status: "pending",
  });

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  // ─────────────────────────────────────────
  // Load master data
  // ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          api.get("/api/employees"),
          api.get("/api/departments"),
        ]);
        const empList = Array.isArray(empRes.data) ? empRes.data : empRes.data?.data || [];
        setEmployees(empList);
        setDepartments(deptRes.data.departments || []);
      } catch (err) {
        console.error("❌ Master data error:", err);
      }
    };
    load();
  }, []);

  // ─────────────────────────────────────────
  // Fetch regularization requests
  // ─────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); setHasSearched(true); setCurrentPage(1); }
    setError(null);
    try {
      const params = {};
      if (filters.employee_id)   params.employee_id   = filters.employee_id;
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.from_date)     params.from_date     = filters.from_date;
      if (filters.to_date)       params.to_date       = filters.to_date;
      if (filters.status)        params.status        = filters.status;
      // If non-admin, force own employee_id
      if (!isAdmin) params.employee_id = user.employee_id;

      const res  = await api.get("/api/attendance/regularization", { params });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setData(list.map((item, i) => ({ ...item, _idx: i })));
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.response?.data?.error || "Failed to fetch records.");
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters, isAdmin, user.employee_id]);

  // ─────────────────────────────────────────
  // Open modal helpers
  // ─────────────────────────────────────────
  const openAdd = () => {
    setModalMode("add");
    setSelected(null);
    setForm({
      employee_id: isAdmin ? "" : String(user.employee_id),
      date: todayStr(), clock_in: "", clock_out: "", reason: "", status: "pending",
    });
    setShowModal(true);
  };

  const openView = (row) => {
    setModalMode("view");
    setSelected(row);
    setForm({
      employee_id: String(row.employee_id),
      date:        row.date        || "",
      clock_in:    row.clock_in    || "",
      clock_out:   row.clock_out   || "",
      reason:      row.reason      || "",
      status:      row.status      || "pending",
    });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setModalMode("edit");
    setSelected(row);
    setForm({
      employee_id: String(row.employee_id),
      date:        row.date        || "",
      clock_in:    row.clock_in    || "",
      clock_out:   row.clock_out   || "",
      reason:      row.reason      || "",
      status:      row.status      || "pending",
    });
    setShowModal(true);
  };

  // ─────────────────────────────────────────
  // Quick approve / reject (inline, admin only)
  // ─────────────────────────────────────────
  const handleQuickStatus = async (row, newStatus) => {
    try {
      await api.put(`/api/attendance/regularization/${row.id}`, { status: newStatus });
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.error || "Action failed.");
    }
  };

  // ─────────────────────────────────────────
  // Save modal (add / edit)
  // ─────────────────────────────────────────
  const handleSave = async () => {
    if (!form.employee_id || !form.date || !form.reason.trim()) {
      alert("Employee, Date and Reason are required.");
      return;
    }
    setSaving(true);
    try {
      if (modalMode === "add") {
        await api.post("/api/attendance/regularization", form);
      } else {
        await api.put(`/api/attendance/regularization/${selected.id}`, form);
      }
      setShowModal(false);
      fetchData(true);
      alert(modalMode === "add" ? "Request submitted ✅" : "Updated ✅");
    } catch (err) {
      alert(err.response?.data?.error || "Save failed ❌");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────
  // Delete (admin only)
  // ─────────────────────────────────────────
  const handleDelete = async (row) => {
    if (!window.confirm(`Delete regularization request for ${row.employee}?`)) return;
    try {
      await api.delete(`/api/attendance/regularization/${row.id}`);
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed.");
    }
  };

  // ─────────────────────────────────────────
  // Clear filters
  // ─────────────────────────────────────────
  const handleClear = () => {
    setFilters({ employee_id: "", department_id: "", from_date: "", to_date: todayStr(), status: "" });
    setData([]);
    setHasSearched(false);
    setError(null);
  };

  // ─────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────
  const totalPages   = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const indexOfFirst = (currentPage - 1) * rowsPerPage;
  const currentRows  = data.slice(indexOfFirst, indexOfFirst + rowsPerPage);

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Attendance" },
          { name: "Regularization" },
        ]}
      />

      {/* ── FILTER CARD ── */}
      <Card className="mt-4 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Attendance Regularization</h5>
            <Button
              style={{ backgroundColor: "#663399", border: "none" }}
              onClick={openAdd}
            >
              <i className="i-Add me-1" /> New Request
            </Button>
          </div>

          <Row className="mb-3">
            {isAdmin && (
              <>
                <Col md={3} className="mb-2">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={filters.department_id}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, department_id: e.target.value, employee_id: "" }))
                    }
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.department_name}</option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3} className="mb-2">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    value={filters.employee_id}
                    onChange={(e) => setFilters((p) => ({ ...p, employee_id: e.target.value }))}
                  >
                    <option value="">All Employees</option>
                    {employees
                      .filter((e) =>
                        !filters.department_id ||
                        String(e.department_id) === String(filters.department_id)
                      )
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.employee} ({e.id})
                        </option>
                      ))}
                  </Form.Select>
                </Col>
              </>
            )}

            <Col md={isAdmin ? 2 : 3} className="mb-2">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters((p) => ({ ...p, from_date: e.target.value }))}
              />
            </Col>

            <Col md={isAdmin ? 2 : 3} className="mb-2">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters((p) => ({ ...p, to_date: e.target.value }))}
              />
            </Col>

            <Col md={isAdmin ? 2 : 3} className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button
              onClick={() => fetchData(false)}
              disabled={loading}
              style={{ backgroundColor: "#7B5CD6", border: "none", padding: "8px 24px" }}
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

          {error && <div className="text-danger small mt-2">{error}</div>}
        </Card.Body>
      </Card>

      {/* ── TABLE CARD ── */}
      <Card className="mt-4 shadow-sm">
        <Card.Body>
          <Card.Title>Regularization Requests</Card.Title>

          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" style={{ color: "#7B5CD6" }} />
            </div>
          ) : !hasSearched ? (
            <p className="text-muted text-center py-4">
              Use the filters above and click Search to view requests.
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
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row, index) => {
                      const meta = STATUS_META[row.status?.toLowerCase()] || STATUS_META.pending;
                      const isPending  = row.status?.toLowerCase() === "pending";
                      const canEdit    = isAdmin || (String(row.employee_id) === String(user.employee_id) && isPending);
                      const canDelete  = isAdmin;

                      return (
                        <tr key={row.id || index}>
                          <td>{indexOfFirst + index + 1}</td>
                          <td className="text-nowrap">{row.employee || row.employee_name || "-"}</td>
                          <td className="text-nowrap">{formatDate(row.date)}</td>
                          <td>{row.clock_in  || "-"}</td>
                          <td>{row.clock_out || "-"}</td>
                          <td style={{ maxWidth: 220 }}>
                            <span
                              title={row.reason}
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {row.reason || "-"}
                            </span>
                          </td>
                          <td>
                            <Badge bg={meta.bg}>{meta.label}</Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1 justify-content-center flex-wrap">
                              {/* VIEW */}
                              <Button
                                size="sm"
                                style={{ background: "#6b7280", border: "none", minWidth: 32 }}
                                title="View"
                                onClick={() => openView(row)}
                              >
                                <i className="i-Eye" />
                              </Button>

                              {/* EDIT */}
                              {canEdit && (
                                <Button
                                  size="sm"
                                  style={{ background: "#3b82f6", border: "none", minWidth: 32 }}
                                  title="Edit"
                                  onClick={() => openEdit(row)}
                                >
                                  <i className="i-Edit" />
                                </Button>
                              )}

                              {/* APPROVE / REJECT (admin inline) */}
                              {isAdmin && isPending && (
                                <>
                                  <Button
                                    size="sm"
                                    style={{ background: "#16a34a", border: "none", minWidth: 32 }}
                                    title="Approve"
                                    onClick={() => handleQuickStatus(row, "approved")}
                                  >
                                    <i className="i-Yes" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    style={{ background: "#ef4444", border: "none", minWidth: 32 }}
                                    title="Reject"
                                    onClick={() => handleQuickStatus(row, "rejected")}
                                  >
                                    <i className="i-Close-Window" />
                                  </Button>
                                </>
                              )}

                              {/* DELETE */}
                              {canDelete && (
                                <Button
                                  size="sm"
                                  style={{ background: "#c4302b", border: "none", minWidth: 32 }}
                                  title="Delete"
                                  onClick={() => handleDelete(row)}
                                >
                                  <i className="i-Trash" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                    <option value="all">All</option>
                  </Form.Select>
                </div>

                <span className="text-muted small">
                  {indexOfFirst + 1}–{Math.min(indexOfFirst + rowsPerPage, data.length)} of {data.length}
                </span>

                <div className="d-flex gap-1">
                  <Button variant="secondary" size="sm" disabled={currentPage === 1}         onClick={() => setCurrentPage(1)}>⏮</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === 1}         onClick={() => setCurrentPage((p) => p - 1)}>◀</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>▶</Button>
                  <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>⏭</Button>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* ═══════════════════════ MODAL ═══════════════════════ */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: "#663399", color: "#fff" }}>
          <Modal.Title>
            {modalMode === "add"  && "New Regularization Request"}
            {modalMode === "edit" && "Edit Request"}
            {modalMode === "view" && "View Request"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            {/* Employee */}
            <Col md={6} className="mb-3">
              <Form.Label>Employee *</Form.Label>
              {isAdmin && modalMode !== "view" ? (
                <Form.Select
                  value={form.employee_id}
                  onChange={(e) => setForm((p) => ({ ...p, employee_id: e.target.value }))}
                  disabled={modalMode === "view"}
                >
                  <option value="">Select Employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employee} ({e.id})
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  value={
                    modalMode === "view"
                      ? (selected?.employee || selected?.employee_name || "-")
                      : (employees.find((e) => String(e.id) === String(user.employee_id))?.employee || "-")
                  }
                  disabled
                />
              )}
            </Col>

            {/* Date */}
            <Col md={6} className="mb-3">
              <Form.Label>Date *</Form.Label>
              <Form.Control
                type="date"
                value={form.date}
                disabled={modalMode === "view"}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </Col>

            {/* Clock In */}
            <Col md={6} className="mb-3">
              <Form.Label>Clock In (requested)</Form.Label>
              <Form.Control
                type="time"
                value={form.clock_in}
                disabled={modalMode === "view"}
                onChange={(e) => setForm((p) => ({ ...p, clock_in: e.target.value }))}
              />
            </Col>

            {/* Clock Out */}
            <Col md={6} className="mb-3">
              <Form.Label>Clock Out (requested)</Form.Label>
              <Form.Control
                type="time"
                value={form.clock_out}
                disabled={modalMode === "view"}
                onChange={(e) => setForm((p) => ({ ...p, clock_out: e.target.value }))}
              />
            </Col>

            {/* Reason */}
            <Col md={12} className="mb-3">
              <Form.Label>Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe the reason for regularization…"
                value={form.reason}
                disabled={modalMode === "view"}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              />
            </Col>

            {/* Status — admin only, edit mode */}
            {isAdmin && modalMode === "edit" && (
              <Col md={6} className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Col>
            )}

            {/* Status display — view mode */}
            {modalMode === "view" && (
              <Col md={6} className="mb-3">
                <Form.Label>Status</Form.Label>
                <div className="mt-1">
                  <Badge bg={STATUS_META[form.status?.toLowerCase()]?.bg || "warning"} style={{ fontSize: 14 }}>
                    {STATUS_META[form.status?.toLowerCase()]?.label || "Pending"}
                  </Badge>
                </div>
              </Col>
            )}
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>

          {modalMode !== "view" && (
            <Button
              disabled={saving}
              style={{ backgroundColor: "#663399", border: "none", minWidth: 100 }}
              onClick={handleSave}
            >
              {saving
                ? <><Spinner animation="border" size="sm" className="me-2" />Saving…</>
                : "Save"
              }
            </Button>
          )}

          {/* Admin approve/reject from modal */}
          {isAdmin && modalMode === "view" && selected?.status?.toLowerCase() === "pending" && (
            <>
              <Button
                style={{ background: "#16a34a", border: "none" }}
                onClick={() => { handleQuickStatus(selected, "approved"); setShowModal(false); }}
              >
                ✓ Approve
              </Button>
              <Button
                style={{ background: "#ef4444", border: "none" }}
                onClick={() => { handleQuickStatus(selected, "rejected"); setShowModal(false); }}
              >
                ✕ Reject
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </section>
  );
}