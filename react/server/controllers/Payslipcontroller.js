import db from "../config/db.js";

// ─── DB helper ────────────────────────────────────────────────────────────────
const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.execute(sql, params, (err, rows) => {
      if (err) { console.error("DB ERR:", err.message); reject(err); }
      else resolve(rows);
    });
  });

const executeQuery = q; // Alias for consistency

const toNum = (v) => Number(v || 0);

// ─── Get employee shift ──────────────────────────────────────────────────────
const getEmployeeShift = async (employee_id) => {
  const rows = await executeQuery(
    `SELECT os.* FROM employees e 
     LEFT JOIN office_shifts os ON e.office_shift_id = os.id 
     WHERE e.id = ?`,
    [employee_id]
  );
  return rows[0] || null;
};

// ─── Get day of week name ────────────────────────────────────────────────────
const getDayName = (date) =>
  new Date(date).toLocaleString("en-US", { weekday: "long" }).toLowerCase();

// ─── FIXED ATTENDANCE SUMMARY - Counts ALL days and properly identifies absence ───
// Logik: For each day in the month:
//   - Has attendance record? Yes → use its status
//   - No record? → ABSENT (employee didn't mark attendance)
//   - Weekoff (shift has null in/out) → PAID, not counted as absent
//   - Holiday (calendar_events with is_holiday_marked=1) → PAID, not counted as absent
// ─────────────────────────────────────────────────────────────────────────────
const getAttendanceSummary = async (employee_id, month, year, shiftId) => {
  // Get employee's shift for weekoff detection
  let shift = null;
  if (shiftId) {
    const shiftRows = await executeQuery(
      `SELECT * FROM office_shifts WHERE id = ?`,
      [shiftId]
    );
    shift = shiftRows[0] || null;
  }
  
  // Get all dates in the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // last day of month
  const totalDaysInMonth = endDate.getDate();
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(totalDaysInMonth).padStart(2, '0')}`;
  
  // Get all holidays for this month
  const holidays = await executeQuery(
    `SELECT DATE(event_date) as event_date FROM calendar_events 
     WHERE is_holiday_marked = 1 
     AND YEAR(event_date) = ? 
     AND MONTH(event_date) = ?`,
    [year, month]
  );
  const holidaySet = new Set();
  holidays.forEach(h => {
    if (h.event_date) {
      const dateStr = h.event_date instanceof Date 
        ? h.event_date.toISOString().split('T')[0]
        : String(h.event_date).split('T')[0];
      holidaySet.add(dateStr);
    }
  });
  
  // Get existing attendance records for this employee for the month
  const attendanceRecords = await executeQuery(
    `SELECT attendance_date, attendance_status, clock_in 
     FROM attendances 
     WHERE employee_id = ? 
     AND YEAR(attendance_date) = ? 
     AND MONTH(attendance_date) = ?`,
    [employee_id, year, month]
  );
  
  // Build map of attendance by date
  const attendanceMap = new Map();
  attendanceRecords.forEach(rec => {
    let dateStr;
    if (rec.attendance_date instanceof Date) {
      dateStr = rec.attendance_date.toISOString().split('T')[0];
    } else {
      dateStr = String(rec.attendance_date).split('T')[0];
    }
    attendanceMap.set(dateStr, rec.attendance_status);
  });
  
  // Step 1: Fetch approved leave applications for the employee that overlap with the month
  const leaveApplications = await executeQuery(
    `SELECT leave_type, DATE(start_date) as start_date, DATE(end_date) as end_date 
     FROM leave_applications 
     WHERE employee_id = ? 
     AND status = 'approved'
     AND DATE(start_date) <= ? 
     AND DATE(end_date) >= ?`,
    [employee_id, monthEnd, monthStart]
  );
  
  // Step 2: Fetch the employee's leave policy and build paid/unpaid map
  let isPaidMap = {}; // key: leave_type (lowercased), value: isPaid boolean
  try {
    const policyRows = await executeQuery(
      `SELECT lp.leaves 
       FROM leave_policies lp 
       JOIN employees e ON e.leave_policy_id = lp.id 
       WHERE e.id = ?`,
      [employee_id]
    );
    
    if (policyRows.length > 0 && policyRows[0].leaves) {
      let leavesArray = policyRows[0].leaves;
      if (typeof leavesArray === 'string') {
        leavesArray = JSON.parse(leavesArray);
      }
      
      // Build map with normalized keys
      if (Array.isArray(leavesArray)) {
        leavesArray.forEach(item => {
          const key = (item.type || '').toLowerCase().trim();
          if (key) {
            isPaidMap[key] = typeof item.isPaid === 'boolean' ? item.isPaid : true;
          }
        });
      }
    }
  } catch (e) {
    console.error("Error fetching leave policy:", e.message);
    // If error, default all leaves to paid
  }
  
  // Step 3: Build a Set of unpaid leave dates
  const unpaidLeaveDates = new Set();
  leaveApplications.forEach(app => {
    const leaveTypeKey = (app.leave_type || '').toLowerCase().trim();
    const isPaid = isPaidMap[leaveTypeKey] !== false; // default to true if missing
    
    if (!isPaid) {
      // Expand start_date to end_date into individual date strings
      let currentDate = new Date(app.start_date);
      const endDate = new Date(app.end_date);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        // Only add if date is within the payslip month
        if (dateStr >= monthStart && dateStr <= monthEnd) {
          unpaidLeaveDates.add(dateStr);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });
  
  // Initialize counters
  let present_days = 0;
  let leave_days = 0;
  let holiday_days = 0;
  let weekoff_days = 0;
  let halfday_days = 0;
  let absent_days = 0;
  
  // Loop through each day of the month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const currentDate = new Date(year, month - 1, d);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayName = getDayName(currentDate);
    
    // 1. Check if HOLIDAY
    if (holidaySet.has(dateStr)) {
      holiday_days++;
      continue;
    }
    
    // 2. Check if WEEK-OFF (shift has both in and out null/empty for that day)
    if (shift) {
      const dayIn = shift[`${dayName}_in`];
      const dayOut = shift[`${dayName}_out`];
      if ((!dayIn || dayIn === '') && (!dayOut || dayOut === '')) {
        weekoff_days++;
        continue;
      }
    }
    
    // 3. Check attendance record
    const attendanceStatus = attendanceMap.get(dateStr);
    
    if (!attendanceStatus) {
      // NO RECORD = ABSENT
      absent_days++;
    } else if (attendanceStatus === 'present') {
      present_days++;
    } else if (attendanceStatus === 'leave') {
      // Step 4: Check if this leave date is unpaid
      if (unpaidLeaveDates.has(dateStr)) {
        absent_days++; // Unpaid leave counts as absent for deduction
      } else {
        leave_days++; // Paid leave (default)
      }
    } else if (attendanceStatus === 'half-day') {
      halfday_days++;
      present_days++; // half-day counts as present for salary (full pay)
    } else if (attendanceStatus === 'absent') {
      absent_days++;
    }
    // 'holiday' and 'weekoff' are already handled above in loops
  }
  
  // working_days = total days - weekoffs - holidays
  const working_days = totalDaysInMonth - weekoff_days - holiday_days;
  
  return { 
    present_days, 
    absent_days, 
    leave_days, 
    holiday_days, 
    weekoff_days, 
    halfday_days, 
    working_days,
    total_days_in_month: totalDaysInMonth
  };
};

// ─── Salary math — mirrors MySetSalary.jsx exactly ───────────────────────────
const calcTDS = (grossMonthly, pfMonthly) => {
  if (!grossMonthly || grossMonthly <= 0) return 0;
  const annual  = grossMonthly * 12;
  const taxable = Math.max(0, annual - 50_000 - pfMonthly * 12);
  let tax = 0;
  if      (taxable <= 250_000)   tax = 0;
  else if (taxable <= 500_000)   tax = (taxable - 250_000) * 0.05;
  else if (taxable <= 1_000_000) tax = 12_500 + (taxable - 500_000) * 0.20;
  else                           tax = 112_500 + (taxable - 1_000_000) * 0.30;
  return (tax * 1.04) / 12;
};

const buildBreakdown = (earningRows, deductionRows, monthlyCtc) => {
  const basicRow = earningRows.find(
    (r) => (r.component || "").toLowerCase() === "basic" && toNum(r.is_active) === 1
  );
  const basicAmount = basicRow
    ? basicRow.type === "percentage"
      ? (monthlyCtc * toNum(basicRow.value)) / 100
      : toNum(basicRow.value)
    : 0;

  const resolveBase = (basedOn) =>
    (basedOn || "CTC").toLowerCase() === "basic" ? basicAmount : monthlyCtc;

  // pass-1: gross without TDS
  const amountNoTDS = (r) => {
    const c = (r.component || "").toLowerCase().trim();
    if (c === "pf")  return Math.min(basicAmount, 15_000) * 0.12;
    if (c === "tds") return 0;
    return r.type === "percentage"
      ? (resolveBase(r.basedOn || r.based_on) * toNum(r.value)) / 100
      : toNum(r.value);
  };

  const grossBeforeTDS = earningRows
    .filter((r) => toNum(r.is_active) === 1)
    .reduce((s, r) => s + amountNoTDS(r), 0);

  // pass-2: full amount with TDS
  const amount = (r) => {
    const c = (r.component || "").toLowerCase().trim();
    if (c === "pf")  return Math.min(basicAmount, 15_000) * 0.12;
    if (c === "tds") {
      const pfDedRow = deductionRows.find(
        (x) => (x.component || "").toLowerCase() === "pf" && toNum(x.is_active) === 1
      );
      const pfDed = pfDedRow ? Math.min(basicAmount, 15_000) * 0.12 : 0;
      return calcTDS(grossBeforeTDS, pfDed);
    }
    return r.type === "percentage"
      ? (resolveBase(r.basedOn || r.based_on) * toNum(r.value)) / 100
      : toNum(r.value);
  };

  const activeEarnings   = earningRows.filter((r) => toNum(r.is_active) === 1);
  const activeDeductions = deductionRows.filter((r) => toNum(r.is_active) === 1);

  const grossSalary     = activeEarnings.reduce((s, r) => s + amount(r), 0);
  const totalDeductions = activeDeductions.reduce((s, r) => s + amount(r), 0);

  return {
    grossSalary,
    totalDeductions,
    netSalary:           grossSalary - totalDeductions,
    earningsBreakdown:   activeEarnings.map((r) => ({ component: r.component, amount: amount(r) })),
    deductionsBreakdown: activeDeductions.map((r) => ({ component: r.component, amount: amount(r) })),
  };
};

// ─── Fetch salary + component rows ───────────────────────────────────────────
const getSalaryData = async (employee_id) => {
  const [salaryRow] = await executeQuery(
    `SELECT * FROM employee_salary WHERE employee_id = ?`, [employee_id]
  );
  if (!salaryRow) return null;

  // prefer per-employee overrides; fall back to policy-level rows
  let earnings = await executeQuery(
    `SELECT component, type, value, basedOn, is_active
     FROM employee_salary_earnings WHERE employee_id = ?`, [employee_id]
  );
  let deductions = await executeQuery(
    `SELECT component, type, value, basedOn, is_active
     FROM employee_salary_deductions WHERE employee_id = ?`, [employee_id]
  );

  if (!earnings.length) {
    earnings = await executeQuery(
      `SELECT component, type, value, is_active
       FROM salary_policy_earnings WHERE policy_id = ?`, [salaryRow.policy_id]
    );
  }
  if (!deductions.length) {
    deductions = await executeQuery(
      `SELECT component, type, value, is_active
       FROM salary_policy_deductions WHERE policy_id = ?`, [salaryRow.policy_id]
    );
  }

  return { salaryRow, earnings, deductions };
};

// =============================================================================
// GET /api/payslips/preview?employee_id=&month=&year=
// No DB write — used by the Generate modal on PaySlip.jsx
// =============================================================================
export const previewPayslip = async (req, res) => {
  const { employee_id, month, year } = req.query;
  if (!employee_id || !month || !year)
    return res.status(400).json({ message: "employee_id, month, year required" });

  try {
    const salaryData = await getSalaryData(employee_id);
    if (!salaryData)
      return res.status(404).json({ message: "No salary configured for this employee." });

    // Get employee's shift ID
    const [empRow] = await executeQuery(
      `SELECT office_shift_id FROM employees WHERE id = ?`,
      [employee_id]
    );
    const shiftId = empRow?.office_shift_id || null;

    // Use FIXED attendance summary that properly counts missing days as absent
    const att = await getAttendanceSummary(employee_id, month, year, shiftId);
    
    const { salaryRow, earnings, deductions } = salaryData;
    const monthlyCtc = toNum(salaryRow.annual_ctc) / 12;
    
    const { grossSalary, totalDeductions, netSalary, earningsBreakdown, deductionsBreakdown } =
      buildBreakdown(earnings, deductions, monthlyCtc);

    // Per day = Gross ÷ 30 (not actual days in month)
  const perDayRate =
  att.working_days > 0
    ? grossSalary / att.working_days
    : 0;
    const absenceDeduction = att.absent_days * perDayRate;
    const finalNet = netSalary - absenceDeduction;

    const existing = await executeQuery(
      `SELECT id FROM payslips WHERE employee_id = ? AND salary_month = ? AND salary_year = ?`,
      [employee_id, month, year]
    );

    return res.json({
      alreadyGenerated: existing.length > 0,
      existing_payslip_id: existing[0]?.id || null,
      attendance: {
        ...att,
        // Add debug info
        total_days_in_month: att.total_days_in_month,
        deduction_rule: "Absent days are days with NO attendance record OR marked as 'absent'",
        per_day_rate: perDayRate
      },
      salary: {
        annual_ctc: toNum(salaryRow.annual_ctc),
        monthly_ctc: monthlyCtc,
        gross_salary: grossSalary,
        per_day_rate: perDayRate,
        absence_deduction: absenceDeduction,
        policy_deductions: totalDeductions,
        net_salary: finalNet,
        earnings: earningsBreakdown,
        deductions: deductionsBreakdown,
      },
    });
  } catch (err) {
    console.error("previewPayslip:", err);
    return res.status(500).json({ message: "Database error", error: err.message });
  }
};

// =============================================================================
// POST /api/payslips/generate   body: { employee_id, month, year }
// =============================================================================
export const generatePayslip = async (req, res) => {
  const { employee_id, month, year } = req.body;
  const generated_by = req.user?.user_id || req.user?.id || null;
  const company_id   = req.user?.company_id || 1;

  if (!employee_id || !month || !year)
    return res.status(400).json({ message: "employee_id, month, year required" });

  try {
    // prevent duplicate
    const existing = await executeQuery(
      `SELECT id FROM payslips WHERE employee_id = ? AND salary_month = ? AND salary_year = ?`,
      [employee_id, month, year]
    );
    if (existing.length)
      return res.status(409).json({
        message: "Payslip already generated for this month.",
        payslip_id: existing[0].id,
        alreadyExists: true,
      });

    // Get employee's shift ID
    const [empRow] = await executeQuery(
      `SELECT office_shift_id FROM employees WHERE id = ?`,
      [employee_id]
    );
    const shiftId = empRow?.office_shift_id || null;

    const salaryData = await getSalaryData(employee_id);
    if (!salaryData)
      return res.status(404).json({ message: "No salary configured for this employee." });

    const { salaryRow, earnings, deductions } = salaryData;
    const monthlyCtc = toNum(salaryRow.annual_ctc) / 12;
    const att = await getAttendanceSummary(employee_id, month, year, shiftId);
    const { grossSalary, totalDeductions, netSalary, earningsBreakdown, deductionsBreakdown } =
      buildBreakdown(earnings, deductions, monthlyCtc);

   const perDayRate =
  att.working_days > 0
    ? grossSalary / att.working_days
    : 0;
    const absenceDeduction = att.absent_days * perDayRate;
    const finalNet         = netSalary - absenceDeduction;

    const [policyRow] = await executeQuery(
      `SELECT title FROM salary_policies WHERE id = ?`, [salaryRow.policy_id]
    );

    // immutable snapshot stored in payslip_data column
    const snapshot = {
      policy_id:         salaryRow.policy_id,
      policy_name:       policyRow?.title || null,
      annual_ctc:        toNum(salaryRow.annual_ctc),
      monthly_ctc:       monthlyCtc,
      gross_salary:      grossSalary,
      per_day_rate:      perDayRate,
      absence_deduction: absenceDeduction,
      policy_deductions: totalDeductions,
      net_salary:        finalNet,
      earnings:          earningsBreakdown,
      deductions:        deductionsBreakdown,
      attendance:        att,
    };

    const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthYear  = `${MONTH_ABBR[month - 1]}-${year}`;
    const payslipKey = `PS-${employee_id}-${monthYear}`;

    const result = await executeQuery(
      `INSERT INTO payslips (
         employee_id, company_id, payslip_key,
         payment_type, basic_salary, net_salary,
         allowances, commissions, loans, deductions, overtimes, other_payments,
         pension_type, pension_amount, hours_worked, status,
         month_year, salary_month, salary_year,
         working_days, present_days, absent_days, leave_days,
         holiday_days, weekoff_days, halfday_days,
         gross_salary, total_deductions, absence_deduction,
         payslip_data, generated_by,
         created_at, updated_at
       ) VALUES (
         ?,?,?,
         'monthly',?,?,
         '[]','[]','[]','[]','[]','[]',
         NULL,0,0,0,
         ?,?,?,
         ?,?,?,?,
         ?,?,?,
         ?,?,?,
         ?,?,
         NOW(),NOW()
       )`,
      [
        employee_id, company_id, payslipKey,
        grossSalary, finalNet,
        monthYear, month, year,
        att.working_days, att.present_days, att.absent_days, att.leave_days,
        att.holiday_days, att.weekoff_days, att.halfday_days,
        grossSalary, totalDeductions, absenceDeduction,
        JSON.stringify(snapshot), generated_by,
      ]
    );

    return res.json({
      message:    "Payslip generated successfully ✅",
      payslip_id: result.insertId,
      summary: {
        month_year:        monthYear,
        working_days:      att.working_days,
        present_days:      att.present_days,
        absent_days:       att.absent_days,
        gross_salary:      grossSalary,
        per_day_rate:      perDayRate,
        absence_deduction: absenceDeduction,
        policy_deductions: totalDeductions,
        net_salary:        finalNet,
      },
    });
  } catch (err) {
    console.error("generatePayslip:", err);
    return res.status(500).json({ message: "Database error", error: err.message });
  }
};

// =============================================================================
// GET /api/payslips?employee_id=X
// =============================================================================
export const getPayslips = async (req, res) => {
  const { employee_id } = req.query;
  if (!employee_id)
    return res.status(400).json({ message: "employee_id required" });

  try {
    const rows = await executeQuery(
      `SELECT
         id, month_year, salary_month, salary_year,
         gross_salary, net_salary, absent_days, absence_deduction,
         present_days, leave_days, working_days, halfday_days,
         status, payslip_data, created_at
       FROM payslips
       WHERE employee_id  = ?
         AND salary_month IS NOT NULL
       ORDER BY salary_year DESC, salary_month DESC`,
      [employee_id]
    );

    const MONTHS = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];

    const data = rows.map((r) => ({
      ...r,
      payslip_data:  r.payslip_data ? JSON.parse(r.payslip_data) : null,
      salaryMonth:   `${MONTHS[(r.salary_month || 1) - 1]} ${r.salary_year}`,
      payrollDate:   r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-IN")
        : "-",
      netSalaryFmt:  `₹ ${toNum(r.net_salary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      statusLabel:   r.status === 1 ? "Paid" : "Generated",
    }));

    return res.json({ data });
  } catch (err) {
    console.error("getPayslips:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

// =============================================================================
// GET /api/payslips/:id   — full detail for PDF view
// =============================================================================
export const getPayslipById = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await executeQuery(
      `SELECT
         p.*,
         CONCAT(e.first_name,' ',e.last_name) AS employee_name,
         e.staff_id, e.email, e.pf_uan_number, e.esic_ip_number, e.photo,
         des.designation_name,
         dep.department_name,
         c.company_name, c.addressLine AS company_address
       FROM payslips p
       JOIN  employees   e   ON e.id   = p.employee_id
       LEFT JOIN designations des ON des.id = e.designation_id
       LEFT JOIN departments  dep ON dep.id = e.department_id
       LEFT JOIN companies    c   ON c.id   = p.company_id
       WHERE p.id = ?`,
      [id]
    );
    if (!row) return res.status(404).json({ message: "Payslip not found" });

    return res.json({
      ...row,
      payslip_data: row.payslip_data ? JSON.parse(row.payslip_data) : null,
    });
  } catch (err) {
    console.error("getPayslipById:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

// =============================================================================
// DELETE /api/payslips/:id   (admin only)
// =============================================================================
export const deletePayslip = async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery(`DELETE FROM payslips WHERE id = ?`, [id]);
    return res.json({ message: "Payslip deleted" });
  } catch (err) {
    console.error("deletePayslip:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

export const getAvailableEmployees = async (req, res) => {
  try {
    const { month, year } = req.query;

    const rows = await executeQuery(
      `
      SELECT
        e.id,
        CONCAT(e.first_name, ' ', e.last_name) AS name,
        e.staff_id
      FROM employees e
      WHERE e.is_active = 1
      AND e.id NOT IN (
        SELECT employee_id
        FROM payslips
        WHERE salary_month = ?
        AND salary_year = ?
      )
      ORDER BY e.first_name ASC
      `,
      [month, year]
    );

    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch employees",
    });
  }
};

export const getPayslipsByMonth = async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year)
    return res.status(400).json({ message: "month and year required" });
 
  try {
    const rows = await executeQuery(
      `SELECT
         p.id, p.employee_id, p.month_year, p.salary_month, p.salary_year,
         p.gross_salary, p.net_salary, p.absent_days, p.absence_deduction,
         p.present_days, p.leave_days, p.working_days, p.halfday_days,
         p.status, p.created_at,
         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
         e.staff_id
       FROM payslips p
       JOIN employees e ON e.id = p.employee_id
       WHERE p.salary_month = ? AND p.salary_year = ?
       ORDER BY e.first_name ASC`,
      [month, year]
    );
 
    const MONTHS = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];
 
    const data = rows.map((r) => ({
      ...r,
      salaryMonth:  `${MONTHS[(r.salary_month || 1) - 1]} ${r.salary_year}`,
      netSalaryFmt: `₹ ${toNum(r.net_salary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      statusLabel:  r.status === 1 ? "Paid" : "Generated",
    }));
 
    return res.json({ data });
  } catch (err) {
    console.error("getPayslipsByMonth:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

// =============================================================================
// PUT /api/payslips/:id/status   — Toggle payslip status between 0 (unpaid) and 1 (paid)
// =============================================================================
export const updatePayslipStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (id === undefined || status === undefined)
    return res.status(400).json({ message: "id and status required" });

  if (status !== 0 && status !== 1)
    return res.status(400).json({ message: "status must be 0 (unpaid) or 1 (paid)" });

  try {
    await executeQuery(
      `UPDATE payslips SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    res.json({
      success: true,
      message: status === 1 ? "Marked as Paid ✅" : "Marked as Unpaid ↻",
      status: status,
    });
  } catch (err) {
    console.error("updatePayslipStatus:", err);
    return res.status(500).json({ message: "Database error", error: err.message });
  }
};