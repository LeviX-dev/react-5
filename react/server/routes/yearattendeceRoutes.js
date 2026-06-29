/**
 * =============================================================================
 * ATTENDANCE MODULE — Routes & Flow Documentation
 * File: server/routes/yearattendeceRoutes.js
 * Controller: server/controllers/yearattendeceController.js
 * Regularization Controller: server/controllers/regularizationController.js
 * =============================================================================
 *
 * DATABASE TABLES INVOLVED
 * ─────────────────────────
 *  attendances             — one row per (employee_id, attendance_ date).
 *                            Stores: clock_in, clock_out, total_work, total_rest,
 *                            attendance_status, time_late, early_leaving, overtime.
 *  attendance_logs         — one row per individual check-in/check-out session.
 *                            A single attendance day can have multiple log rows.
 *  attendance_regularizations — employee-submitted correction requests.
 *  employees               — employee master; holds office_shift_id, location_id,
 *                            attendance_method, department_id, designation_id.
 *  office_shifts           — per-weekday in/out times (monday_in … sunday_out).
 *  calendar_events         — holidays flagged with is_holiday_marked = 1.
 *  leave_applications      — approved leave ranges used for status resolution.
 *  geo_locations           — office geo-fence centres (latitude, longitude, radius).
 *
 * SHARED HELPER FUNCTIONS (yearattendeceController.js)
 * ──────────────────────────────────────────────────────
 *  executeQuery(query, params)               — Promisified db.execute wrapper.
 *  formatTime(minutes)                       — Converts total minutes to "HH:MM" string.
 *  formatDate(date)                          — Returns "YYYY-MM-DD" from a Date object.
 *  formatTimeStr(dt)                         — Extracts "HH:MM" from a datetime string or Date.
 *  formatDateTimeStr(dt)                     — Returns "YYYY-MM-DD HH:MM:SS" for MySQL inserts.
 *  getDayName(date)                          — Returns lowercase weekday name (e.g. "monday").
 *  isWeekOffShiftDay(shift, dayName)         — Returns true when both shift_in and shift_out
 *                                              are null/empty for that weekday (= weekly off).
 *  getEmployeeShift(employee_id, date)       — Looks up shift row for the employee;
 *                                              returns { shift_start, shift_end,
 *                                              isNextDayShift, shiftStartHour }.
 *                                              Falls back to 09:30–18:30 if none found.
 *  combineDateTime(date, time, ...)          — Combines a date string and "HH:MM" time into
 *                                              "YYYY-MM-DD HH:MM:SS", bumping day for night
 *                                              shifts that cross midnight.
 *  calcLogTotals(logs, dateStr)              — Iterates all attendance_logs for a day,
 *                                              sums working minutes, rest gaps between
 *                                              sessions, and tracks firstIn / lastOut.
 *  calcShiftDeviations(firstIn, lastOut, …)  — Calculates late, early_leaving, overtime
 *                                              strings relative to shift start/end times.
 *  recalcAndUpsertAttendance(...)            — Core upsert helper: calls calcLogTotals +
 *                                              calcShiftDeviations, then executes an
 *                                              INSERT … ON DUPLICATE KEY UPDATE into
 *                                              attendances.
 *  validateGeoFence(employee_id, lat, lon)   — If employee.attendance_method = 'geofence'
 *                                              and location_id is set, calculates Haversine
 *                                              distance from the office centre; returns
 *                                              { valid: false, error } if outside radius.
 *  calculateHaversineDistance(lat1,lon1,…)   — Raw Haversine formula (returns metres).
 *
 * =============================================================================
 * ENDPOINT FLOWS — DETAILED
 * =============================================================================
 *
 * ── DASHBOARD ──────────────────────────────────────────────────────────────
 *
 * GET /dashboard/stats?date=YYYY-MM-DD
 *   Controller : getDashboardStats
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. Validates that `date` query param is present.
 *     2. Runs a single SQL query joining employees + attendances for the date.
 *     3. Returns { totalEmployees, present, late, earlyLeaving } counts.
 *   Response   : { totalEmployees: N, present: N, late: N, earlyLeaving: N }
 *
 * GET /dashboard/monthly-stats?year=YYYY&month=M
 *   Controller : getDashboardMonthlyStats
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. Validates year + month query params.
 *     2. Groups attendances by date for the requested month, counting late and
 *        early_leaving occurrences per day.
 *   Response   : [{ date, late_count, early_count }, …]
 *
 * GET /dashboard/20day-trend
 *   Controller : getDashboard20DayTrend
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. No params required — automatically looks back 19 days from CURDATE().
 *     2. Returns present_count, absent_count, late_count per day.
 *   Response   : [{ date, present_count, absent_count, late_count }, …]
 *
 * ── YEARLY GENERATION ──────────────────────────────────────────────────────
 *
 * POST /generate-year
 *   Controller : generateYearAttendance
 *   Auth       : Admin (expected; no role check in controller)
 *   Body       : { year: number }
 *   Flow:
 *     1. Fetches all active employees.
 *     2. Loads all calendar holidays for the given year into a Set.
 *     3. Loads all office_shifts into a map.
 *     4. For each employee, iterates every day of the year (365/366 days):
 *        a. Default status = "absent".
 *        b. If the date is a holiday → "holiday".
 *        c. Else if the employee's shift has null in/out for that weekday → "weekoff".
 *        d. Builds bulk INSERT values.
 *     5. Executes a bulk INSERT … ON DUPLICATE KEY UPDATE per employee.
 *        BUG FIX: Only overwrites attendance_status when clock_in IS NULL
 *        (i.e. no real check-in data), so existing present records are preserved.
 *   Response   : { success: true, message: "Year attendance generated" }
 *
 * ── UTILITY LOOKUPS ────────────────────────────────────────────────────────
 *
 * GET /today-shift
 *   Controller : getTodayShift
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. Detects today's weekday name.
 *     2. Returns each active employee's name plus today's shift in/out times
 *        from office_shifts (via LEFT JOIN).
 *   Response   : [{ first_name, last_name, <day>_in, <day>_out }, …]
 *
 * GET /today-holiday
 *   Controller : getTodayHoliday
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. Queries calendar_events for today's date with is_holiday_marked = 1.
 *   Response   : [{ title }, …]  — empty array if not a holiday.
 *
 * ── REGULARIZATION CRUD ────────────────────────────────────────────────────
 *
 * GET /attendance/regularization
 *   Controller : getRegularizations
 *   Auth       : JWT (role-aware)
 *   Query      : employee_id?, department_id?, from_date?, to_date?, status?
 *   Flow:
 *     1. Non-admin users are forced to see only their own employee_id records.
 *     2. Admin can filter by employee_id, department_id, date range, or status.
 *     3. Joins attendance_regularizations with employees for display name.
 *     4. Results ordered by date DESC, created_at DESC.
 *   Response   : [{ id, employee_id, employee, date, clock_in, clock_out,
 *                   reason, status, created_at }, …]
 *
 * POST /attendance/regularization
 *   Controller : createRegularization
 *   Auth       : JWT (role-aware)
 *   Body       : { employee_id, date, clock_in?, clock_out?, reason, status? }
 *   Flow:
 *     1. Validates employee_id, date, reason are present.
 *     2. Non-admin: rejects submission for any employee_id != their own.
 *     3. Inserts into attendance_regularizations with status defaulting to "pending".
 *   Response   : { message, id: insertId }  HTTP 201
 *
 * PUT /attendance/regularization/:id
 *   Controller : updateRegularization
 *   Auth       : JWT (role-aware)
 *   Body       : { clock_in?, clock_out?, reason?, status? }
 *   Flow:
 *     1. Fetches existing record by :id; 404 if missing.
 *     2. Non-admin: can only edit their own record, only if status = "pending".
 *     3. Only admins may change `status`; valid values: pending/approved/rejected.
 *     4. Builds dynamic SET clause from provided fields; 400 if nothing to update.
 *     5. Executes UPDATE.
 *   Response   : { message: "Regularization request updated." }
 *
 * DELETE /attendance/regularization/:id
 *   Controller : deleteRegularization
 *   Auth       : Admin only
 *   Flow:
 *     1. Rejects with 403 if caller is not admin.
 *     2. Deletes attendance_regularizations row by :id.
 *     3. Returns 404 if no rows affected.
 *   Response   : { message: "Regularization request deleted." }
 *
 * ── ATTENDANCE LIST & REPORTS ───────────────────────────────────────────────
 *
 * GET /attendance/by-date?date=YYYY-MM-DD[&employee_id=N&department_id=N&designation_id=N]
 *   Controller : getAttendanceByDate
 *   Auth       : JWT (role-aware)
 *   Flow:
 *     1. Non-admin callers have employee_id forced to their own id.
 *     2. If employee_id is provided (or forced): fetches attendance for the full
 *        month (from selected date to month-end) for that one employee, plus all
 *        their logs and approved leaves for that range.
 *     3. If no employee_id (admin view): fetches ALL employees' attendance for
 *        exactly the requested date.
 *     4. Runs 5 parallel queries (employees, attendances, leaves, holidays, logs)
 *        via Promise.all.
 *     5. Builds lookup maps: attendanceMap, logsMap, leaveMap, holidayMap.
 *     6. Status resolution priority per day:
 *        holiday  → leave  → record.attendance_status  → weekoff  → absent
 *     7. Attaches the logs array for each day to each result row.
 *   Response   : [{ ...employeeFields, attendance_date, attendance_status,
 *                   logs: [{id, clock_in, clock_out}] }, …]
 *
 * GET /attendance/summary-by-date?date=YYYY-MM-DD
 *   Controller : getAttendanceSummaryByDate
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. Single SQL query joining employees, attendances, attendance_logs,
 *        departments, designations, roles for a given date.
 *     2. Groups by employee; aggregates MIN(clock_in) and MAX(clock_out).
 *   Response   : [{ employee_id, employee, department_name, designation_name,
 *                   role_name, attendance_status, total_work,
 *                   first_clock_in, last_clock_out }, …]
 *
 * GET /attendance/range?employee_id=N&from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
 *   Controller : getAttendanceRange
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. Fetches employee info (name, department, designation, company, shift).
 *     2. Loads approved leave dates for the range into a Set (iterates multi-day
 *        leave spans day by day).
 *     3. Loads holiday dates for the range into a Set.
 *     4. Iterates each day from from_date to to_date:
 *        a. Determines status: holiday > leave > weekoff > absent.
 *        b. Fetches attendance_logs for that day.
 *        c. If logs exist and status is not already holiday/leave/weekoff → "present".
 *        d. Calls calcLogTotals + calcShiftDeviations for present days.
 *     5. Returns a per-day array with all computed fields.
 *   Response   : [{ employee, department_name, designation_name, role_name,
 *                   company_name, attendance_date, attendance_status,
 *                   first_clock_in, last_clock_out, time_late, early_leaving,
 *                   overtime, total_work, total_rest, logs }, …]
 *
 * GET /attendance/month?employee_id=N&month=M&year=YYYY
 *   Controller : getAttendanceByMonth
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. Fetches employee record + shift.
 *     2. Loads holiday dates and approved leave date ranges for the month.
 *     3. Iterates all days in the month (1 → daysInMonth):
 *        a. Status priority: holiday > leave > weekoff > (check logs).
 *        b. If logs found and day is not holiday/leave/weekoff → "present".
 *        c. Calls calcLogTotals + calcShiftDeviations for present days only.
 *   Response   : [{ employee_id, employee, attendance_date, attendance_status,
 *                   first_clock_in, last_clock_out, time_late, early_leaving,
 *                   overtime, total_work, total_rest }, …]
 *
 * GET /attendance/daily-summary?date=YYYY-MM-DD[&department_id=N&designation_id=N]
 *   Controller : getDailyAttendanceSummary
 *   Auth       : JWT (any role)
 *   Flow:
 *     1. Optionally filters by department_id and/or designation_id.
 *     2. Single SQL query with LEFT JOINs to attendances and attendance_logs.
 *     3. attendance_status CASE logic:
 *        a. Uses stored attendance_status when available.
 *        b. If shift exists and both shift_in/out are empty → "weekoff".
 *        c. Otherwise → "absent".
 *     4. Aggregates MIN(clock_in), MAX(clock_out), SUM(work seconds) per employee.
 *   Response   : [{ employee_id, employee, department_name, designation_name,
 *                   role_name, attendance_status, first_clock_in,
 *                   last_clock_out, total_work }, …]
 *
 * ── WRITE OPERATIONS ────────────────────────────────────────────────────────
 *
 * POST /attendance/addnew
 *   Controller : addAttendanceNewController
 *   Auth       : Admin (expected)
 *   Body       : { employee_id, attendance_date, logs: [{clock_in, clock_out?}],
 *                  attendance_status, latitude?, longitude? }
 *   Flow:
 *     1. Validates employee_id and attendance_date.
 *     2. Runs geo-fence validation (validateGeoFence):
 *        — Only active if employee.attendance_method = 'geofence' and location_id set.
 *        — Rejects with 400 if distance > allowed radius.
 *     3. Loads employee shift (getEmployeeShift) for date/time combination logic.
 *     4. Filters logs to those with a non-empty clock_in.
 *     5. If status ≠ "present" AND no logs → upserts attendance_status only.
 *     6. Else DELETES all existing attendance_logs for that employee+date, then
 *        re-inserts each log using combineDateTime (handles overnight shifts).
 *     7. Calls recalcAndUpsertAttendance which:
 *        a. Runs calcLogTotals on the freshly fetched logs.
 *        b. Runs calcShiftDeviations.
 *        c. Upserts into attendances with all computed columns.
 *   Response   : { message, summary: { total_work, total_rest, late,
 *                  early_leaving, overtime } }
 *
 * PUT /attendance/update
 *   Controller : updateAttendanceController
 *   Auth       : Admin (expected)
 *   Body       : { employee_id, attendance_date, logs?: [...], attendance_status,
 *                  latitude?, longitude? }
 *   Flow: Identical to addnew (DELETE + re-INSERT logs) with same geo-fence and
 *         shift-deviation recalculation steps.
 *   Response   : { message: "Attendance updated successfully ✅" }
 *
 * DELETE /attendance/:id
 *   Controller : deleteAttendanceController
 *   Auth       : Admin (expected)
 *   Flow:
 *     1. Validates :id param.
 *     2. Deletes row from attendances by primary key id.
 *     3. Returns 404 if no rows affected.
 *   Response   : { message: "Attendance record deleted successfully" }
 *
 * DELETE /attendance/log/:log_id
 *   Controller : deleteLogController
 *   Auth       : Admin (expected)
 *   Flow:
 *     1. Validates :log_id param.
 *     2. Deletes the single row from attendance_logs by primary key.
 *     3. Returns 404 if no rows affected.
 *   Note: Does NOT automatically recalculate the parent attendances row.
 *   Response   : { message: "Log entry deleted successfully" }
 *
 * POST /attendance/checkin
 *   Controller : addCheckin
 *   Auth       : JWT (employee self-service)
 *   Body       : { employee_id, attendance_date, clock_in (HH:MM),
 *                  latitude?, longitude? }
 *   Flow:
 *     1. Validates required fields.
 *     2. Checks for any open (clock_out IS NULL) log for the same employee+date;
 *        rejects with 400 if one exists — employee must check out first.
 *     3. Runs geo-fence validation (validateGeoFence).
 *     4. Inserts a new row into attendance_logs with clock_out = NULL.
 *     5. Queries MIN(clock_in) from all logs for that day.
 *     6. Upserts attendances row: sets clock_in to earliest log, status = 'present'.
 *   Response   : { message: "Check-in saved", log_id }
 *
 * PUT /attendance/checkout
 *   Controller : updateCheckout
 *   Auth       : JWT (employee self-service)
 *   Body       : { log_id, clock_out (HH:MM), latitude?, longitude? }
 *   Flow:
 *     1. Validates log_id and clock_out.
 *     2. Looks up attendance_logs row by log_id to get employee_id + date.
 *     3. Runs geo-fence validation.
 *     4. Updates attendance_logs.clock_out for that log_id.
 *     5. Fetches employee shift.
 *     6. Fetches all logs for the day and calls recalcAndUpsertAttendance to
 *        recompute total_work, total_rest, late, early_leaving, overtime and
 *        upsert into attendances.
 *   Response   : { message: "Check-out saved", summary }
 *
 * POST /attendance/append
 *   Controller : appendAttendanceController
 *   Auth       : JWT (employee self-service or admin)
 *   Body       : { employee_id, attendance_date, logs: [{clock_in, clock_out?}],
 *                  attendance_status?, latitude?, longitude? }
 *   Flow:
 *     1. Validates required fields and runs geo-fence validation.
 *     2. Loads employee shift.
 *     3. Filters submitted logs to those with a non-empty clock_in.
 *     4. If status ≠ "present" and no new logs → updates status only, returns early.
 *     5. Converts each new log to a time interval using combineDateTime.
 *     6. Loads existing attendance_logs for the day.
 *     7. Checks for OVERLAP between:
 *        a. Each new interval vs. all existing intervals.
 *        b. Each new interval vs. every other new interval.
 *        Returns 400 with descriptive message on any overlap.
 *     8. Inserts only the new (non-overlapping) logs into attendance_logs.
 *     9. Calls recalcAndUpsertAttendance on ALL logs (old + new) to refresh
 *        attendances row.
 *   Response   : { message: "New entries added successfully ✅", summary }
 *
 * ── WILDCARD DETAIL ─────────────────────────────────────────────────────────
 *
 * GET /attendance/:employee_id?date=YYYY-MM-DD
 *   Controller : getAttendanceDetails
 *   Auth       : JWT (any role)
 *   Note       : MUST be declared last in the router to prevent catching
 *                named sub-paths like /regularization, /by-date, etc.
 *   Flow:
 *     1. Validates employee_id (URL param) and date (query param).
 *     2. Runs two parallel queries:
 *        a. attendances: fetches attendance_status + total_work for that day.
 *        b. attendance_logs: fetches all log rows for that day, formatting
 *           clock_in/clock_out as HH:MM strings.
 *   Response   : { attendance_status, total_work, logs: [{id, clock_in, clock_out}] }
 *
 * =============================================================================
 * STATUS RESOLUTION PRIORITY (used across multiple endpoints)
 * =============================================================================
 *  1. holiday   — date found in calendar_events with is_holiday_marked = 1
 *  2. leave     — date falls within an approved leave_application range
 *  3. weekoff   — employee's shift has null/empty in+out for that weekday
 *  4. present   — attendance_logs exist for the day (or explicit status set)
 *  5. absent    — default fallback
 *
 * =============================================================================
 * GEO-FENCE FLOW (applies to: checkin, checkout, append, addnew, update)
 * =============================================================================
 *  1. If latitude/longitude not provided in body → skip validation (returns valid).
 *  2. Load employee.attendance_method and employee.location_id.
 *  3. If attendance_method ≠ 'geofence' OR location_id is null → skip validation.
 *  4. Load geo_locations row (latitude, longitude, radius).
 *  5. Compute Haversine distance in metres between employee location and office.
 *  6. If distance > radius → return { valid: false, error: "...Xm from office..." }.
 *  7. Controller responds HTTP 400 with the error message.
 *
 * =============================================================================
 * OVERNIGHT / NIGHT-SHIFT HANDLING
 * =============================================================================
 *  - getEmployeeShift returns isNextDayShift = true when shift_end < shift_start.
 *  - combineDateTime bumps the date by +1 day for any time whose hour is before
 *    the shift start hour (i.e. the next calendar day for a night-shift checkout).
 *  - calcShiftDeviations adjusts shiftEndDT by +1 day when isNextDayShift is true.
 *
 * =============================================================================
 */

import express from "express";
import {
  addAttendanceNewController,
  addCheckin,
  appendAttendanceController,
  generateYearAttendance,
  getAttendanceByDate,
  getAttendanceByMonth,
  getAttendanceDetails,
  getAttendanceRange,
  getAttendanceSummaryByDate,
  getDailyAttendanceSummary,
  getTodayHoliday,
  getTodayShift,
  updateAttendanceController,
  updateCheckout,
  deleteAttendanceController,
  deleteLogController,
  // ✅ Dashboard aggregate endpoints
  getDashboardStats,
  getDashboardMonthlyStats,
  getDashboard20DayTrend,
} from "../controllers/yearattendeceController.js";

// ✅ NEW: regularization CRUD
import {
  getRegularizations,
  createRegularization,
  updateRegularization,
  deleteRegularization,
} from "../controllers/regularizationController.js";

// ✅ NEW: Live tracking endpoints
import {
  liveTrackingHeartbeat,
  getLiveTrackingHistory,
  getActiveLiveTracking,
  getCurrentSessionTracking,
  getHistoricalRoute,
  getLiveTrackingShiftStatus,
} from "../controllers/liveTrackingController.js";

const router = express.Router();

// ─────────────────────────────────────────────
// Dashboard aggregate routes  (must be before wildcards)
// ─────────────────────────────────────────────
router.get("/dashboard/stats",          getDashboardStats);        // ?date=YYYY-MM-DD
router.get("/dashboard/monthly-stats",  getDashboardMonthlyStats); // ?year=YYYY&month=M
router.get("/dashboard/20day-trend",    getDashboard20DayTrend);   // no params

// ─────────────────────────────────────────────
// Yearly generation (optional admin use)
// ─────────────────────────────────────────────
router.post("/generate-year", generateYearAttendance);

// ─────────────────────────────────────────────
// Utility lookups
// ─────────────────────────────────────────────
router.get("/today-shift",   getTodayShift);
router.get("/today-holiday", getTodayHoliday);

// ─────────────────────────────────────────────
// Regularization routes (before wildcard /attendance/:employee_id)
// ─────────────────────────────────────────────
router.get(    "/attendance/regularization",      getRegularizations);
router.post(   "/attendance/regularization",      createRegularization);
router.put(    "/attendance/regularization/:id",  updateRegularization);
router.delete( "/attendance/regularization/:id",  deleteRegularization);

// ─────────────────────────────────────────────
// Attendance list & reports
// ─────────────────────────────────────────────
router.get("/attendance/by-date",         getAttendanceByDate);
router.get("/attendance/summary-by-date", getAttendanceSummaryByDate);
router.get("/attendance/range",           getAttendanceRange);
router.get("/attendance/month",           getAttendanceByMonth);
router.get("/attendance/daily-summary",   getDailyAttendanceSummary);

// ─────────────────────────────────────────────
// Write operations
// ─────────────────────────────────────────────
router.post("/attendance/addnew",   addAttendanceNewController);
router.put( "/attendance/update",   updateAttendanceController);
router.delete( "/attendance/:id",   deleteAttendanceController);
router.delete( "/attendance/log/:log_id",   deleteLogController);
router.post("/attendance/checkin",  addCheckin);
router.put( "/attendance/checkout", updateCheckout);
router.post("/attendance/append",   appendAttendanceController);

// ─────────────────────────────────────────────
// Live tracking routes (for location_tracking attendance method)
// ─────────────────────────────────────────────
router.post("/attendance/live-tracking/heartbeat",    liveTrackingHeartbeat);
router.get("/attendance/live-tracking/shift-status",  getLiveTrackingShiftStatus);
router.get("/attendance/live-tracking/history/:employee_id", getLiveTrackingHistory);
router.get("/attendance/live-tracking/session/:employee_id", getCurrentSessionTracking);
router.get("/attendance/live-tracking/active",          getActiveLiveTracking);
router.get("/attendance/live-tracking/route/:employee_id",   getHistoricalRoute);

// ─────────────────────────────────────────────
// Wildcard detail route — must stay LAST
// ─────────────────────────────────────────────
router.get("/attendance/:employee_id", getAttendanceDetails);

export default router;