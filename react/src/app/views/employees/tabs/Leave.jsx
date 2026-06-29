import React, { useState, useEffect } from "react";
import { Row, Col, Card, Modal, Button, Form, Table, Spinner, Badge } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

export default function LeaveDashboard({ employee }) {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [leaveData, setLeaveData] = useState([]);

  const [policyLeaveTypes, setPolicyLeaveTypes] = useState([]);
  const [appliedPolicyId, setAppliedPolicyId] = useState(null);

  // ── NEW: remaining leave state ──────────────────────────────────────────────
  const [remainingLeave, setRemainingLeave] = useState([]);
  const [remainingLoading, setRemainingLoading] = useState(false);
  // ────────────────────────────────────────────────────────────────────────────

  const [viewMode, setViewMode] = useState("table");

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    description: "",
    policyApplied: "",
  });

  // ================= FETCH =================
  const fetchPolicies = async () => {
    try {
      const res = await api.get("/api/leave-policy/list");
      setPolicies(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/api/leave/list", {
        params: { employee_id: employee?.id },
      });
      setLeaveData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ── NEW: fetch remaining leave balance ─────────────────────────────────────
  const fetchRemaining = async () => {
    try {
      if (!employee?.id) return;

      setRemainingLoading(true);

      const res = await api.get("/api/leave/remaining", {
        params: {
          employee_id: employee.id,
          policy_id: employee.policy_id,
        },
      });

      if (res.data?.success) {
        setRemainingLeave(res.data.data || []);
      } else {
        setRemainingLeave([]);
      }
    } catch (err) {
      console.error("❌ Remaining leave API Error:", err);
      setRemainingLeave([]);
    } finally {
      setRemainingLoading(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  const getUsedLeaves = (leaveType) => {
    return leaveData
      .filter((l) => l.leave_type === leaveType && l.status !== "rejected")
      .reduce((sum, l) => sum + Number(l.total_days || 0), 0);
  };

  const getAllowedDays = (type) => {
    const policy = policies.find((p) => p.id === appliedPolicyId);
    if (!policy) return 0;
    const leave = policy.leaves?.find((l) => l.type === type);
    return leave?.days || 0;
  };

  // ── Auto-set leave types when appliedPolicyId / policies change ─────────────
  useEffect(() => {
    if (appliedPolicyId && policies.length) {
      const selected = policies.find((p) => p.id === appliedPolicyId);
      if (selected) {
        setPolicyLeaveTypes(selected.leaves || []);
        setForm((prev) => ({ ...prev, policyApplied: appliedPolicyId }));
      }
    }
  }, [appliedPolicyId, policies]);

  // ── Initial load + when employee changes ────────────────────────────────────
  useEffect(() => {
    fetchPolicies();
    fetchLeaves();
    fetchRemaining(); // ← NEW

    if (employee?.leave_policy_id) {
      setAppliedPolicyId(employee.leave_policy_id);
    }
  }, [employee]);

  // ── NEW: refresh remaining leave when a leave event fires ──────────────────
  useEffect(() => {
    const refresh = () => {
      fetchLeaves();
      fetchRemaining();
    };
    window.addEventListener("leaveUpdated", refresh);
    return () => window.removeEventListener("leaveUpdated", refresh);
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "policyApplied") {
      const selected = policies.find((p) => p.id === Number(value));
      setPolicyLeaveTypes(selected ? selected.leaves || [] : []);
      updatedForm.leaveType = "";
    }

    if (name === "startDate" || name === "endDate") {
      const { startDate, endDate } = updatedForm;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end >= start) {
          const diffDays =
            Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          updatedForm.totalDays = diffDays;
        } else {
          updatedForm.totalDays = "";
        }
      }
    }

    setForm(updatedForm);
  };

  // ================= APPLY LEAVE =================
  const handleAdd = async () => {
    try {
      if (!employee?.id) { alert("Employee not found ❌"); return; }
      if (!form.leaveType) { alert("Please select leave type ❌"); return; }
      if (!form.startDate || !form.endDate) { alert("Select dates ❌"); return; }

      const allowed = getAllowedDays(form.leaveType);
      const used = getUsedLeaves(form.leaveType);
      const requested = Number(form.totalDays);
      const remaining = allowed - used;

      if (requested > remaining) {
        alert(`Not allowed ❌\nRemaining ${form.leaveType} leaves: ${remaining}`);
        return;
      }

      const payload = {
        start_date: form.startDate,
        end_date: form.endDate,
        total_days: requested,
        description: form.description || "",
        employee_id: employee.id,
        policy_id: appliedPolicyId,
        leave_type: form.leaveType,
      };

      console.log(payload);
      await api.post("/api/leave/apply", payload);
      alert("Leave Applied Successfully ✅");

      setShowModal(false);
      setForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        totalDays: "",
        description: "",
        policyApplied: appliedPolicyId,
      });
      setPolicyLeaveTypes([]);

      fetchLeaves();
      fetchRemaining(); // ← NEW: refresh balances after applying
      window.dispatchEvent(new Event("leaveUpdated"));
    } catch (err) {
      console.error(err);
      alert("Error applying leave ❌");
    }
  };

  // ================= SAVE POLICY =================
  const handleSaveLeavePolicy = async () => {
    try {
      if (!employee?.id) { alert("Employee not found ❌"); return; }
      if (!selectedPolicy) { alert("Select policy first ❌"); return; }

      await api.post("/api/apply-leave-policy", {
        employee_id: employee.id,
        policy_id: selectedPolicy.id,
        policy_name: selectedPolicy.title,
      });

      setAppliedPolicyId(selectedPolicy.id);
      alert("Leave Policy Saved Successfully ✅");
      fetchRemaining(); // ← NEW: policy changed, refresh balances
    } catch (err) {
      console.error(err);
      alert("Error saving leave policy ❌");
    }
  };

  // ================= HELPERS =================
  const getStatusBadge = (status) => {
    const colorMap = { approved: "success", rejected: "danger", pending: "warning" };
    return (
      <Badge bg={colorMap[status] || "secondary"} style={{ fontSize: "11px" }}>
        {status}
      </Badge>
    );
  };

  // ================= UI =================
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Leave Management" },
        ]}
      />

      {/* ── HEADER ACTIONS ── */}
      <Card className="p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Leave Dashboard</h5>
          <div className="d-flex gap-2">
            {viewMode === "table" && (
              <Button onClick={() => setShowModal(true)}>Apply Leave</Button>
            )}
            <Button
              variant="dark"
              onClick={() => setViewMode(viewMode === "table" ? "policy" : "table")}
            >
              {viewMode === "table" ? "Manage Leave" : "Back"}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── POLICY VIEW ── */}
      {viewMode === "policy" && (
        <Card className="p-2 shadow-sm">
          <Row className="m-0">
            <Col md={3} className="p-0">
              <Card className="p-2 h-100">
                <h6>Policies</h6>
                {policies.map((item) => {
                  const isApplied = appliedPolicyId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedPolicy(item)}
                      className="p-2 mb-2 border rounded d-flex justify-content-between align-items-center"
                      style={{
                        cursor: "pointer",
                        background: isApplied
                          ? "#6f42c1"
                          : selectedPolicy?.id === item.id
                          ? "#d6c4f0"
                          : "#fff",
                        color: isApplied ? "#fff" : "#000",
                      }}
                    >
                      <span>{item.title}</span>
                      {isApplied && (
                        <span style={{ fontSize: "12px", fontWeight: 500 }}>✅ Applied</span>
                      )}
                    </div>
                  );
                })}
              </Card>
            </Col>

            <Col md={9} className="p-3">
              <Card className="p-3">
                {!selectedPolicy ? (
                  <h6 className="text-center">Select a Policy</h6>
                ) : (
                  <>
                    <h5 style={{ color: "#663399" }}>{selectedPolicy.title}</h5>
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPolicy?.leaves?.length > 0 ? (
                          selectedPolicy.leaves.map((l, i) => (
                            <tr key={i}>
                              <td>{l.type}</td>
                              <td>{l.days}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center">No Leaves Defined</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    <div className="d-flex justify-content-end mb-2">
                      <Button
                        style={{ backgroundColor: "#28a745", borderColor: "#28a745", fontWeight: 500 }}
                        disabled={!selectedPolicy || appliedPolicyId === selectedPolicy?.id}
                        onClick={handleSaveLeavePolicy}
                      >
                        Save Policy
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === "table" && (
        <>
          {/* ════════ REMAINING LEAVE SUMMARY (merged from RemainingLeave.jsx) ════════ */}
          <Card className="p-3 mb-3">
            <h6 className="mb-3" style={{ color: "#663399", fontWeight: 600 }}>
              Remaining Leave Balance
            </h6>

            {remainingLoading && (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" />
                <span className="ms-2 text-muted">Loading balances…</span>
              </div>
            )}

            {!remainingLoading && remainingLeave.length > 0 && (
              <Row className="g-2">
                {remainingLeave.map((item, i) => (
                  <Col key={i} xs={6} md={4} lg={3}>
                    <Card
                      className="text-center p-2 h-100"
                      style={{ border: "1px solid #e0d6f5", borderRadius: "8px" }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#6f42c1",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {item.leave_type}
                      </div>

                      <div className="d-flex justify-content-around">
                        <div>
                          <div style={{ fontSize: "18px", fontWeight: 700, color: "#333" }}>
                            {item.allocated_days}
                          </div>
                          <div style={{ fontSize: "10px", color: "#888" }}>Allocated</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "18px", fontWeight: 700, color: "#e67e22" }}>
                            {item.used_days}
                          </div>
                          <div style={{ fontSize: "10px", color: "#888" }}>Used</div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: 700,
                              color: item.remaining_days > 0 ? "#28a745" : "#dc3545",
                            }}
                          >
                            {item.remaining_days}
                          </div>
                          <div style={{ fontSize: "10px", color: "#888" }}>Remaining</div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {!remainingLoading && !employee?.id && (
              <p className="text-center text-muted mb-0">Select an employee to view leave balance</p>
            )}

            {!remainingLoading && employee?.id && remainingLeave.length === 0 && (
              <p className="text-center text-muted mb-0">No remaining leave data found</p>
            )}
          </Card>
          {/* ═══════════════════════════════════════════════════════════════════════════ */}

          {/* ── APPLIED LEAVES TABLE ── */}
          <Card className="p-3">
            <h6 className="mb-3">Applied Leaves</h6>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Type</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Start Date</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>End Date</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Days</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Description</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveData.length > 0 ? (
                  leaveData.map((l) => (
                    <tr key={l.id}>
                      <td>{l.leave_type}</td>
                      <td>{l.start_date}</td>
                      <td>{l.end_date}</td>
                      <td>{l.total_days}</td>
                      <td>{l.description}</td>
                      <td>{getStatusBadge(l.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No Leaves Added</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </>
      )}

      {/* ── APPLY LEAVE MODAL ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: "1px solid #eee" }}>
          <Modal.Title style={{ fontWeight: 600 }}>Apply Leave</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "25px 30px" }}>
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 500 }}>Leave Type *</Form.Label>
                  <Form.Select
                    name="leaveType"
                    value={form.leaveType}
                    onChange={handleChange}
                    disabled={!policyLeaveTypes.length}
                    style={{ height: "45px" }}
                  >
                    <option value="">Select Type</option>
                    {policyLeaveTypes.map((l, i) => (
                      <option key={i} value={l.type}>
                        {l.type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 500 }}>Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    style={{ height: "45px" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 500 }}>End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    style={{ height: "45px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 500 }}>Total Days</Form.Label>
                  <Form.Control
                    value={form.totalDays}
                    readOnly
                    style={{ height: "45px", backgroundColor: "#f5f5f5" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 500 }}>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    placeholder="Enter description"
                    value={form.description}
                    onChange={handleChange}
                    style={{ resize: "none" }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ borderTop: "1px solid #eee" }}>
          <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1", padding: "6px 18px", fontWeight: 500 }}
            onClick={handleAdd}
          >
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}