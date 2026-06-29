import db from "../config/db.js";

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────
const executeQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) { console.error("DB ERROR:", err); reject(err); }
      else resolve(results);
    });
  });

// ─────────────────────────────────────────────
// GET  /api/attendance/regularization
// Query params (all optional):
//   employee_id, department_id, from_date, to_date, status
// ─────────────────────────────────────────────
export const getRegularizations = async (req, res) => {
  try {
    const { employee_id, department_id, from_date, to_date, status } = req.query;
    const user = req.user; // set by your auth middleware

    const conditions = [];
    const params     = [];

    // Non-admin can only see their own requests
    const effectiveEmployeeId =
      user.role !== "admin" ? user.employee_id : (employee_id || null);

    if (effectiveEmployeeId) {
      conditions.push("r.employee_id = ?");
      params.push(Number(effectiveEmployeeId));
    }

    if (user.role === "admin" && department_id) {
      conditions.push("e.department_id = ?");
      params.push(Number(department_id));
    }

    if (from_date) { conditions.push("r.date >= ?"); params.push(from_date); }
    if (to_date)   { conditions.push("r.date <= ?"); params.push(to_date);   }
    if (status)    { conditions.push("r.status = ?"); params.push(status);   }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await executeQuery(
      `SELECT
         r.id,
         r.employee_id,
         CONCAT(e.first_name, ' ', e.last_name) AS employee,
         DATE_FORMAT(r.date, '%Y-%m-%dT%H:%i:%s') AS date,
         r.clock_in,
         r.clock_out,
         r.reason,
         r.status,
         r.created_at
       FROM attendance_regularizations r
       JOIN employees e ON e.id = r.employee_id
       ${where}
       ORDER BY r.date DESC, r.created_at DESC`,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error("getRegularizations error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// POST  /api/attendance/regularization
// Body: { employee_id, date, clock_in, clock_out, reason, status }
// ─────────────────────────────────────────────
export const createRegularization = async (req, res) => {
  try {
    const { employee_id, date, clock_in, clock_out, reason, status } = req.body;

    if (!employee_id || !date || !reason?.trim()) {
      return res
        .status(400)
        .json({ error: "employee_id, date and reason are required." });
    }

    // Employees can only submit for themselves
    const user = req.user;
    if (user.role !== "admin" && Number(user.employee_id) !== Number(employee_id)) {
      return res.status(403).json({ error: "Not allowed to submit for another employee." });
    }

    const result = await executeQuery(
      `INSERT INTO attendance_regularizations
         (employee_id, date, clock_in, clock_out, reason, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(employee_id),
        date,
        clock_in  || null,
        clock_out || null,
        reason.trim(),
        status || "pending",
      ]
    );

    res.status(201).json({
      message: "Regularization request created.",
      id: result.insertId,
    });
  } catch (err) {
    console.error("createRegularization error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// PUT  /api/attendance/regularization/:id
// Body: any subset of { clock_in, clock_out, reason, status }
//   - Employees can edit only their own pending requests (reason/times).
//   - Admins can edit anything including status.
// ─────────────────────────────────────────────
export const updateRegularization = async (req, res) => {
  try {
    const { id } = req.params;
    const user   = req.user;

    // Fetch the existing record first
    const [existing] = await executeQuery(
      `SELECT * FROM attendance_regularizations WHERE id = ?`,
      [id]
    );
    if (!existing) {
      return res.status(404).json({ error: "Record not found." });
    }

    // Non-admin: only own + pending
    if (user.role !== "admin") {
      if (Number(existing.employee_id) !== Number(user.employee_id)) {
        return res.status(403).json({ error: "Forbidden." });
      }
      if (existing.status !== "pending") {
        return res
          .status(400)
          .json({ error: "Only pending requests can be edited." });
      }
    }

    const { clock_in, clock_out, reason, status } = req.body;

    const fields  = [];
    const params  = [];

    if (clock_in  !== undefined) { fields.push("clock_in = ?");  params.push(clock_in  || null); }
    if (clock_out !== undefined) { fields.push("clock_out = ?"); params.push(clock_out || null); }
    if (reason    !== undefined) { fields.push("reason = ?");    params.push(reason.trim()); }

    // Only admins may change status
    if (status !== undefined && user.role === "admin") {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
      }
      fields.push("status = ?");
      params.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nothing to update." });
    }

    params.push(id);
    await executeQuery(
      `UPDATE attendance_regularizations SET ${fields.join(", ")} WHERE id = ?`,
      params
    );

    res.json({ message: "Regularization request updated." });
  } catch (err) {
    console.error("updateRegularization error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE  /api/attendance/regularization/:id
// Admin only
// ─────────────────────────────────────────────
export const deleteRegularization = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete records." });
    }

    const { id } = req.params;
    const result = await executeQuery(
      `DELETE FROM attendance_regularizations WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found." });
    }

    res.json({ message: "Regularization request deleted." });
  } catch (err) {
    console.error("deleteRegularization error:", err);
    res.status(500).json({ error: err.message });
  }
};