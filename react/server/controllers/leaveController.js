// // controllers/leaveController.js

// import db from "../config/db.js";

// // ─── Helper: promise-wrapper using db.execute (prepared statements) ───────────
// // Consistent with yearattendeceController.js across the entire codebase.
// const executeQuery = (sql, params = []) =>
//   new Promise((resolve, reject) =>
//     db.execute(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
//   );

// // ─── Helper: return every YYYY-MM-DD between start and end (inclusive) ────────
// const dateRange = (start, end) => {
//   const dates = [];
//   const cur  = new Date(start);
//   const last = new Date(end);
//   while (cur <= last) {
//     dates.push(cur.toISOString().split("T")[0]);
//     cur.setDate(cur.getDate() + 1);
//   }
//   return dates;
// };

// // ─── Helper: mark every date in [start_date, end_date] as 'Leave' ─────────────
// //
// // Skips two categories of dates — they must never be overwritten with 'Leave':
// //
// //   1. HOLIDAYS  — calendar_events rows where is_holiday_marked = 1
// //                  (this is the single source of truth for holidays; the
// //                   separate `holidays` table is not used for attendance)
// //
// //   2. WEEKOFFS  — days where the employee's assigned office shift has no
// //                  `{day}_in` value (e.g. saturday_in IS NULL → Saturday is off)
// //                  If the employee has no shift assigned, every day is treated
// //                  as a working day and leave is marked normally.
// //
// // For the remaining working days it uses a safe upsert:
// //   - No existing row  → INSERT with status 'Leave'
// //   - Row exists, no clock_in → UPDATE status to 'Leave'
// //   - Row exists, clock_in present → leave status untouched (employee came in)
// //
// const markAttendanceAsLeave = async (employee_id, start_date, end_date) => {
//   const dates = dateRange(start_date, end_date);

//   // ── 1. Fetch employee's office shift ────────────────────────────────────────
//   const shiftRows = await executeQuery(
//     `SELECT os.*
//      FROM employees e
//      LEFT JOIN office_shifts os ON e.office_shift_id = os.id
//      WHERE e.id = ?`,
//     [employee_id]
//   );
//   const shift = shiftRows.length ? shiftRows[0] : null;

//   // ── 2. Fetch holidays in the date range from calendar_events ─────────────────
//   //    is_holiday_marked = 1 is the flag set via calendarController.markHolidayById
//   const holidayRows = await executeQuery(
//     `SELECT DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date
//      FROM calendar_events
//      WHERE is_holiday_marked = 1
//        AND event_date BETWEEN ? AND ?`,
//     [start_date, end_date]
//   );
//   const holidaySet = new Set(holidayRows.map((r) => r.event_date));

//   // ── 3. Loop and mark only actual working days ────────────────────────────────
//   let affected = 0;
//   let skipped  = 0;

//   for (const date of dates) {
//     // Skip holidays
//     if (holidaySet.has(date)) {
//       console.log(`⏭️  Skipping holiday: ${date}`);
//       skipped++;
//       continue;
//     }

//     // Skip weekoffs — both shift times null means it's the employee's day off
//     if (shift) {
//       const dayName = new Date(date)
//         .toLocaleDateString("en-US", { weekday: "long" })
//         .toLowerCase();                              // e.g. "saturday"
//       const shiftIn = shift[`${dayName}_in`];       // e.g. shift.saturday_in
//       const shiftOut = shift[`${dayName}_out`];      // e.g. shift.saturday_out
//       if (shiftIn == null && shiftOut == null) {
//         console.log(`⏭️  Skipping weekoff: ${date} (${dayName})`);
//         skipped++;
//         continue;
//       }
//     }

//     // Working day — safe upsert
//     const result = await executeQuery(
//       `INSERT INTO attendances
//          (employee_id, attendance_date, attendance_status)
//        VALUES (?, ?, 'Leave')
//        ON DUPLICATE KEY UPDATE
//          attendance_status = IF(
//            clock_in IS NULL OR clock_in = '',
//            'Leave',
//            attendance_status
//          )`,
//       [employee_id, date]
//     );
//     affected += result.affectedRows > 0 ? 1 : 0;
//   }

//   console.log(`📋 Leave marking done — marked: ${affected}, skipped (holiday/weekoff): ${skipped}`);
//   return affected;
// };

// // ─── Helper: revert Leave → absent for dates that had NO clock-in data ─────────
// // Called when a previously-approved leave is rejected.
// // Only touches rows where clock_in IS NULL (pure leave placeholders).
// const revertLeaveAttendance = async (employee_id, start_date, end_date) => {
//   await executeQuery(
//     `UPDATE attendances
//      SET attendance_status = 'absent'
//      WHERE employee_id      = ?
//        AND attendance_date  BETWEEN ? AND ?
//        AND attendance_status = 'Leave'
//        AND (clock_in IS NULL OR clock_in = '')`,
//     [employee_id, start_date, end_date]
//   );
// };


// // ✅ UPDATE LEAVE STATUS + AUTO-MARK ATTENDANCE
// export const updateLeaveStatus = async (req, res) => {
//   const { leave_id, status } = req.body;

//   console.log("🔥 UPDATE STATUS:", req.body);

//   if (!leave_id || !status) {
//     return res.status(400).json({
//       success: false,
//       message: "leave_id and status are required ❌",
//     });
//   }

//   try {
//     // Step 1: Fetch current leave details
//     const leaveRows = await executeQuery(
//       `SELECT id, employee_id, start_date, end_date, status
//        FROM leave_applications
//        WHERE id = ?`,
//       [leave_id]
//     );

//     if (leaveRows.length === 0) {
//       return res.status(404).json({ success: false, message: "Leave not found ❌" });
//     }

//     const leave          = leaveRows[0];
//     const { employee_id, start_date, end_date } = leave;
//     const previousStatus = (leave.status || "").toLowerCase();
//     const newStatus      = status.toLowerCase();

//     // Step 2: Update the leave_applications row
//     await executeQuery(
//       `UPDATE leave_applications SET status = ? WHERE id = ?`,
//       [status, leave_id]
//     );

//     // Step 3: Side-effects based on status transition

//     if (newStatus === "approved" && previousStatus !== "approved") {
//       // Mark every date in range as 'Leave' — but only where no clock_in exists.
//       const recordsUpdated = await markAttendanceAsLeave(employee_id, start_date, end_date);

//       console.log(`✅ ${recordsUpdated} attendance rows marked as Leave`);

//       return res.status(200).json({
//         success: true,
//         message: "Leave approved ✅ and attendance marked as Leave ✅",
//         attendanceUpdated: true,
//         recordsUpdated,
//       });
//     }

//     if (newStatus === "rejected" && previousStatus === "approved") {
//       // Revert pure-leave placeholders back to absent (rows with no clock_in).
//       await revertLeaveAttendance(employee_id, start_date, end_date);

//       console.log("↩️ Leave reverted — placeholder attendance rows reset to absent");

//       return res.status(200).json({
//         success: true,
//         message: "Leave rejected ✅ and attendance reverted ↩️",
//       });
//     }

//     // Any other transition (pending → rejected, already approved → approved, etc.)
//     return res.status(200).json({
//       success: true,
//       message: "Status updated successfully ✅",
//     });

//   } catch (err) {
//     console.error("🔥 updateLeaveStatus ERROR:", err);
//     return res.status(500).json({ success: false, message: "Server error ❌" });
//   }
// };


// // ✅ CREATE LEAVE APPLICATION
// export const createLeaveApplication = async (req, res) => {
//   const {
//     start_date,
//     end_date,
//     total_days,
//     description,
//     employee_id,
//     policy_id,
//     leave_type,
//   } = req.body;

//   console.log("🔥 PAYLOAD:", req.body);

//   if (!start_date || !end_date || !policy_id || !employee_id) {
//     return res.status(400).json({
//       success: false,
//       message: "Required fields missing ❌",
//     });
//   }

//   try {
//     const result = await executeQuery(
//       `INSERT INTO leave_applications
//          (start_date, end_date, total_days, description, employee_id, policy_id, leave_type)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         start_date,
//         end_date,
//         total_days   || 0,
//         description  || "",
//         employee_id,
//         policy_id,
//         leave_type   || null,
//       ]
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Leave applied successfully ✅",
//       data: result,
//     });
//   } catch (err) {
//     console.error("🔥 DB ERROR:", err);
//     return res.status(500).json({ success: false, message: "Server error ❌" });
//   }
// };


// // ✅ GET LEAVES (FILTERED BY EMPLOYEE)
// export const getLeaveApplications = async (req, res) => {
//   const { employee_id } = req.query;

//   let sql = `
//     SELECT
//       la.id,
//       la.start_date,
//       la.end_date,
//       la.total_days,
//       la.description,
//       la.leave_type,
//       la.status,
//       la.employee_id,
//       lp.title AS policy_name,
//       CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
//       d.department_name AS department
//     FROM leave_applications la
//     LEFT JOIN leave_policies lp ON la.policy_id   = lp.id
//     LEFT JOIN employees     e   ON la.employee_id  = e.id
//     LEFT JOIN departments   d   ON e.department_id = d.id
//   `;

//   const values = [];
//   if (employee_id) {
//     sql += " WHERE la.employee_id = ?";
//     values.push(employee_id);
//   }
//   sql += " ORDER BY la.id DESC";

//   try {
//     const rows = await executeQuery(sql, values);
//     return res.status(200).json({ success: true, data: rows });
//   } catch (err) {
//     console.error("🔥 FETCH ERROR:", err);
//     return res.status(500).json({ success: false, message: "Error fetching leave data ❌" });
//   }
// };


// // ✅ GET REMAINING LEAVES PER EMPLOYEE
// export const getRemainingLeaves = async (req, res) => {
//   const { employee_id } = req.query;

//   if (!employee_id) {
//     return res.status(400).json({ success: false, message: "employee_id required ❌" });
//   }

//   const sql = `
//     SELECT
//       lp.id   AS policy_id,
//       lp.title AS policy_name,
//       lp.leaves,
//       LOWER(TRIM(la.leave_type)) AS leave_type,
//       COALESCE(SUM(la.used_days), 0) AS used_days
//     FROM employees e
//     JOIN leave_policies lp ON lp.id = e.leave_policy_id
//     LEFT JOIN (
//       SELECT
//         policy_id,
//         leave_type,
//         SUM(total_days) AS used_days
//       FROM leave_applications
//       WHERE employee_id = ?
//         AND status = 'approved'
//       GROUP BY policy_id, leave_type
//     ) la ON lp.id = la.policy_id
//     WHERE e.id = ?
//     GROUP BY lp.id, leave_type
//   `;

//   try {
//     const rows = await executeQuery(sql, [employee_id, employee_id]);

//     const normalize = (str) => (str || "").toString().trim().toLowerCase();
//     const policyMap = {};

//     rows.forEach((row) => {
//       if (!policyMap[row.policy_id]) {
//         let leaves = [];
//         try { leaves = JSON.parse(row.leaves || "[]"); } catch { leaves = []; }
//         policyMap[row.policy_id] = { policy_name: row.policy_name, leaves, used: {} };
//       }
//       if (row.leave_type) {
//         policyMap[row.policy_id].used[normalize(row.leave_type)] = Number(row.used_days) || 0;
//       }
//     });

//     const result = [];
//     Object.values(policyMap).forEach((policy) => {
//       policy.leaves.forEach((pl) => {
//         const typeKey   = normalize(pl.type);
//         const allocated = Number(pl.days || 0);
//         const used      = policy.used[typeKey] || 0;
//         result.push({
//           policy_name:    policy.policy_name,
//           leave_type:     pl.type,
//           allocated_days: allocated,
//           used_days:      used,
//           remaining_days: Math.max(0, allocated - used),
//         });
//       });
//     });

//     return res.json({ success: true, data: result });
//   } catch (err) {
//     console.error("🔥 DB ERROR:", err);
//     return res.status(500).json({ success: false, message: "Server error ❌" });
//   }
// };


// controllers/leaveController.js

import db from "../config/db.js";

// ─── Helper: promise-wrapper using db.execute (prepared statements) ───────────
const executeQuery = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.execute(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

// ─── Helper: return every YYYY-MM-DD between start and end (inclusive) ────────
const dateRange = (start, end) => {
  const dates = [];
  const cur   = new Date(start);
  const last  = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

// ─── Helper: mark every date in [start_date, end_date] as 'Leave' ─────────────
//
// Skips two categories of dates:
//   1. HOLIDAYS  — calendar_events rows where is_holiday_marked = 1
//   2. WEEKOFFS  — days where the employee's assigned shift has no _in/_out value
//                  (falsy check handles both NULL and "" from the database)
//
// Safe upsert per date:
//   - No row       → INSERT with status 'Leave'
//   - Row, no clock_in → UPDATE status to 'Leave'
//   - Row, clock_in present → leave status untouched (employee was present)
//
const markAttendanceAsLeave = async (employee_id, start_date, end_date) => {
  const dates = dateRange(start_date, end_date);

  // ── 1. Fetch employee's office shift in one query ────────────────────────────
  const shiftRows = await executeQuery(
    `SELECT os.*
     FROM employees e
     LEFT JOIN office_shifts os ON e.office_shift_id = os.id
     WHERE e.id = ?`,
    [employee_id]
  );
  const shift = shiftRows.length ? shiftRows[0] : null;

  // ── 2. Fetch holidays for the full range in one query ────────────────────────
  const holidayRows = await executeQuery(
    `SELECT DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date
     FROM calendar_events
     WHERE is_holiday_marked = 1
       AND event_date BETWEEN ? AND ?`,
    [start_date, end_date]
  );
  const holidaySet = new Set(holidayRows.map((r) => r.event_date));

  // ── 3. Loop and mark only actual working days ────────────────────────────────
  let affected = 0;
  let skipped  = 0;

  for (const date of dates) {
    // Skip holidays
    if (holidaySet.has(date)) {
      skipped++;
      continue;
    }

    // Skip weekoffs
    // BUG FIX: use falsy check (handles NULL *and* empty string "" from DB)
    // Previously: shiftIn == null — missed empty-string weekoff columns
    if (shift) {
      const dayName = new Date(date)
        .toLocaleString("en-US", { weekday: "long" })
        .toLowerCase();
      if (!shift[`${dayName}_in`] && !shift[`${dayName}_out`]) {
        skipped++;
        continue;
      }
    }

    // Working day — safe upsert
    const result = await executeQuery(
      `INSERT INTO attendances
         (employee_id, attendance_date, attendance_status)
       VALUES (?, ?, 'Leave')
       ON DUPLICATE KEY UPDATE
         attendance_status = IF(
           clock_in IS NULL OR clock_in = '',
           'Leave',
           attendance_status
         )`,
      [employee_id, date]
    );
    affected += result.affectedRows > 0 ? 1 : 0;
  }

  console.log(`📋 Leave marking done — marked: ${affected}, skipped (holiday/weekoff): ${skipped}`);
  return affected;
};

// ─── Helper: revert Leave → absent for dates that had NO clock-in data ─────────
// Called when a previously-approved leave is rejected.
// Only touches rows where clock_in IS NULL (pure leave placeholders).
const revertLeaveAttendance = async (employee_id, start_date, end_date) => {
  await executeQuery(
    `UPDATE attendances
     SET attendance_status = 'absent'
     WHERE employee_id      = ?
       AND attendance_date  BETWEEN ? AND ?
       AND attendance_status = 'Leave'
       AND (clock_in IS NULL OR clock_in = '')`,
    [employee_id, start_date, end_date]
  );
};


// ✅ UPDATE LEAVE STATUS + AUTO-MARK ATTENDANCE
export const updateLeaveStatus = async (req, res) => {
  const { leave_id, status } = req.body;

  if (!leave_id || !status) {
    return res.status(400).json({
      success: false,
      message: "leave_id and status are required ❌",
    });
  }

  try {
    // Step 1: Fetch current leave details
    const leaveRows = await executeQuery(
      `SELECT id, employee_id, start_date, end_date, status
       FROM leave_applications
       WHERE id = ?`,
      [leave_id]
    );

    if (leaveRows.length === 0) {
      return res.status(404).json({ success: false, message: "Leave not found ❌" });
    }

    const leave          = leaveRows[0];
    const { employee_id, start_date, end_date } = leave;
    const previousStatus = (leave.status || "").toLowerCase();
    const newStatus      = status.toLowerCase();

    // Step 2: Update the leave_applications row
    await executeQuery(
      `UPDATE leave_applications SET status = ? WHERE id = ?`,
      [status, leave_id]
    );

    // Step 3: Side-effects based on status transition

    if (newStatus === "approved" && previousStatus !== "approved") {
      const recordsUpdated = await markAttendanceAsLeave(employee_id, start_date, end_date);
      return res.status(200).json({
        success: true,
        message: "Leave approved ✅ and attendance marked as Leave ✅",
        attendanceUpdated: true,
        recordsUpdated,
      });
    }

    if (newStatus === "rejected" && previousStatus === "approved") {
      await revertLeaveAttendance(employee_id, start_date, end_date);
      return res.status(200).json({
        success: true,
        message: "Leave rejected ✅ and attendance reverted ↩️",
      });
    }

    // Any other transition (pending → rejected, already approved → approved, etc.)
    return res.status(200).json({
      success: true,
      message: "Status updated successfully ✅",
    });

  } catch (err) {
    console.error("🔥 updateLeaveStatus ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error ❌" });
  }
};


// ✅ CREATE LEAVE APPLICATION
export const createLeaveApplication = async (req, res) => {
  const authUser = req.user || {};
  const {
    start_date,
    end_date,
    total_days,
    description,
    employee_id,
    policy_id,
    leave_type,
  } = req.body;

  const employeeId = authUser.role === "admin"
    ? employee_id
    : authUser.employee_id || authUser.user_id;

  if (!start_date || !end_date || !policy_id || !employeeId) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing ❌",
    });
  }

  // Validate date order
  if (new Date(start_date) > new Date(end_date)) {
    return res.status(400).json({
      success: false,
      message: "start_date cannot be after end_date ❌",
    });
  }

  try {
    const result = await executeQuery(
      `INSERT INTO leave_applications
         (start_date, end_date, total_days, description, employee_id, policy_id, leave_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        start_date,
        end_date,
        total_days   || 0,
        description  || "",
        employeeId,
        policy_id,
        leave_type   || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Leave applied successfully ✅",
      data: result,
    });
  } catch (err) {
    console.error("🔥 createLeaveApplication DB ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error ❌" });
  }
};


// ✅ GET LEAVES (FILTERED BY EMPLOYEE)
export const getLeaveApplications = async (req, res) => {
  const authUser = req.user || {};
  const { employee_id, status } = req.query;
  const routeEmployeeId = req.params.employee_id;
  
  const finalEmployeeId = authUser.role === "admin"
    ? (employee_id || routeEmployeeId)
    : authUser.employee_id || authUser.user_id;

  let sql = `
    SELECT
      la.id,
      la.start_date,
      la.end_date,
      la.total_days,
      la.description,
      la.leave_type,
      la.status,
      la.employee_id,
      la.created_at,
      la.applied_on,
      lp.title AS policy_name,
      CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, '')) AS employee_name,
      d.department_name AS department
    FROM leave_applications la
    LEFT JOIN leave_policies lp ON la.policy_id = lp.id
    LEFT JOIN employees e ON la.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE 1=1
  `;

  const values = [];
  
  if (finalEmployeeId) {
    sql += " AND la.employee_id = ?";
    values.push(finalEmployeeId);
  }
  
  if (status) {
    sql += " AND LOWER(la.status) = LOWER(?)";
    values.push(status);
  }
  
  sql += " ORDER BY la.id DESC";

  try {
    const rows = await executeQuery(sql, values);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error("🔥 getLeaveApplications ERROR:", err);
    return res.status(500).json({ success: false, message: "Error fetching leave data ❌" });
  }
};


// ✅ GET REMAINING LEAVES PER EMPLOYEE
//
// BUG FIX (double-counting):
//   The old query joined leave_applications on just policy_id, then used
//   GROUP BY lp.id, leave_type in the outer query. If an employee had
//   approved leaves for multiple types under the same policy, the outer SUM()
//   could aggregate across unrelated rows because the JOIN was not also
//   scoped by leave_type. This rewrite splits it into two clean queries
//   and builds the result map purely in JS — no GROUP BY confusion.
//
export const getRemainingLeaves = async (req, res) => {
  const authUser = req.user || {};
  const { employee_id } = req.query;
  const finalEmployeeId = authUser.role === "admin"
    ? employee_id
    : authUser.employee_id || authUser.user_id;

  if (!finalEmployeeId) {
    return res.status(400).json({ success: false, message: "employee_id required ❌" });
  }

  try {
    // ── Step 1: Get the employee's assigned leave policy (with its JSON leaves) ──
    const policyRows = await executeQuery(
      `SELECT lp.id AS policy_id, lp.title AS policy_name, lp.leaves
       FROM employees e
       JOIN leave_policies lp ON lp.id = e.leave_policy_id
       WHERE e.id = ?`,
      [finalEmployeeId]
    );

    if (!policyRows.length) {
      // Employee has no leave policy assigned — return empty
      return res.json({ success: true, data: [] });
    }

    const policy = policyRows[0];

    let leaves = [];
    try { leaves = JSON.parse(policy.leaves || "[]"); } catch { leaves = []; }

    // ── Step 2: Aggregate used days per leave_type for this employee/policy ──
    //   Scoped to the specific policy so cross-policy contamination is impossible.
    const usedRows = await executeQuery(
      `SELECT
         LOWER(TRIM(leave_type)) AS leave_type,
         SUM(total_days)         AS used_days
       FROM leave_applications
       WHERE employee_id = ?
         AND policy_id   = ?
         AND status      = 'approved'
       GROUP BY LOWER(TRIM(leave_type))`,
      [finalEmployeeId, policy.policy_id]
    );

    // Build lookup: normalized_type → used_days
    const usedMap = {};
    usedRows.forEach((r) => {
      if (r.leave_type) usedMap[r.leave_type] = Number(r.used_days) || 0;
    });

    const normalize = (str) => (str || "").toString().trim().toLowerCase();

    // ── Step 3: Map every leave type defined in the policy ───────────────────
    const result = leaves.map((pl) => {
      const typeKey   = normalize(pl.type);
      const allocated = Number(pl.days || 0);
      const used      = usedMap[typeKey] || 0;
      return {
        policy_name:    policy.policy_name,
        leave_type:     pl.type,
        allocated_days: allocated,
        used_days:      used,
        remaining_days: Math.max(0, allocated - used),
      };
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("🔥 getRemainingLeaves ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error ❌" });
  }
};

// ✅ GET LEAVE BALANCE PER EMPLOYEE
export const getLeaveBalance = async (req, res) => {
  const routeEmployeeId = req.params.employee_id;
  const authUser = req.user || {};

  const employeeId = authUser.role === "admin"
    ? routeEmployeeId
    : authUser.employee_id || authUser.user_id || routeEmployeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: "employee_id required ❌" });
  }

  try {
    const rows = await executeQuery(
      `SELECT
         lp.id AS policy_id,
         lp.title AS policy_name,
         lp.leaves,
         COALESCE(SUM(CASE WHEN LOWER(TRIM(la.leave_type)) LIKE '%earned%' THEN la.total_days ELSE 0 END), 0) AS earned_used,
         COALESCE(SUM(CASE WHEN LOWER(TRIM(la.leave_type)) LIKE '%sick%' THEN la.total_days ELSE 0 END), 0) AS sick_used,
         COALESCE(SUM(CASE WHEN LOWER(TRIM(la.leave_type)) LIKE '%casual%' THEN la.total_days ELSE 0 END), 0) AS casual_used,
         COALESCE(SUM(CASE WHEN LOWER(TRIM(la.status)) = 'approved' THEN la.total_days ELSE 0 END), 0) AS used_days
       FROM employees e
       LEFT JOIN leave_policies lp ON lp.id = e.leave_policy_id
       LEFT JOIN leave_applications la ON la.employee_id = e.id AND LOWER(TRIM(la.status)) = 'approved'
       WHERE e.id = ?
       GROUP BY lp.id, lp.title, lp.leaves`,
      [employeeId],
    );

    if (!rows.length || !rows[0].policy_id) {
      return res.json({
        success: true,
        data: [],
        summary: {
          employee_id: Number(employeeId),
          policy_id: null,
          policy_name: null,
          used_days: 0,
          remaining_days: 0,
        },
      });
    }

    const policyRow = rows[0];
    let policyLeaves = [];

    try {
      policyLeaves = JSON.parse(policyRow.leaves || "[]");
    } catch {
      policyLeaves = [];
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();
    const usedDaysByType = {
      "earned leave": Number(policyRow.earned_used) || 0,
      "sick leave": Number(policyRow.sick_used) || 0,
      "casual leave": Number(policyRow.casual_used) || 0,
    };

    const balanceRows = policyLeaves.map((leaveType) => {
      const typeName = leaveType?.type || "";
      const allocatedDays = Number(leaveType?.days || 0);
      const usedDays = usedDaysByType[normalize(typeName)] || 0;

      return {
        policy_id: policyRow.policy_id,
        policy_name: policyRow.policy_name,
        leave_type: typeName,
        allocated_days: allocatedDays,
        used_days: usedDays,
        remaining_days: Math.max(0, allocatedDays - usedDays),
      };
    });

    const totalAllocated = balanceRows.reduce((sum, row) => sum + Number(row.allocated_days || 0), 0);
    const totalUsed = balanceRows.reduce((sum, row) => sum + Number(row.used_days || 0), 0);

    return res.json({
      success: true,
      data: balanceRows,
      summary: {
        employee_id: Number(employeeId),
        policy_id: policyRow.policy_id,
        policy_name: policyRow.policy_name,
        used_days: totalUsed,
        remaining_days: Math.max(0, totalAllocated - totalUsed),
      },
    });
  } catch (err) {
    console.error("getLeaveBalance ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error ❌" });
  }
};