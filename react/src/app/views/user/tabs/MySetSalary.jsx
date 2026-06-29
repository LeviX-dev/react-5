import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─── helpers ─────────────────────────────────────────────────────────────────
const toNum = (v) => Number(v || 0);

const fmt = (n) =>
  `₹ ${toNum(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const normaliseRows = (rows, defaults) =>
  rows.length
    ? rows.map((r) => ({
        ...r,
        value: toNum(r.value),
        is_active: toNum(r.is_active),
        basedOn: r.based_on || r.basedOn || defaults.basedOn,
      }))
    : [defaults];

const DEFAULT_EARNING   = { component: "", type: "percentage", value: 0, is_active: 1, basedOn: "CTC" };
const DEFAULT_DEDUCTION = { component: "", type: "percentage", value: 0, is_active: 1, basedOn: "CTC" };

// ─── TDS ─────────────────────────────────────────────────────────────────────
const calcMonthlyTDS = (monthlyGross, monthlyEmployeePF) => {
  if (!monthlyGross || monthlyGross <= 0) return 0;
  const annual  = monthlyGross * 12;
  const taxable = Math.max(0, annual - 50_000 - (monthlyEmployeePF || 0) * 12);
  let tax = 0;
  if      (taxable <= 250_000)   tax = 0;
  else if (taxable <= 500_000)   tax = (taxable - 250_000) * 0.05;
  else if (taxable <= 1_000_000) tax = 12_500 + (taxable - 500_000) * 0.20;
  else                           tax = 112_500 + (taxable - 1_000_000) * 0.30;
  return (tax * 1.04) / 12;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function MySetSalary({ employeeId }) {
  const [loading,          setLoading]          = useState(true);
  const [earningRows,      setEarningRows]      = useState([]);
  const [deductionRows,    setDeductionRows]    = useState([]);
  const [ctc,              setCtc]              = useState(0);
  const [policyName,       setPolicyName]       = useState(null);

  const monthlyCtc = toNum(ctc) / 12;

  // ── derived amounts ────────────────────────────────────────────────────────
  const basicRow = earningRows.find(
    (r) => r.component?.toLowerCase() === "basic" && r.is_active === 1
  );
  const basicAmount = basicRow
    ? basicRow.type === "percentage"
      ? (monthlyCtc * toNum(basicRow.value)) / 100
      : toNum(basicRow.value)
    : 0;

  const resolveBase = (basedOn) =>
    (basedOn || "CTC").toLowerCase() === "basic" ? basicAmount : monthlyCtc;

  const rowAmount = (row, skipTDS = false) => {
    const comp = (row.component || "").trim().toLowerCase();
    if (comp === "pf") return Math.min(basicAmount, 15_000) * 0.12;
    if (comp === "tds") {
      if (skipTDS) return 0;
      const pfRow     = deductionRows.find((r) => r.component?.toLowerCase() === "pf" && r.is_active === 1);
      const monthlyPF = pfRow ? rowAmount(pfRow) : 0;
      return calcMonthlyTDS(grossBeforeTDS, monthlyPF);
    }
    const base = resolveBase(row.basedOn);
    return row.type === "percentage"
      ? (base * toNum(row.value)) / 100
      : toNum(row.value);
  };

  const grossBeforeTDS = earningRows
    .filter((r) => r.is_active === 1)
    .reduce((s, r) => s + rowAmount(r, true), 0);

  const grossSalary     = earningRows.filter((r)     => r.is_active === 1).reduce((s, r) => s + rowAmount(r), 0);
  const totalDeductions = deductionRows.filter((r)   => r.is_active === 1).reduce((s, r) => s + rowAmount(r), 0);
  const netSalary       = grossSalary - totalDeductions;

  // ── load policy breakdown ──────────────────────────────────────────────────
  const loadPolicyBreakdown = useCallback(async (policyId) => {
    const [earn, ded] = await Promise.all([
      api.get(`/api/salary-policies/${policyId}/earnings`),
      api.get(`/api/salary-policies/${policyId}/deductions`),
    ]);
    setEarningRows(normaliseRows(earn.data?.data || [], DEFAULT_EARNING));
    setDeductionRows(normaliseRows(ded.data?.data || [], DEFAULT_DEDUCTION));
  }, []);

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!employeeId) return;

    const init = async () => {
      setLoading(true);
      try {
        const [policyRes, salaryRes] = await Promise.all([
          api.get("/api/salary-policies"),
          api.get(`/api/employees/${employeeId}/salary`),
        ]);

        const salary     = salaryRes.data;
        const policyList = policyRes.data?.data || [];

        if (!salary?.policy_id) return;

        const matched = policyList.find((p) => p.id === salary.policy_id);
        if (matched) setPolicyName(matched.title || matched.name);

        const savedCtc = salary.annual_ctc || (salary.monthly_ctc ? salary.monthly_ctc * 12 : 0);
        setCtc(savedCtc);

        const hasOverrides =
          (salary.earnings?.length || 0) +
          (salary.deductions?.length || 0) > 0;

        if (hasOverrides) {
          setEarningRows(normaliseRows(salary.earnings || [], DEFAULT_EARNING));
          setDeductionRows(normaliseRows(salary.deductions || [], DEFAULT_DEDUCTION));
        } else if (salary.policy_id) {
          await loadPolicyBreakdown(salary.policy_id);
        }
      } catch (err) {
        console.error("MySetSalary init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [employeeId, loadPolicyBreakdown]);

  // ─── Salary Summary Card ───────────────────────────────────────────────────
  const SummaryCard = ({ label, value, variant = "secondary", large = false }) => (
    <Col md={3} sm={6} className="mb-3">
      <Card
        className="h-100 text-center border-0 shadow-sm"
        style={{ borderRadius: 12 }}
      >
        <Card.Body className="py-3">
          <p className="text-muted mb-1" style={{ fontSize: "0.78rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {label}
          </p>
          <h5
            className={`mb-0 fw-bold ${large ? "fs-4" : "fs-5"}`}
            style={{ color: variant === "success" ? "#198754" : variant === "danger" ? "#dc3545" : "#663399" }}
          >
            {value}
          </h5>
        </Card.Body>
      </Card>
    </Col>
  );

  // ─── Breakdown Row ─────────────────────────────────────────────────────────
  const BreakdownRow = ({ label, amount, muted = false }) => (
    <div
      className="d-flex justify-content-between align-items-center py-2"
      style={{ borderBottom: "1px solid #f0f0f0" }}
    >
      <span style={{ color: muted ? "#999" : "#333", fontSize: "0.9rem" }}>{label}</span>
      <span style={{ fontWeight: 600, color: muted ? "#aaa" : "#222", fontSize: "0.9rem" }}>
        {amount}
      </span>
    </div>
  );

  // ─── Loading / No Data ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card body className="text-center py-5">
        <div className="spinner-border text-purple" style={{ color: "#663399" }} role="status" />
        <p className="mt-3 text-muted">Loading your salary details…</p>
      </Card>
    );
  }

  if (!policyName) {
    return (
      <Card body className="text-center py-5">
        <i className="i-Money-2 text-muted" style={{ fontSize: 48 }} />
        <p className="mt-3 text-muted">No salary structure assigned yet. Please contact HR.</p>
      </Card>
    );
  }

  const activeEarnings   = earningRows.filter((r) => r.is_active === 1);
  const activeDeductions = deductionRows.filter((r) => r.is_active === 1);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "My Salary" },
        ]}
      />

      {/* ── Summary Cards ── */}
      <Row className="mb-3">
        <SummaryCard label="Monthly Net Salary" value={fmt(netSalary)}     variant="success" large />
        <SummaryCard label="Monthly Gross"       value={fmt(grossSalary)}  variant="purple" />
        <SummaryCard label="Total Deductions"    value={fmt(totalDeductions)} variant="danger" />
        <SummaryCard label="Monthly CTC"         value={fmt(monthlyCtc)}   variant="secondary" />
      </Row>

      <Row>
        {/* ── Earnings ── */}
        <Col md={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 12 }}>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="mb-0 fw-semibold" style={{ color: "#663399" }}>
                  💰 Earnings
                </h6>
                <Badge bg="success" pill>{fmt(grossSalary)}</Badge>
              </div>

              {activeEarnings.length === 0 ? (
                <p className="text-muted text-center py-3">No earnings data found.</p>
              ) : (
                activeEarnings.map((row, i) => (
                  <BreakdownRow
                    key={i}
                    label={row.component || `Component ${i + 1}`}
                    amount={fmt(rowAmount(row))}
                  />
                ))
              )}

              <div className="d-flex justify-content-between pt-3 mt-1">
                <span className="fw-bold">Total Earnings</span>
                <span className="fw-bold" style={{ color: "#198754" }}>{fmt(grossSalary)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Deductions ── */}
        <Col md={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 12 }}>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="mb-0 fw-semibold" style={{ color: "#663399" }}>
                  📉 Deductions
                </h6>
                <Badge bg="danger" pill>{fmt(totalDeductions)}</Badge>
              </div>

              {activeDeductions.length === 0 ? (
                <p className="text-muted text-center py-3">No deductions found.</p>
              ) : (
                activeDeductions.map((row, i) => (
                  <BreakdownRow
                    key={i}
                    label={row.component || `Deduction ${i + 1}`}
                    amount={fmt(rowAmount(row))}
                  />
                ))
              )}

              <div className="d-flex justify-content-between pt-3 mt-1">
                <span className="fw-bold">Total Deductions</span>
                <span className="fw-bold" style={{ color: "#dc3545" }}>{fmt(totalDeductions)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

     
    </section>
  );
}