import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Card, Button, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─── constants ───────────────────────────────────────────────────────────────
const DEFAULT_EARNING      = { component: "", type: "percentage", value: 0, is_active: 1, basedOn: "CTC" };
const DEFAULT_DEDUCTION    = { component: "", type: "percentage", value: 0, is_active: 1, basedOn: "CTC" };
const DEFAULT_CONTRIBUTION = { component: "", type: "percentage", value: 0, is_active: 1, basedOn: "Basic" };

// ─── helpers ─────────────────────────────────────────────────────────────────
const toNum = (v) => Number(v || 0);

const normaliseRows = (rows, defaults) =>
  rows.length
    ? rows.map((r) => ({
        ...r,
        value: toNum(r.value),
        is_active: toNum(r.is_active),
        basedOn: r.based_on || r.basedOn || defaults.basedOn,
      }))
    : [defaults];

// ─── TDS calculation ────────────────────────────────────────────────────────
const calcMonthlyTDS = (monthlyGross, monthlyEmployeePF) => {
  if (!monthlyGross || monthlyGross <= 0) return 0;
  const annual   = monthlyGross * 12;
  const taxable  = Math.max(0, annual - 50_000 - (monthlyEmployeePF || 0) * 12);

  let tax = 0;
  if (taxable <= 250_000) tax = 0;
  else if (taxable <= 500_000) tax = (taxable - 250_000) * 0.05;
  else if (taxable <= 1_000_000) tax = 12_500 + (taxable - 500_000) * 0.20;
  else tax = 112_500 + (taxable - 1_000_000) * 0.30;

  return (tax * 1.04) / 12;
};

export default function SetSalary({ onBack }) {
  const { id } = useParams();
  const EMPLOYEE_ID = id;

  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [ctc, setCtc] = useState("");
  const [earningRows, setEarningRows] = useState([DEFAULT_EARNING]);
  const [deductionRows, setDeductionRows] = useState([DEFAULT_DEDUCTION]);
  const [contributionRows, setContributionRows] = useState([DEFAULT_CONTRIBUTION]);
  const [saving, setSaving] = useState(false);

  const monthlyCtc = toNum(ctc) / 12;

  // Derived salary numbers
  const basicRow = earningRows.find(
    (r) => r.component?.toLowerCase() === "basic" && r.is_active === 1
  );
  const basicAmount = basicRow
    ? basicRow.type === "percentage"
      ? (monthlyCtc * toNum(basicRow.value)) / 100
      : toNum(basicRow.value)
    : 0;

  const resolveBase = (basedOn) => {
    const b = (basedOn || "CTC").toLowerCase();
    if (b === "basic") return basicAmount;
    return monthlyCtc;
  };

  const rowAmount = (row, skipTDS = false) => {
    const val = toNum(row.value);
    const comp = (row.component || "").trim().toLowerCase();

    if (comp === "pf") {
      return Math.min(basicAmount, 15000) * 0.12;
    }

    if (comp === "tds") {
      if (skipTDS) return 0;
      const pfRow = deductionRows.find((r) => r.component?.toLowerCase() === "pf" && r.is_active === 1);
      const monthlyPF = pfRow ? rowAmount(pfRow) : 0;
      return calcMonthlyTDS(grossBeforeTDS, monthlyPF);
    }

    const base = resolveBase(row.basedOn);
    return row.type === "percentage" ? (base * val) / 100 : val;
  };

  const grossBeforeTDS = earningRows
    .filter((r) => r.is_active === 1)
    .reduce((s, r) => s + rowAmount(r, true), 0);

  const grossSalary = earningRows.filter((r) => r.is_active === 1).reduce((s, r) => s + rowAmount(r), 0);
  const totalDeductions = deductionRows.filter((r) => r.is_active === 1).reduce((s, r) => s + rowAmount(r), 0);
  const employerContributions = contributionRows.filter((r) => r.is_active === 1).reduce((s, r) => s + rowAmount(r), 0);
  const netSalary = grossSalary - totalDeductions;
  const totalMonthlyCTC = grossSalary + employerContributions;
  const annualCTC = totalMonthlyCTC * 12;

  const loadPolicyBreakdown = useCallback(async (policy) => {
    if (!policy?.id) return;
    try {
      const [earn, ded, con] = await Promise.all([
        api.get(`/api/salary-policies/${policy.id}/earnings`),
        api.get(`/api/salary-policies/${policy.id}/deductions`),
        api.get(`/api/salary-policies/${policy.id}/contributions`),
      ]);
      setEarningRows(normaliseRows(earn.data?.data || [], DEFAULT_EARNING));
      setDeductionRows(normaliseRows(ded.data?.data || [], DEFAULT_DEDUCTION));
      setContributionRows(normaliseRows(con.data?.data || [], DEFAULT_CONTRIBUTION));
    } catch (err) {
      console.error("Error loading policy breakdown:", err);
    }
  }, []);

  useEffect(() => {
    if (!EMPLOYEE_ID) return;
    
    const init = async () => {
      try {
        const policyRes = await api.get("/api/salary-policies");
        const policyList = (policyRes.data?.data || []).map((item) => ({
          id: item.id,
          name: item.title,
        }));
        setPolicies(policyList);

        const salaryRes = await api.get(`/api/employees/${EMPLOYEE_ID}/salary`);
        const salary = salaryRes.data;

        if (salary?.policy_id) {
          const matched = policyList.find((p) => p.id === salary.policy_id);
          if (matched) {
            setSelectedPolicy(matched);
            const savedCtc = salary.annual_ctc || (salary.monthly_ctc ? salary.monthly_ctc * 12 : 0);
            setCtc(String(savedCtc));

            const hasOverrides = (salary.earnings?.length || 0) +
              (salary.deductions?.length || 0) +
              (salary.contributions?.length || 0) > 0;

            if (hasOverrides) {
              setEarningRows(normaliseRows(salary.earnings || [], DEFAULT_EARNING));
              setDeductionRows(normaliseRows(salary.deductions || [], DEFAULT_DEDUCTION));
              setContributionRows(normaliseRows(salary.contributions || [], DEFAULT_CONTRIBUTION));
            } else {
              await loadPolicyBreakdown(matched);
            }
          }
        }
      } catch (err) {
        console.error("Init error:", err);
      }
    };

    init();
  }, [EMPLOYEE_ID, loadPolicyBreakdown]);

  const handlePolicyClick = async (policy) => {
    setSelectedPolicy(policy);
    await loadPolicyBreakdown(policy);
  };

  const handleSave = async () => {
    if (!EMPLOYEE_ID) {
      alert("Employee ID not found");
      return;
    }
    if (!selectedPolicy) {
      alert("Please select a policy first.");
      return;
    }
    if (!ctc || toNum(ctc) <= 0) {
      alert("Please enter a valid CTC.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/employees/save-salary", {
        employee_id: Number(EMPLOYEE_ID),
        policy_id: selectedPolicy.id,
        policy_name: selectedPolicy.name,
        annual_ctc: toNum(ctc),
        monthly_ctc: monthlyCtc,
        gross_salary: grossSalary,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        employer_contributions: employerContributions,
        total_monthly_ctc: totalMonthlyCTC,
        earnings: earningRows,
        deductions: deductionRows,
        contributions: contributionRows,
      });
      alert(`✅ Salary saved for Employee ${EMPLOYEE_ID} with policy: ${selectedPolicy.name}`);
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Save failed. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (setter, idx) => {
    setter((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, is_active: r.is_active === 1 ? 0 : 1 } : r))
    );
  };

  const fmt = (n) => `₹ ${toNum(n).toFixed(2)}`;

  const BreakdownTable = ({ title, rows, setter, showBasedOn = false }) => {
    const total = rows.filter((r) => r.is_active === 1).reduce((s, r) => s + rowAmount(r), 0);

    return (
      <Card className="p-3 mb-3">
        <h6>{title}</h6>
        <div className="table-responsive">
          <table className="table table-bordered table-sm mb-1">
            <thead>
              <tr>
                <th>Active</th>
                <th>Component</th>
                <th>Type</th>
                <th>Value</th>
                {showBasedOn && <th>Based On</th>}
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={row.is_active === 0 ? "text-muted" : ""}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={row.is_active === 1}
                      onChange={() => toggleActive(setter, i)}
                    />
                  </td>
                  <td>{row.component}</td>
                  <td>{row.type === "percentage" ? "%" : "₹"}</td>
                  <td>{row.value}</td>
                  {showBasedOn && <td>{row.basedOn || row.based_on || "—"}</td>}
                  <td className="text-end">
                    {row.is_active === 1 ? fmt(rowAmount(row)) : "₹ 0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-end fw-bold">
            Total: {fmt(total)}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-0">
        <h5>Set Salary for Employee #{EMPLOYEE_ID}</h5>
        <Button variant="secondary" onClick={onBack}>Back</Button>
      </div>

      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Employees", path: "/employees" },
          { name: `Set Salary - Employee ${EMPLOYEE_ID}` },
        ]}
      />

      <Card className="p-2 shadow-sm">
        <Row className="align-items-start m-0">
          {/* LEFT: policy list */}
          <Col md={2} className="p-0">
            <Card className="p-2 h-100">
              <h6 className="m-0 mb-2">Policies</h6>
              {selectedPolicy && (
                <div
                  className="mb-2 p-2 rounded text-white fw-bold text-center"
                  style={{ backgroundColor: "#6f42c1", fontSize: "0.8rem" }}
                >
                  ✅ {selectedPolicy.name} Applied
                </div>
              )}
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  onClick={() => handlePolicyClick(policy)}
                  className={`p-2 mb-2 border rounded ${selectedPolicy?.id === policy.id ? "bg-primary text-white" : ""}`}
                  style={{ cursor: "pointer", fontSize: "0.85rem" }}
                >
                  📄 {policy.name}
                </div>
              ))}
            </Card>
          </Col>

          {/* RIGHT: salary details */}
          <Col md={10} className="ps-3 pt-0">
            {!selectedPolicy ? (
              <Card className="p-4 text-center m-0">
                <h6 className="text-muted">Select a policy to begin</h6>
              </Card>
            ) : (
              <>
                <h5 className="mb-3">{selectedPolicy.name}</h5>

                {/* CTC + summary row */}
                <Card className="p-3 mb-3">
                  <Row className="align-items-end g-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Annual CTC (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          value={ctc}
                          onChange={(e) => setCtc(e.target.value)}
                          placeholder="e.g. 25200"
                          className="fw-bold"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Label>Monthly CTC</Form.Label>
                      <div className="form-control fw-bold bg-light">{fmt(monthlyCtc)}</div>
                    </Col>
                    <Col md={3}>
                      <Form.Label>Gross Salary</Form.Label>
                      <div className="form-control fw-bold bg-light">{fmt(grossSalary)}</div>
                    </Col>
                    <Col md={3}>
                      <Form.Label>Net Salary</Form.Label>
                      <div className="form-control fw-bold text-success bg-light">{fmt(netSalary)}</div>
                    </Col>
                  </Row>
                  <Row className="mt-2 g-3">
                    <Col md={3}>
                      <Form.Label>Total Deductions</Form.Label>
                      <div className="form-control text-danger bg-light">{fmt(totalDeductions)}</div>
                    </Col>
                    <Col md={3}>
                      <Form.Label>Employer Contributions</Form.Label>
                      <div className="form-control bg-light">{fmt(employerContributions)}</div>
                    </Col>
                    <Col md={3}>
                      <Form.Label>Total Monthly CTC</Form.Label>
                      <div className="form-control fw-bold bg-light">{fmt(totalMonthlyCTC)}</div>
                    </Col>
                    <Col md={3}>
                      <Form.Label>Annual CTC (computed)</Form.Label>
                      <div className="form-control fw-bold bg-light">{fmt(annualCTC)}</div>
                    </Col>
                  </Row>
                </Card>

                <BreakdownTable title="Earnings" rows={earningRows} setter={setEarningRows} />
                <BreakdownTable title="Deductions" rows={deductionRows} setter={setDeductionRows} />
                <BreakdownTable title="Employer Contributions" rows={contributionRows} setter={setContributionRows} showBasedOn />

                <div className="text-end mt-3">
                  <Button variant="primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
                    {saving ? "Saving..." : "Save Salary"}
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Card>
    </section>
  );
}