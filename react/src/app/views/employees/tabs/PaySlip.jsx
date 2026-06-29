// PaySlip.jsx  — Admin view
// Route: /employees/:id/pay-slip
// - employee_id comes from URL params (no picker needed)
// - Default month = previous month
// - Preview modal shows attendance + salary breakdown before generating
// - Table shows all generated payslips for this employee
// - PDF via print dialog (no extra library)

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
  { v: 1,  l: "January"  }, { v: 2,  l: "February" }, { v: 3,  l: "March"    },
  { v: 4,  l: "April"    }, { v: 5,  l: "May"       }, { v: 6,  l: "June"     },
  { v: 7,  l: "July"     }, { v: 8,  l: "August"    }, { v: 9,  l: "September"},
  { v: 10, l: "October"  }, { v: 11, l: "November"  }, { v: 12, l: "December" },
];

const fmt = (n) =>
  `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const prevMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

// ─── PDF print helper ─────────────────────────────────────────────────────────
const printPayslip = (slip) => {
  if (!slip) return;
  const d   = slip.payslip_data || {};
  const att = d.attendance || {};
  const MONTH_NAMES = ["","January","February","March","April","May","June",
    "July","August","September","October","November","December"];

  const html = `
<!DOCTYPE html><html><head><title>Payslip</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#333;margin:0;padding:20px}
  .header{text-align:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:16px}
  .header h2{margin:0 0 4px;font-size:18px}.header p{margin:0;font-size:11px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;margin-bottom:16px}
  .info-grid div{font-size:11px} .info-grid strong{display:inline-block;width:130px}
  .section-title{background:#f0f0f0;padding:4px 8px;font-weight:bold;margin:12px 0 6px;font-size:12px}
  table{width:100%;border-collapse:collapse;margin-bottom:12px}
  th,td{border:1px solid #ddd;padding:5px 8px;font-size:11px}
  th{background:#f5f5f5;font-weight:bold} .text-right{text-align:right}
  .att-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px}
  .att-box{border:1px solid #ddd;padding:6px;text-align:center;border-radius:4px}
  .att-box .num{font-size:18px;font-weight:bold;color:#663399}
  .att-box .lbl{font-size:10px;color:#666}
  .total-row{background:#f9f9f9;font-weight:bold}
  .net-box{background:#663399;color:#fff;padding:10px;text-align:center;border-radius:6px;margin-top:10px}
  .net-box .net-lbl{font-size:11px;opacity:.85} .net-box .net-val{font-size:20px;font-weight:bold}
  @media print{body{padding:10px}}
</style></head><body>
  <div class="header">
    <h2>${slip.company_name || "Company Name"}</h2>
    <p>${slip.company_address || ""}</p>
    <p style="font-size:14px;font-weight:bold;margin-top:6px">
      PAY SLIP — ${MONTH_NAMES[slip.salary_month || 1]} ${slip.salary_year || ""}
    </p>
  </div>

  <div class="info-grid">
    <div><strong>Employee Name:</strong> ${slip.employee_name || "-"}</div>
    <div><strong>Staff ID:</strong> ${slip.staff_id || "-"}</div>
    <div><strong>Designation:</strong> ${slip.designation_name || "-"}</div>
    <div><strong>Department:</strong> ${slip.department_name || "-"}</div>
    <div><strong>PF/UAN:</strong> ${slip.pf_uan_number || "-"}</div>
    <div><strong>ESIC:</strong> ${slip.esic_ip_number || "-"}</div>
    <div><strong>Payslip No:</strong> ${slip.payslip_key || "-"}</div>
    <div><strong>Generated On:</strong> ${slip.created_at ? new Date(slip.created_at).toLocaleDateString("en-IN") : "-"}</div>
  </div>

  <div class="section-title">Attendance Summary</div>
  <div class="att-grid">
    <div class="att-box"><div class="num">${att.working_days ?? "-"}</div><div class="lbl">Working Days</div></div>
    <div class="att-box"><div class="num">${att.present_days ?? "-"}</div><div class="lbl">Present (incl. half-day)</div></div>
    <div class="att-box"><div class="num" style="color:#dc3545">${att.absent_days ?? "-"}</div><div class="lbl">Absent (Deducted)</div></div>
    <div class="att-box"><div class="num">${att.leave_days ?? "-"}</div><div class="lbl">Paid Leave</div></div>
  </div>

  <table>
    <thead><tr><th>Earnings</th><th class="text-right">Amount</th><th>Deductions</th><th class="text-right">Amount</th></tr></thead>
    <tbody>
      ${(() => {
        const earn = d.earnings || [];
        const dedu = d.deductions || [];
        const max  = Math.max(earn.length, dedu.length);
        let rows = "";
        for (let i = 0; i < max; i++) {
          const e = earn[i] || {};
          const dd = dedu[i] || {};
          rows += `<tr>
            <td>${e.component || ""}</td><td class="text-right">${e.component ? fmt(e.amount) : ""}</td>
            <td>${dd.component || ""}</td><td class="text-right">${dd.component ? fmt(dd.amount) : ""}</td>
          </tr>`;
        }
        return rows;
      })()}
      <tr class="total-row">
        <td>Gross Earnings</td><td class="text-right">${fmt(d.gross_salary)}</td>
        <td>Total Deductions</td><td class="text-right">${fmt(d.policy_deductions)}</td>
      </tr>
      ${att.absent_days > 0 ? `<tr><td></td><td></td><td style="color:#dc3545">Absence Deduction (${att.absent_days} day${att.absent_days > 1 ? "s" : ""})</td><td class="text-right" style="color:#dc3545">- ${fmt(d.absence_deduction)}</td></tr>` : ""}
    </tbody>
  </table>

  <div class="net-box">
    <div class="net-lbl">Net Salary Payable</div>
    <div class="net-val">${fmt(d.net_salary)}</div>
  </div>

  <p style="font-size:10px;color:#999;margin-top:16px;text-align:center">
    This is a computer-generated payslip. No signature required.
  </p>
</body></html>`;

  const win = window.open("", "_blank", "width=800,height=650");
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
};

// =============================================================================
export default function PaySlip() {
  const { id: employeeId } = useParams();

  const [payslips,    setPayslips]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  // month/year selector
  const def = prevMonth();
  const [selMonth, setSelMonth] = useState(def.month);
  const [selYear,  setSelYear]  = useState(def.year);

  // preview modal state
  const [showModal,   setShowModal]   = useState(false);
  const [preview,     setPreview]     = useState(null);
  const [previewing,  setPreviewing]  = useState(false);
  const [generating,  setGenerating]  = useState(false);
  const [genMsg,      setGenMsg]      = useState("");

  // delete confirm
  const [deleteId,    setDeleteId]    = useState(null);

  // status toggle
  const [togglingId,   setTogglingId]  = useState(null);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // ── fetch existing payslips ──────────────────────────────────────────────
  const fetchPayslips = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await api.get("/api/payslips", { params: { employee_id: employeeId } });
      setPayslips(res.data?.data || []);
    } catch {
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { fetchPayslips(); }, [fetchPayslips]);

  // ── open preview modal ───────────────────────────────────────────────────
  const openPreview = async () => {
    setPreviewing(true);
    setGenMsg("");
    try {
      const res = await api.get("/api/payslips/preview", {
        params: { employee_id: employeeId, month: selMonth, year: selYear },
      });
      setPreview(res.data);
      setShowModal(true);
    } catch (err) {
      setGenMsg(err.response?.data?.message || "Failed to load preview.");
    } finally {
      setPreviewing(false);
    }
  };

  // ── confirm generate ─────────────────────────────────────────────────────
  const confirmGenerate = async () => {
    setGenerating(true);
    setGenMsg("");
    try {
      await api.post("/api/payslips/generate", {
        employee_id: employeeId,
        month:       selMonth,
        year:        selYear,
      });
      setShowModal(false);
      setPreview(null);
      await fetchPayslips();
    } catch (err) {
      setGenMsg(err.response?.data?.message || "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/payslips/${deleteId}`);
      setDeleteId(null);
      await fetchPayslips();
    } catch {
      alert("Delete failed.");
    }
  };

  // ── toggle status (paid/unpaid) ──────────────────────────────────────────
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

  // ── download PDF for a payslip row ───────────────────────────────────────
  const handleDownload = async (row) => {
    try {
      const res = await api.get(`/api/payslips/${row.id}`);
      printPayslip(res.data);
    } catch {
      alert("Could not load payslip details.");
    }
  };

  // ─── Preview Modal content ────────────────────────────────────────────────
  const PreviewModal = () => {
    if (!preview) return null;
    const att = preview.attendance || {};
    const sal = preview.salary     || {};
    const MONTH_NAME = MONTHS.find((m) => m.v === selMonth)?.l || "";

    return (
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: "#663399", color: "#fff" }}>
          <Modal.Title style={{ fontSize: 16 }}>
            Payslip Preview — {MONTH_NAME} {selYear}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "20px 24px" }}>
          {preview.alreadyGenerated && (
            <div className="alert alert-warning py-2 mb-3" style={{ fontSize: 13 }}>
              ⚠️ A payslip already exists for this month (ID #{preview.existing_payslip_id}).
              Generating again is blocked.
            </div>
          )}

          {/* Attendance summary */}
          <h6 className="fw-bold mb-2" style={{ color: "#663399" }}>Attendance</h6>
          <div className="row g-2 mb-3">
            {[
              { label: "Working Days",           val: att.working_days,  color: "#333"    },
              { label: "Present (+ half-day)",   val: att.present_days,  color: "#198754" },
              { label: "Absent (Deducted)",       val: att.absent_days,   color: "#dc3545" },
              { label: "Paid Leave",              val: att.leave_days,    color: "#0d6efd" },
              { label: "Holidays",                val: att.holiday_days,  color: "#6c757d" },
              { label: "Week-Off",                val: att.weekoff_days,  color: "#6c757d" },
            ].map(({ label, val, color }) => (
              <div key={label} className="col-4">
                <div className="border rounded p-2 text-center" style={{ fontSize: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>{val ?? 0}</div>
                  <div style={{ color: "#666" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Earnings */}
          <h6 className="fw-bold mb-2" style={{ color: "#663399" }}>Earnings</h6>
          <table className="table table-sm table-bordered mb-3" style={{ fontSize: 12 }}>
            <tbody>
              {(sal.earnings || []).map((e, i) => (
                <tr key={i}>
                  <td>{e.component}</td>
                  <td className="text-end">{fmt(e.amount)}</td>
                </tr>
              ))}
              <tr className="fw-bold table-light">
                <td>Gross Salary</td>
                <td className="text-end">{fmt(sal.gross_salary)}</td>
              </tr>
            </tbody>
          </table>

          {/* Deductions */}
          <h6 className="fw-bold mb-2" style={{ color: "#663399" }}>Deductions</h6>
          <table className="table table-sm table-bordered mb-3" style={{ fontSize: 12 }}>
            <tbody>
              {(sal.deductions || []).map((d, i) => (
                <tr key={i}>
                  <td>{d.component}</td>
                  <td className="text-end">{fmt(d.amount)}</td>
                </tr>
              ))}
              {att.absent_days > 0 && (
                <tr style={{ color: "#dc3545" }}>
                  <td>Absence Deduction ({att.absent_days} day{att.absent_days > 1 ? "s" : ""} × {fmt(sal.per_day_rate)}/day)</td>
                  <td className="text-end">− {fmt(sal.absence_deduction)}</td>
                </tr>
              )}
              <tr className="fw-bold table-light">
                <td>Total Deductions</td>
                <td className="text-end">{fmt((sal.policy_deductions || 0) + (sal.absence_deduction || 0))}</td>
              </tr>
            </tbody>
          </table>

          {/* Net salary */}
          <div
            className="rounded p-3 text-center text-white"
            style={{ background: "#663399" }}
          >
            <div style={{ fontSize: 12, opacity: 0.85 }}>Net Salary Payable</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(sal.net_salary)}</div>
          </div>

          {genMsg && (
            <div className="alert alert-danger mt-2 py-2 mb-0" style={{ fontSize: 12 }}>
              {genMsg}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          {!preview.alreadyGenerated && (
            <Button
              size="sm"
              disabled={generating}
              onClick={confirmGenerate}
              style={{ background: "#663399", border: "none", minWidth: 130 }}
            >
              {generating ? "Generating…" : "✅ Confirm & Generate"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  };

  // ─── Delete confirm modal ─────────────────────────────────────────────────
  const DeleteModal = () => (
    <Modal show={!!deleteId} onHide={() => setDeleteId(null)} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 15 }}>Delete Payslip</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ fontSize: 13 }}>
        Are you sure you want to delete this payslip? This cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
        <Button variant="danger" size="sm" onClick={confirmDelete}>Delete</Button>
      </Modal.Footer>
    </Modal>
  );

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Breadcrumb
          routeSegments={[
            { name: "Dashboard", path: "/" },
            { name: "Employees", path: "/employees" },
            { name: "Pay Slip" },
          ]}
        />
      </div>

      {/* Month/Year selector + Generate button */}
      <Card body className="mb-3">
        <div className="d-flex flex-wrap align-items-end gap-3">
          <div>
            <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
              Month
            </label>
            <select
              className="form-select form-select-sm"
              value={selMonth}
              onChange={(e) => setSelMonth(Number(e.target.value))}
              style={{ width: 140 }}
            >
              {MONTHS.map((m) => (
                <option key={m.v} value={m.v}>{m.l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
              Year
            </label>
            <select
              className="form-select form-select-sm"
              value={selYear}
              onChange={(e) => setSelYear(Number(e.target.value))}
              style={{ width: 100 }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            disabled={previewing}
            onClick={openPreview}
            style={{ background: "#663399", border: "none", height: 34, minWidth: 160 }}
          >
            {previewing ? "Loading…" : "🔍 Preview & Generate"}
          </Button>

          {genMsg && !showModal && (
            <span style={{ fontSize: 12, color: "#dc3545" }}>{genMsg}</span>
          )}
        </div>
      </Card>

      {/* Payslips table */}
      <Card body>
        <Card.Title style={{ fontSize: 15 }}>Generated Pay Slips</Card.Title>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" style={{ color: "#663399" }} />
            <p className="mt-2 text-muted" style={{ fontSize: 13 }}>Loading…</p>
          </div>
        ) : payslips.length === 0 ? (
          <p className="text-muted text-center py-3" style={{ fontSize: 13 }}>
            No payslips generated yet. Select a month and click "Preview & Generate".
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
                  <th className="text-end" style={{ color: "#dc3545" }}>Absence Cut</th>
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
                    <td className="text-center" style={{ color: "#dc3545", fontWeight: 600 }}>
                      {ps.absent_days}
                    </td>
                    <td className="text-end">
                      {`₹ ${Number(ps.gross_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="text-end" style={{ color: "#dc3545" }}>
                      {ps.absent_days > 0
                        ? `− ${fmt(ps.absence_deduction)}`
                        : "—"}
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
                        {/* Download PDF */}
                        <button
                          className="btn btn-sm"
                          title="Download PDF"
                          onClick={() => handleDownload(ps)}
                          style={{ background: "#ffc107", border: "none", width: 30, height: 30, padding: 0 }}
                        >
                          <i className="i-File-Download text-white" style={{ fontSize: 14 }} />
                        </button>
                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-danger"
                          title="Delete"
                          onClick={() => setDeleteId(ps.id)}
                          style={{ width: 30, height: 30, padding: 0 }}
                        >
                          <i className="i-Close-Window text-white" style={{ fontSize: 14 }} />
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

      <PreviewModal />
      <DeleteModal />
    </section>
  );
}