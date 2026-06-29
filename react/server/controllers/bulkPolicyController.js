import db from "../config/db.js";

// ─── promise wrapper ──────────────────────────────────────────────────────────
const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/leave-policy/bulk-assign
// Body: { employee_ids: string[], policy_id: number }
// Returns: { success: number, failed: { id, reason }[] }
// Mirrors applyLeavePolicyToEmployee: updates employees.leave_policy_id +
// employees.leave_policy_name directly (the column the profile page reads).
// ─────────────────────────────────────────────────────────────────────────────
export const bulkAssignLeavePolicy = async (req, res) => {
  const { employee_ids, policy_id } = req.body;

  if (!policy_id || !Array.isArray(employee_ids) || employee_ids.length === 0) {
    return res.status(400).json({ message: "employee_ids and policy_id are required" });
  }

  try {
    // Fetch the policy title so we can write leave_policy_name too
    const policies = await query("SELECT id, title FROM leave_policies WHERE id = ? LIMIT 1", [policy_id]);
    if (policies.length === 0) {
      return res.status(404).json({ message: "Leave policy not found" });
    }
    const policyName = policies[0].title;

    let success = 0;
    const failed = [];

    for (const emp_id of employee_ids) {
      try {
        const result = await query(
          `UPDATE employees SET leave_policy_id = ?, leave_policy_name = ? WHERE id = ?`,
          [policy_id, policyName, emp_id]
        );
        if (result.affectedRows === 0) {
          failed.push({ id: emp_id, reason: "Employee not found" });
        } else {
          success++;
        }
      } catch (err) {
        failed.push({ id: emp_id, reason: err.message });
      }
    }

    return res.json({
      message: `Leave policy assigned to ${success} employee(s)`,
      success,
      failed,
    });
  } catch (err) {
    console.error("bulkAssignLeavePolicy error:", err);
    return res.status(500).json({ message: "Database error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/salary-policies/bulk-assign
// Body: { employee_ids: string[], policy_id: number }
// Returns: { success: number, failed: { id, reason }[] }
// Strategy:
//   - If employee already has an employee_salary row → UPDATE policy_id only
//     (preserves all existing CTC / earnings / deductions).
//   - If no row yet → INSERT with policy_id and zeroed CTC so the profile
//     page can later fill in the numbers.
// ─────────────────────────────────────────────────────────────────────────────
export const bulkAssignSalaryPolicy = async (req, res) => {
  const { employee_ids, policy_id } = req.body;

  if (!policy_id || !Array.isArray(employee_ids) || employee_ids.length === 0) {
    return res.status(400).json({ message: "employee_ids and policy_id are required" });
  }

  try {
    // Verify the policy exists
    const policies = await query("SELECT id, title FROM salary_policies WHERE id = ? LIMIT 1", [policy_id]);
    if (policies.length === 0) {
      return res.status(404).json({ message: "Salary policy not found" });
    }

    let success = 0;
    const failed = [];

    for (const emp_id of employee_ids) {
      try {
        // Check if a salary row already exists for this employee
        const existing = await query(
          "SELECT employee_id FROM employee_salary WHERE employee_id = ? LIMIT 1",
          [emp_id]
        );

        if (existing.length > 0) {
          // Row exists — only update the policy link, leave CTC values intact
          await query(
            "UPDATE employee_salary SET policy_id = ? WHERE employee_id = ?",
            [policy_id, emp_id]
          );
        } else {
          // No row yet — create a skeleton row so the policy is linked
          await query(
            `INSERT INTO employee_salary
               (employee_id, policy_id, annual_ctc, monthly_ctc, gross_salary,
                total_deductions, net_salary, employer_contributions, total_monthly_ctc)
             VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0)`,
            [emp_id, policy_id]
          );
        }
        success++;
      } catch (err) {
        failed.push({ id: emp_id, reason: err.message });
      }
    }

    return res.json({
      message: `Salary policy assigned to ${success} employee(s)`,
      success,
      failed,
    });
  } catch (err) {
    console.error("bulkAssignSalaryPolicy error:", err);
    return res.status(500).json({ message: "Database error", error: err.message });
  }
};
