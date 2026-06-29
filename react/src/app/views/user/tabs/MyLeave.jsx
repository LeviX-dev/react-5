import { useState, useEffect } from "react";
import { Row, Col, Card, Table, Badge, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
const STATUS_VARIANT = {
  Approved: "success",
  Rejected: "danger",
  Pending:  "warning",
};

const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const diff = new Date(end) - new Date(start);
  return diff < 0 ? 0 : Math.round(diff / 86_400_000) + 1;
};

const formatDisplayDate = (value) => {
  if (!value) return "—";

  const rawValue = String(value).trim();
  const dateOnly = rawValue.includes("T") ? rawValue.split("T")[0] : rawValue;
  const parsedDate = /^\d{2}-\d{2}-\d{4}$/.test(dateOnly)
    ? (() => {
        const [day, month, year] = dateOnly.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day));
      })()
    : new Date(dateOnly);

  if (Number.isNaN(parsedDate.getTime())) return dateOnly;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const today = () => new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────────────────
export default function MyLeave({ employee }) {
  // ── data state ──────────────────────────────────────────────────────────────
  const [policies,        setPolicies]        = useState([]);
  const [selectedPolicy,  setSelectedPolicy]  = useState(null);
  const [appliedPolicyId, setAppliedPolicyId] = useState(null);
  const [leaveData,       setLeaveData]       = useState([]);
  const [loadingLeaves,   setLoadingLeaves]   = useState(false);

  // ── remaining leave state ────────────────────────────────────────────────
  const [remainingRows,    setRemainingRows]    = useState([]);
  const [loadingRemaining, setLoadingRemaining] = useState(false);

  // ── view ────────────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState("requests"); // "requests" | "remaining" | "policy"

  // ── apply leave modal ────────────────────────────────────────────────────────
  const [showModal,   setShowModal]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitMsg,   setSubmitMsg]   = useState(null);   // { type, text }
  const [form, setForm] = useState({
    leave_type:  "",
    start_date:  today(),
    end_date:    today(),
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchPolicies = async () => {
    try {
      const res = await api.get("/api/leave-policy/list");
      setPolicies(res.data?.data || []);
    } catch (err) {
      console.error("fetchPolicies:", err);
    }
  };

  const fetchLeaves = async () => {
    if (!employee?.id) return;
    setLoadingLeaves(true);
    try {
      const res = await api.get("/api/leave/list", {
        params: { employee_id: employee.id },
      });
      setLeaveData(res.data?.data || []);
    } catch (err) {
      console.error("fetchLeaves:", err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // ── fetch remaining leave (merged from MyRemainingLeave.jsx) ──────────────
  const fetchRemaining = async () => {
    if (!employee?.id) return;
    setLoadingRemaining(true);
    try {
      const res = await api.get("/api/leave/remaining", {
        params: { employee_id: employee.id, policy_id: employee.policy_id },
      });
      setRemainingRows(res.data?.success ? res.data.data || [] : []);
    } catch (err) {
      console.error("Remaining leave error:", err);
      setRemainingRows([]);
    } finally {
      setLoadingRemaining(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchLeaves();
    fetchRemaining();
    if (employee?.leave_policy_id) setAppliedPolicyId(employee.leave_policy_id);
  }, [employee]);

  useEffect(() => {
    if (appliedPolicyId && policies.length) {
      const found = policies.find((p) => p.id === appliedPolicyId);
      if (found) setSelectedPolicy(found);
    }
  }, [appliedPolicyId, policies]);

  // ── switch to remaining tab and (re)fetch if empty ────────────────────────
  const handleRemainingTabClick = () => {
    setActiveView("remaining");
    if (remainingRows.length === 0) fetchRemaining();
  };

  // ── leave types available to the employee ─────────────────────────────────
  const leaveTypes = selectedPolicy?.leaves || [];

  // ── form handlers ─────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.leave_type)  errs.leave_type  = "Please select a leave type";
    if (!form.start_date)  errs.start_date  = "Start date is required";
    if (!form.end_date)    errs.end_date    = "End date is required";
    if (form.end_date < form.start_date) errs.end_date = "End date cannot be before start date";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const total_days = daysBetween(form.start_date, form.end_date);

      await api.post("/api/leave/apply", {
        employee_id:  employee.id,
        leave_type:   form.leave_type,
        start_date:   form.start_date,
        end_date:     form.end_date,
        total_days,
        description:  form.description,
        policy_id:    employee.leave_policy_id || appliedPolicyId,
      });

      setSubmitMsg({ type: "success", text: "Leave request submitted successfully!" });
      setForm({ leave_type: "", start_date: today(), end_date: today(), description: "" });

      // refresh both lists after applying leave
      await fetchLeaves();
      await fetchRemaining();

      setTimeout(() => {
        setShowModal(false);
        setSubmitMsg(null);
      }, 1800);
    } catch (err) {
      console.error("Apply leave error:", err);
      const msg = err.response?.data?.message || "Failed to submit leave request. Please try again.";
      setSubmitMsg({ type: "danger", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (submitting) return;
    setShowModal(false);
    setForm({ leave_type: "", start_date: today(), end_date: today(), description: "" });
    setFormErrors({});
    setSubmitMsg(null);
  };

  const totalDays = daysBetween(form.start_date, form.end_date);

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "My Leaves" },
        ]}
      />

      {/* ── Header bar ── */}
      <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex gap-2">
              <Button
                variant={activeView === "requests" ? "primary" : "outline-secondary"}
                size="sm"
                style={activeView === "requests" ? { backgroundColor: "#663399", border: "none" } : {}}
                onClick={() => setActiveView("requests")}
              >
                My Requests
              </Button>

              {/* ── Remaining Leave tab (merged) ── */}
              <Button
                variant={activeView === "remaining" ? "primary" : "outline-secondary"}
                size="sm"
                style={activeView === "remaining" ? { backgroundColor: "#663399", border: "none" } : {}}
                onClick={handleRemainingTabClick}
              >
                Remaining Leave
              </Button>

              <Button
                variant={activeView === "policy" ? "primary" : "outline-secondary"}
                size="sm"
                style={activeView === "policy" ? { backgroundColor: "#663399", border: "none" } : {}}
                onClick={() => setActiveView("policy")}
              >
                Leave Structure
              </Button>
            </div>

            {/* Apply Leave button */}
            <Button
              style={{ backgroundColor: "#663399", border: "none" }}
              size="sm"
              onClick={() => setShowModal(true)}
            >
              + Apply Leave
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ── Remaining Leave view (merged from MyRemainingLeave.jsx) ── */}
      {activeView === "remaining" && (
        <Card className="shadow-sm border-0" style={{ borderRadius: 12 }}>
          <Card.Body>
            <h6 className="mb-3 fw-semibold" style={{ color: "#663399" }}>
              📊 My Remaining Leave
            </h6>

            {loadingRemaining ? (
              <div className="text-center py-4">
                <Spinner animation="border" style={{ color: "#663399" }} />
              </div>
            ) : remainingRows.length === 0 ? (
              <p className="text-center text-muted py-4">No remaining leave data found.</p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover size="sm" className="mb-0">
                  <thead style={{ backgroundColor: "#f0e8f8" }}>
                    <tr>
                      <th style={{ color: "#663399" }}>#</th>
                      <th style={{ color: "#663399" }}>Leave Type</th>
                      <th style={{ color: "#663399" }}>Allocated Days</th>
                      <th style={{ color: "#663399" }}>Used Days</th>
                      <th style={{ color: "#663399" }}>Remaining Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remainingRows.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{row.leave_type}</td>
                        <td>{row.allocated_days}</td>
                        <td>{row.used_days}</td>
                        <td>
                          <Badge
                            bg={row.remaining_days > 0 ? "success" : "danger"}
                            pill
                          >
                            {row.remaining_days}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── Leave Structure view ── */}
      {activeView === "policy" && (
        <Card className="shadow-sm border-0" style={{ borderRadius: 12 }}>
          <Card.Body>
            <h6 className="mb-3 fw-semibold" style={{ color: "#663399" }}>
              📋 Leave Structure
              {selectedPolicy && (
                <Badge className="ms-2" style={{ backgroundColor: "#663399", fontWeight: 400 }}>
                  {selectedPolicy.title}
                </Badge>
              )}
            </h6>

            {!selectedPolicy ? (
              <p className="text-center text-muted py-4">No leave policy assigned. Please contact HR.</p>
            ) : leaveTypes.length === 0 ? (
              <p className="text-center text-muted py-4">No leave types defined in your policy.</p>
            ) : (
              <Row>
                {leaveTypes.map((leave, i) => (
                  <Col md={4} sm={6} key={i} className="mb-3">
                    <Card
                      className="text-center border-0 h-100"
                      style={{
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #f5f0ff, #ede4f7)",
                      }}
                    >
                      <Card.Body className="py-3">
                        <h6 className="fw-semibold mb-1" style={{ color: "#663399" }}>
                          {leave.type}
                        </h6>
                        <h3 className="mb-0 fw-bold">{leave.days}</h3>
                        <small className="text-muted">days / year</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── My Requests view ── */}
      {activeView === "requests" && (
        <Card className="shadow-sm border-0" style={{ borderRadius: 12 }}>
          <Card.Body>
            <h6 className="mb-3 fw-semibold" style={{ color: "#663399" }}>
              📝 My Leave Requests
            </h6>

            {loadingLeaves ? (
              <div className="text-center py-4">
                <Spinner animation="border" style={{ color: "#663399" }} />
              </div>
            ) : leaveData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="i-Calendar-4" style={{ fontSize: 40, display: "block", marginBottom: 8 }} />
                No leave requests found. Click <strong>"Apply Leave"</strong> to submit one.
              </div>
            ) : (
              <div className="table-responsive">
                <Table bordered hover size="sm" className="mb-0">
                  <thead style={{ backgroundColor: "#f0e8f8" }}>
                    <tr>
                      <th style={{ color: "#663399" }}>#</th>
                      <th style={{ color: "#663399" }}>Leave Type</th>
                      <th style={{ color: "#663399" }}>From</th>
                      <th style={{ color: "#663399" }}>To</th>
                      <th style={{ color: "#663399" }}>Days</th>
                      <th style={{ color: "#663399" }}>Reason</th>
                      <th style={{ color: "#663399" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveData.map((l, i) => (
                      <tr key={l.id || i}>
                        <td>{i + 1}</td>
                        <td>{l.leave_type}</td>
                        {/* Bug fix: was rendering start_date twice */}
                        <td>{formatDisplayDate(l.start_date)}</td>
                        <td>{formatDisplayDate(l.end_date)}</td>
                        <td>{l.total_days}</td>
                        <td
                          style={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={l.description}
                        >
                          {l.description || "—"}
                        </td>
                        <td>
                          <Badge bg={STATUS_VARIANT[l.status] || "secondary"} pill>
                            {l.status || "Pending"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── Apply Leave Modal ── */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header
          closeButton
          style={{ background: "linear-gradient(135deg, #663399, #9b59b6)", color: "#fff" }}
        >
          <Modal.Title style={{ fontSize: "1rem" }}>📅 Apply for Leave</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {submitMsg && (
            <Alert variant={submitMsg.type} className="py-2">
              {submitMsg.text}
            </Alert>
          )}

          {/* Leave Type */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Leave Type <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="leave_type"
              value={form.leave_type}
              onChange={handleFormChange}
              isInvalid={!!formErrors.leave_type}
              disabled={submitting}
            >
              <option value="">— Select leave type —</option>
              {leaveTypes.length > 0 ? (
                leaveTypes.map((l, i) => (
                  <option key={i} value={l.type}>
                    {l.type} ({l.days} days/year)
                  </option>
                ))
              ) : (
                <option disabled>No leave types available</option>
              )}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{formErrors.leave_type}</Form.Control.Feedback>
          </Form.Group>

          {/* Date Range */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Start Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  min={today()}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.start_date}
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{formErrors.start_date}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  End Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  min={form.start_date || today()}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.end_date}
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{formErrors.end_date}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Day count indicator */}
          {totalDays > 0 && (
            <div
              className="mb-3 text-center py-2 rounded"
              style={{ background: "#f0e8f8", color: "#663399", fontWeight: 600 }}
            >
              📅 {totalDays} day{totalDays > 1 ? "s" : ""} requested
            </div>
          )}

          {/* Reason */}
          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold">Reason / Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Optional — briefly describe the reason for leave"
              disabled={submitting}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            onClick={handleModalClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#663399", border: "none" }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting…
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}