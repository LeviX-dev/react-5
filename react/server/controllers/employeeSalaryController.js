// employeeSalaryController.js
import db from "../config/db.js";

// ─── connection helpers ───────────────────────────────────────────────────────
const getConnection = () =>
  new Promise((res, rej) =>
    db.getConnection((err, conn) => (err ? rej(err) : res(conn)))
  );
const beginTx  = (c) => new Promise((r, j) => c.beginTransaction((e) => (e ? j(e) : r())));
const commit   = (c) => new Promise((r, j) => c.commit((e) => (e ? j(e) : r())));
const rollback = (c) => new Promise((r) => c.rollback(r));

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employees/:employeeId/salary
// Returns the master salary record + any per-employee component overrides.
// If no overrides exist the earnings/deductions/contributions arrays will be
// empty → the frontend falls back to the policy-level breakdown.
// ─────────────────────────────────────────────────────────────────────────────
export const getEmployeeSalary = async (req, res) => {
  const { employeeId } = req.params;

  try {
    // 1. Master record
    const [salaryRows] = await db.promise().query(
      "SELECT * FROM employee_salary WHERE employee_id = ?",
      [employeeId]
    );

    if (salaryRows.length === 0) {
      // Employee has no salary configured yet
      return res.json({
        policy_id:    null,
        annual_ctc:   null,
        monthly_ctc:  null,
        gross_salary: null,
        net_salary:   null,
        earnings:     [],
        deductions:   [],
        contributions:[],
      });
    }

    const salary = salaryRows[0];

    // 2. Per-employee component overrides
    const [earnings] = await db.promise().query(
      "SELECT component, type, value, basedOn, is_active FROM employee_salary_earnings WHERE employee_id = ?",
      [employeeId]
    );
    const [deductions] = await db.promise().query(
      "SELECT component, type, value, basedOn, is_active FROM employee_salary_deductions WHERE employee_id = ?",
      [employeeId]
    );
    const [contributions] = await db.promise().query(
      "SELECT component, type, value, basedOn, is_active FROM employee_salary_contributions WHERE employee_id = ?",
      [employeeId]
    );

    return res.json({
      policy_id:              salary.policy_id,
      annual_ctc:             salary.annual_ctc,
      monthly_ctc:            salary.monthly_ctc,
      gross_salary:           salary.gross_salary,
      total_deductions:       salary.total_deductions,
      net_salary:             salary.net_salary,
      employer_contributions: salary.employer_contributions,
      total_monthly_ctc:      salary.total_monthly_ctc,
      earnings,
      deductions,
      contributions,
    });
  } catch (err) {
    console.error("getEmployeeSalary error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/employees/save-salary
// Upserts the master salary record and replaces all component override rows.
// ─────────────────────────────────────────────────────────────────────────────
export const saveEmployeeSalary2 = async (req, res) => {
  const {
    employee_id,
    policy_id,
    annual_ctc,
    monthly_ctc,
    gross_salary,
    total_deductions,
    net_salary,
    employer_contributions,
    total_monthly_ctc,
    earnings      = [],
    deductions    = [],
    contributions = [],
  } = req.body;

  if (!employee_id || !policy_id) {
    return res
      .status(400)
      .json({ message: "employee_id and policy_id are required" });
  }

  let conn;
  try {
    conn = await getConnection();
    await beginTx(conn);

    // 1. Upsert master record
    await conn.promise().query(
      `INSERT INTO employee_salary
         (employee_id, policy_id, annual_ctc, monthly_ctc, gross_salary,
          total_deductions, net_salary, employer_contributions, total_monthly_ctc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         policy_id              = VALUES(policy_id),
         annual_ctc             = VALUES(annual_ctc),
         monthly_ctc            = VALUES(monthly_ctc),
         gross_salary           = VALUES(gross_salary),
         total_deductions       = VALUES(total_deductions),
         net_salary             = VALUES(net_salary),
         employer_contributions = VALUES(employer_contributions),
         total_monthly_ctc      = VALUES(total_monthly_ctc)`,
      [
        employee_id, policy_id, annual_ctc, monthly_ctc, gross_salary,
        total_deductions, net_salary, employer_contributions, total_monthly_ctc,
      ]
    );

    // 2. Replace earnings overrides
    await conn.promise().query(
      "DELETE FROM employee_salary_earnings WHERE employee_id = ?",
      [employee_id]
    );
    for (const r of earnings) {
      await conn.promise().query(
        `INSERT INTO employee_salary_earnings
           (employee_id, component, type, value, basedOn, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, r.component, r.type, r.value, r.basedOn || "CTC", r.is_active ?? 1]
      );
    }

    // 3. Replace deduction overrides
    await conn.promise().query(
      "DELETE FROM employee_salary_deductions WHERE employee_id = ?",
      [employee_id]
    );
    for (const r of deductions) {
      await conn.promise().query(
        `INSERT INTO employee_salary_deductions
           (employee_id, component, type, value, basedOn, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, r.component, r.type, r.value, r.basedOn || "CTC", r.is_active ?? 1]
      );
    }

    // 4. Replace contribution overrides
    await conn.promise().query(
      "DELETE FROM employee_salary_contributions WHERE employee_id = ?",
      [employee_id]
    );
    for (const r of contributions) {
      await conn.promise().query(
        `INSERT INTO employee_salary_contributions
           (employee_id, component, type, value, basedOn, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, r.component, r.type, r.value, r.basedOn || "Basic", r.is_active ?? 1]
      );
    }

    await commit(conn);
    return res.json({ message: "Salary saved successfully" });
  } catch (err) {
    if (conn) await rollback(conn);
    console.error("saveEmployeeSalary2 error:", err);
    return res.status(500).json({ message: "Database error" });
  } finally {
    if (conn) conn.release();
  }
};