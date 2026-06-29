// MyPaySlip.jsx — Employee's own payslip view (read-only)
// Props: employee  (object with at least { id })
// Shows all generated payslips for the logged-in employee.
// PDF download via browser print dialog (no external library needed).

import { useEffect, useState, useCallback } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTHS = [
  "","January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Print payslip in a new window ───────────────────────────────────────────
const printPayslip = (slip) => {
  if (!slip) return;
  const d   = slip.payslip_data || {};
  const att = d.attendance || {};

  const html = `
<!DOCTYPE html><html><head><title>Payslip ${MONTHS[slip.salary_month] || ""} ${slip.salary_year || ""}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:12px;color:#333;margin:0;padding:24px}
  .header{text-align:center;border-bottom:2px solid #663399;padding-bottom:12px;margin-bottom:16px}
  .header h2{margin:0 0 4px;font-size:18px;color:#663399}
  .header .sub{font-size:11px;color:#666}
  .slip-title{font-size:14px;font-weight:bold;margin-top:8px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 24px;margin-bottom:16px}
  .info-grid .row-item{font-size:11px;padding:3px 0;border-bottom:1px solid #f0f0f0}
  .info-grid .lbl{color:#888;display:inline-block;width:130px}
  .section{margin-bottom:14px}
  .section-title{background:#f3eeff;color:#663399;font-weight:bold;padding:5px 8px;border-radius:4px;margin-bottom:6px;font-size:12px}
  .att-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px}
  .att-box{border:1px solid #e0d0ff;padding:8px;text-align:center;border-radius:6px;background:#faf8ff}
  .att-box .n{font-size:20px;font-weight:bold}.att-box .l{font-size:10px;color:#888;margin-top:2px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{background:#f3eeff;color:#663399;padding:5px 8px;text-align:left;border:1px solid #e0d0ff}
  td{border:1px solid #e8e8e8;padding:5px 8px}
  .tr{text-align:right} .bold{font-weight:bold}
  .net-box{background:#663399;color:#fff;padding:14px;text-align:center;border-radius:8px;margin-top:14px}
  .net-box .net-l{font-size:11px;opacity:.8;letter-spacing:.04em;text-transform:uppercase}
  .net-box .net-v{font-size:22px;font-weight:700;margin-top:4px}
  .abs-row{color:#dc3545}
  .footer{margin-top:20px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:8px}
  @media print{body{padding:10px}.no-print{display:none}}
</style>
</head><body>
  <div class="header">
    <h2>${slip.company_name || "Company Name"}</h2>
    <p class="sub">${slip.company_address || ""}</p>
    <div class="slip-title">PAY SLIP — ${MONTHS[slip.salary_month] || ""} ${slip.salary_year || ""}</div>
  </div>

  <div class="info-grid">
    <div class="row-item"><span class="lbl">Employee Name</span>${slip.employee_name || "-"}</div>
    <div class="row-item"><span class="lbl">Staff ID</span>${slip.staff_id || "-"}</div>
    <div class="row-item"><span class="lbl">Designation</span>${slip.designation_name || "-"}</div>
    <div class="row-item"><span class="lbl">Department</span>${slip.department_name || "-"}</div>
    <div class="row-item"><span class="lbl">PF / UAN</span>${slip.pf_uan_number || "-"}</div>
    <div class="row-item"><span class="lbl">ESIC</span>${slip.esic_ip_number || "-"}</div>
    <div class="row-item"><span class="lbl">Payslip No.</span>${slip.payslip_key || "-"}</div>
    <div class="row-item"><span class="lbl">Generated On</span>${slip.created_at ? new Date(slip.created_at).toLocaleDateString("en-IN") : "-"}</div>
  </div>

  <div class="section-title">Attendance</div>
  <div class="att-grid">
    <div class="att-box"><div class="n">${att.working_days ?? 0}</div><div class="l">Working Days</div></div>
    <div class="att-box"><div class="n" style="color:#198754">${att.present_days ?? 0}</div><div class="l">Present (incl. half-day)</div></div>
    <div class="att-box"><div class="n" style="color:#dc3545">${att.absent_days ?? 0}</div><div class="l">Absent (Deducted)</div></div>
    <div class="att-box"><div class="n" style="color:#0d6efd">${att.leave_days ?? 0}</div><div class="l">Paid Leave</div></div>
    <div class="att-box"><div class="n" style="color:#6c757d">${att.holiday_days ?? 0}</div><div class="l">Holidays</div></div>
    <div class="att-box"><div class="n" style="color:#6c757d">${att.weekoff_days ?? 0}</div><div class="l">Week-Off</div></div>
  </div>

  <div class="section-title">Earnings</div>
  <table>
    <thead><tr><th>Component</th><th class="tr">Amount</th></tr></thead>
    <tbody>
      ${(d.earnings || []).map((e) => `<tr><td>${e.component}</td><td class="tr">${fmt(e.amount)}</td></tr>`).join("")}
      <tr class="bold"><td>Gross Salary</td><td class="tr">${fmt(d.gross_salary)}</td></tr>
    </tbody>
  </table>

  <div class="section-title" style="margin-top:12px">Deductions</div>
  <table>
    <thead><tr><th>Component</th><th class="tr">Amount</th></tr></thead>
    <tbody>
      ${(d.deductions || []).map((dd) => `<tr><td>${dd.component}</td><td class="tr">${fmt(dd.amount)}</td></tr>`).join("")}
      ${(att.absent_days > 0) ? `<tr class="abs-row"><td>Absence Deduction (${att.absent_days} day${att.absent_days > 1 ? "s" : ""} × ${fmt(d.per_day_rate)}/day)</td><td class="tr">− ${fmt(d.absence_deduction)}</td></tr>` : ""}
      <tr class="bold"><td>Total Deductions</td><td class="tr">${fmt((d.policy_deductions || 0) + (d.absence_deduction || 0))}</td></tr>
    </tbody>
  </table>

  <div class="net-box">
    <div class="net-l">Net Salary Payable</div>
    <div class="net-v">${fmt(d.net_salary)}</div>
  </div>

  <div class="footer">This is a computer-generated payslip. No signature required.</div>
</body></html>`;

  const win = window.open("", "_blank", "width=820,height=700");
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
};

// =============================================================================
export default function MyPaySlip({ employee }) {
  const [payslips, setPayslips] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null); // for detail modal
  const [detailLoading, setDetailLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null); // for status toggle

  const fetchPayslips = useCallback(async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const res = await api.get("/api/payslips", { params: { employee_id: employee.id } });
      setPayslips(res.data?.data || []);
    } catch {
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  }, [employee?.id]);

  useEffect(() => { fetchPayslips(); }, [fetchPayslips]);

  const handleView = async (row) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/payslips/${row.id}`);
      setSelected(res.data);
    } catch {
      alert("Could not load payslip.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = async (row) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/payslips/${row.id}`);
      printPayslip(res.data);
    } catch {
      alert("Could not load payslip.");
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleStatus = async (payslipId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    setTogglingId(payslipId);
    try {
      await api.put(`/api/payslips/${payslipId}/status`, { status: newStatus });
      // Update UI optimistically
      setPayslips((prev) =>
        prev.map((p) => (p.id === payslipId ? { ...p, status: newStatus, statusLabel: newStatus === 1 ? "Paid" : "Generated" } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Detail modal ──────────────────────────────────────────────────────────
  const DetailModal = () => {
    if (!selected) return null;
    const d   = selected.payslip_data || {};
    const att = d.attendance || {};

    return (
      <Modal
        show={!!selected}
        onHide={() => setSelected(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ background: "#663399", color: "#fff" }}>
          <Modal.Title style={{ fontSize: 15 }}>
            Pay Slip — {MONTHS[selected.salary_month] || ""} {selected.salary_year}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "20px 24px" }}>
          {/* Employee info */}
          <div className="row mb-3 g-1" style={{ fontSize: 12 }}>
            {[
              ["Staff ID",    selected.staff_id],
              ["Designation", selected.designation_name],
              ["Department",  selected.department_name],
              ["PF/UAN",      selected.pf_uan_number],
            ].map(([l, v]) => (
              <div key={l} className="col-6">
                <span style={{ color: "#888" }}>{l}: </span>
                <strong>{v || "—"}</strong>
              </div>
            ))}
          </div>

          {/* Attendance */}
          <h6 className="fw-bold mb-2" style={{ color: "#663399" }}>Attendance</h6>
          <div className="row g-2 mb-3">
            {[
              { l: "Working Days",   v: att.working_days,  c: "#333"    },
              { l: "Present",        v: att.present_days,  c: "#198754" },
              { l: "Absent",         v: att.absent_days,   c: "#dc3545" },
              { l: "Paid Leave",     v: att.leave_days,    c: "#0d6efd" },
              { l: "Holidays",       v: att.holiday_days,  c: "#6c757d" },
              { l: "Week-Off",       v: att.weekoff_days,  c: "#6c757d" },
            ].map(({ l, v, c }) => (
              <div key={l} className="col-4">
                <div className="border rounded p-2 text-center" style={{ fontSize: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v ?? 0}</div>
                  <div style={{ color: "#666", fontSize: 11 }}>{l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Earnings / Deductions side by side */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <h6 className="fw-bold mb-2" style={{ color: "#663399", fontSize: 13 }}>Earnings</h6>
              <table className="table table-sm table-bordered" style={{ fontSize: 12 }}>
                <tbody>
                  {(d.earnings || []).map((e, i) => (
                    <tr key={i}>
                      <td>{e.component}</td>
                      <td className="text-end">{fmt(e.amount)}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold table-light">
                    <td>Gross</td>
                    <td className="text-end">{fmt(d.gross_salary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-6">
              <h6 className="fw-bold mb-2" style={{ color: "#663399", fontSize: 13 }}>Deductions</h6>
              <table className="table table-sm table-bordered" style={{ fontSize: 12 }}>
                <tbody>
                  {(d.deductions || []).map((dd, i) => (
                    <tr key={i}>
                      <td>{dd.component}</td>
                      <td className="text-end">{fmt(dd.amount)}</td>
                    </tr>
                  ))}
                  {att.absent_days > 0 && (
                    <tr style={{ color: "#dc3545", fontSize: 11 }}>
                      <td>Absence ({att.absent_days}d)</td>
                      <td className="text-end">− {fmt(d.absence_deduction)}</td>
                    </tr>
                  )}
                  <tr className="fw-bold table-light">
                    <td>Total</td>
                    <td className="text-end">
                      {fmt((d.policy_deductions || 0) + (d.absence_deduction || 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary */}
          <div
            className="rounded p-3 text-center text-white"
            style={{ background: "#663399" }}
          >
            <div style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Net Salary Payable
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
              {fmt(d.net_salary)}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => printPayslip(selected)}
            style={{ background: "#ffc107", border: "none", color: "#000" }}
          >
            🖨️ Download / Print PDF
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "My Pay Slips" },
        ]}
      />

      <Card body>
        <Card.Title style={{ fontSize: 15 }}>My Pay Slips</Card.Title>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" style={{ color: "#663399" }} />
            <p className="mt-2 text-muted" style={{ fontSize: 13 }}>Loading…</p>
          </div>
        ) : payslips.length === 0 ? (
          <p className="text-center text-muted py-4" style={{ fontSize: 13 }}>
            No pay slips generated yet. Please contact HR.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle" style={{ fontSize: 13 }}>
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th className="text-center">Working</th>
                  <th className="text-center">Present</th>
                  <th className="text-center" style={{ color: "#dc3545" }}>Absent</th>
                  <th className="text-end">Gross</th>
                  <th className="text-end" style={{ color: "#198754" }}>Net Salary</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((ps) => (
                  <tr key={ps.id}>
                    <td className="fw-semibold">{ps.salaryMonth}</td>
                    <td className="text-center">{ps.working_days}</td>
                    <td className="text-center">{ps.present_days}</td>
                    <td className="text-center" style={{ color: ps.absent_days > 0 ? "#dc3545" : "#333", fontWeight: ps.absent_days > 0 ? 600 : 400 }}>
                      {ps.absent_days}
                    </td>
                    <td className="text-end">
                      {`₹ ${Number(ps.gross_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="text-end fw-bold" style={{ color: "#198754" }}>
                      {ps.netSalaryFmt}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm"
                        onClick={() => toggleStatus(ps.id, ps.status)}
                        disabled={togglingId === ps.id}
                        style={{
                          background: ps.status === 1 ? "#198754" : "#dc3545",
                          border: "none",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: togglingId === ps.id ? "not-allowed" : "pointer",
                          opacity: togglingId === ps.id ? 0.6 : 1,
                        }}
                      >
                        {togglingId === ps.id ? (
                          <>
                            <span style={{ marginRight: "4px" }}>⟳</span>
                            Updating...
                          </>
                        ) : ps.status === 1 ? (
                          <>
                            <span style={{ marginRight: "4px" }}>✓</span>
                            Paid
                          </>
                        ) : (
                          <>
                            <span style={{ marginRight: "4px" }}>✕</span>
                            Unpaid
                          </>
                        )}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        {/* View detail */}
                        <button
                          className="btn btn-sm"
                          title="View"
                          onClick={() => handleView(ps)}
                          disabled={detailLoading}
                          style={{ background: "#663399", border: "none", width: 30, height: 30, padding: 0 }}
                        >
                          <i className="i-Eye text-white" style={{ fontSize: 13 }} />
                        </button>
                        {/* Download PDF */}
                        <button
                          className="btn btn-sm"
                          title="Download PDF"
                          onClick={() => handleDownload(ps)}
                          disabled={detailLoading}
                          style={{ background: "#ffc107", border: "none", width: 30, height: 30, padding: 0 }}
                        >
                          <i className="i-File-Download text-white" style={{ fontSize: 13 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <DetailModal />
    </section>
  );
}