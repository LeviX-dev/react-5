import db from "../config/db.js";
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";  // top of file
import xlsx from "xlsx"; 

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{7,15}$/;
const VALID_GENDERS = new Set(["Male", "Female", "Other"]);
const VALID_ATTENDANCE_TYPES = new Set(["Daily", "Hourly"]);

const trimValue = (value) => (typeof value === "string" ? value.trim() : "");
const normalizePhone = (value) => trimValue(value).replace(/[\s\-().+]/g, "");
const isValidDateValue = (value) => value && !Number.isNaN(new Date(value).getTime());
const parsePositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const validateEmployeePayload = (payload, { companyId, requirePassword = false } = {}) => {
  const firstName = trimValue(payload.first_name);
  const lastName = trimValue(payload.last_name);
  const username = trimValue(payload.username);
  const email = trimValue(payload.email);
  const staffId = trimValue(payload.staff_id);
  const contactNo = trimValue(payload.contact_no);
  const dateOfBirth = trimValue(payload.date_of_birth);
  const gender = trimValue(payload.gender);
  const joiningDate = trimValue(payload.joining_date);
  const exitDate = trimValue(payload.exit_date);
  const attendanceType = trimValue(payload.attendance_type);

  const errors = [];

  if (!firstName) errors.push("First name is required");
  else if (firstName.length > 50) errors.push("First name must not exceed 50 characters");

  if (!lastName) errors.push("Last name is required");
  else if (lastName.length > 50) errors.push("Last name must not exceed 50 characters");

  if (!username) errors.push("Username is required");
  else if (username.length < 3) errors.push("Username must be at least 3 characters");
  else if (username.length > 50) errors.push("Username must not exceed 50 characters");

  if (!email) errors.push("Email is required");
  else if (!EMAIL_REGEX.test(email)) errors.push("Please enter a valid email address");

  if (requirePassword) {
    const password = trimValue(payload.password);
    if (!password) {
      errors.push("Password is required");
    } else if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
  }

  if (!staffId) errors.push("Staff ID is required");
  else if (staffId.length > 50) errors.push("Staff ID must not exceed 50 characters");

  if (contactNo) {
    const normalizedPhone = normalizePhone(contactNo);
    if (!PHONE_REGEX.test(normalizedPhone)) {
      errors.push("Contact number must contain 7-15 digits");
    }
  }

  if (dateOfBirth) {
    if (!isValidDateValue(dateOfBirth)) {
      errors.push("Please enter a valid date of birth");
    } else if (new Date(dateOfBirth) > new Date()) {
      errors.push("Date of birth cannot be a future date");
    }
  }

  if (!joiningDate) {
    errors.push("Joining date is required");
  } else if (!isValidDateValue(joiningDate)) {
    errors.push("Please enter a valid joining date");
  } else if (new Date(joiningDate) > new Date()) {
    errors.push("Joining date cannot be a future date");
  }

  if (exitDate) {
    if (!isValidDateValue(exitDate)) {
      errors.push("Please enter a valid leaving date");
    } else if (joiningDate && new Date(exitDate) < new Date(joiningDate)) {
      errors.push("Leaving date must be on or after joining date");
    }
  }

  if (gender && !VALID_GENDERS.has(gender)) {
    errors.push("Please select a valid gender");
  }

  if (!parsePositiveInt(companyId ?? payload.company_id)) {
    errors.push("Company is required");
  }

  if (!parsePositiveInt(payload.department_id)) errors.push("Department is required");
  if (!parsePositiveInt(payload.designation_id)) errors.push("Designation is required");
  if (!parsePositiveInt(payload.role_users_id)) errors.push("Role is required");
  if (!parsePositiveInt(payload.office_shift_id)) errors.push("Office shift is required");
  if (!parsePositiveInt(payload.location_id)) errors.push("Geo Location is required");

  if (!attendanceType) {
    errors.push("Attendance type is required");
  } else if (!VALID_ATTENDANCE_TYPES.has(attendanceType)) {
    errors.push("Attendance type is invalid");
  }

  if (payload.is_active !== undefined && payload.is_active !== null && payload.is_active !== "") {
    const status = Number(payload.is_active);
    if (status !== 0 && status !== 1) {
      errors.push("Status is invalid");
    }
  }

  return errors[0] || null;
};

export const getCompanies = (req, res) => {
  const sql = `
    SELECT id, company_name 
    FROM companies 
    WHERE is_active = 1 
    ORDER BY company_name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Company Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch companies",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// GET ALL DEPARTMENTS
export const getDepartments = (req, res) => {
  const { company_id } = req.query; // optional filter

  let sql = `
    SELECT id, department_name, company_id 
    FROM departments 
    WHERE (is_active = 1 OR is_active IS NULL)
  `;

  const params = [];

  // 👉 agar company select kare toh filter ho
  if (company_id) {
    sql += " AND company_id = ?";
    params.push(company_id);
  }

  sql += " ORDER BY department_name ASC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Department Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch departments",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// GET ALL DESIGNATIONS (company + department filter)
export const getDesignations = (req, res) => {
  const { company_id, department_id } = req.query;

  let sql = `
    SELECT id, designation_name, company_id, department_id
    FROM designations
    WHERE (is_active = 1 OR is_active IS NULL)
  `;

  const params = [];

  // 🔹 filter by company
  if (company_id) {
    sql += " AND company_id = ?";
    params.push(company_id);
  }

  // 🔹 filter by department
  if (department_id) {
    sql += " AND department_id = ?";
    params.push(department_id);
  }

  sql += " ORDER BY designation_name ASC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Designation Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch designations",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// GET OFFICE SHIFTS (company wise)
export const getOfficeShifts = (req, res) => {
  const { company_id } = req.query;

  let sql = `
    SELECT *
    FROM office_shifts
    WHERE 1=1
  `;

  const params = [];

  if (company_id) {
    sql += " AND company_id = ?";
    params.push(company_id);
  }

  sql += " ORDER BY shift_name ASC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Office Shift Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch office shifts",
      });
    }

    const formatted = result.map((item) => ({
      id: item.id,
      Company: item.company_id,
      Shift: item.shift_name,

      Monday: `${item.monday_in || ""} To ${item.monday_out || ""}`,
      Tuesday: `${item.tuesday_in || ""} To ${item.tuesday_out || ""}`,
      Wednesday: `${item.wednesday_in || ""} To ${item.wednesday_out || ""}`,
      Thursday: `${item.thursday_in || ""} To ${item.thursday_out || ""}`,
      Friday: `${item.friday_in || ""} To ${item.friday_out || ""}`,
      Saturday: `${item.saturday_in || ""} To ${item.saturday_out || ""}`,
      Sunday: `${item.sunday_in || ""} To ${item.sunday_out || ""}`,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  });
};

// GET ALL ROLES
export const getRoles = (req, res) => {
  const sql = `
    SELECT id, name 
    FROM roles 
    WHERE is_active = 1 OR is_active IS NULL
    ORDER BY name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Role Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch roles",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// export const addEmployee = async (req, res) => {
//   let connection;

//   try {
//     connection = await db.promise().getConnection();

//     const {
//       first_name,
//       last_name,
//       staff_id,
//       email,
//       contact_no,
//       password,
//       date_of_birth,
//       gender,
//       company_id,
//       department_id,
//       designation_id,
//       office_shift_id,
//       role_users_id,
//       joining_date,
//       state,
//       city,
//       zip_code,
//       country,
//       address,
//       attendance_type,
//       location_id,
//     } = req.body;

//     console.log("BODY DATA:", req.body);
//     console.log("Country:", country);
//     console.log("Address:", address);

//     console.log("📥 Data:", req.body);

//     // ✅ Validation
//     if (!first_name || !email || !password) {
//       return res.status(400).json({
//         message: "Required fields missing ❌",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ START TRANSACTION
//     await connection.beginTransaction();

//     // ================= USERS =================
//     const userSql = `
//       INSERT INTO users
//       (first_name, last_name, username, email, password, contact_no, role_users_id, is_active)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const username = req.body.username || email;
//     const roleId = role_users_id ? Number(role_users_id) : 1;

//     const [userResult] = await connection.query(userSql, [
//       first_name,
//       last_name,
//       username,
//       email,
//       hashedPassword,
//       contact_no,
//       roleId,
//       1,
//     ]);

//     const userId = userResult.insertId;
//     console.log("✅ User ID:", userId);

//     // ================= EMPLOYEE =================
//     const empSql = `
// INSERT INTO employees (
// id,
// first_name,
// last_name,
// staff_id,
// email,
// contact_no,
// date_of_birth,
// gender,
// office_shift_id,
// company_id,
// department_id,
// designation_id,
// role_users_id,
// joining_date,
// state,
// city,
// zip_code,
// country,
// address,
// attendance_type,
// location_id,
// is_active
// )
// VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
// `;

//     const shiftId = office_shift_id ? Number(office_shift_id) : null;
//     const companyId = company_id ? Number(company_id) : null;
//     const deptId = department_id ? Number(department_id) : null;
//     const desigId = designation_id ? Number(designation_id) : null;

//     const joinDate = joining_date || new Date().toISOString().slice(0, 10);

//     const [empResult] = await connection.query(empSql, [
//       userId,
//       first_name,
//       last_name,
//       staff_id,
//       email,
//       contact_no,
//       date_of_birth || null,
//       gender || null,
//       shiftId,
//       companyId,
//       deptId,
//       desigId,
//       roleId,
//       joinDate,
//       state || null,
//       city || null,
//       zip_code || null,
//       country || null,
//       address || null,
//       attendance_type || null,
//       location_id || null,
//       1,
//     ]);

//     console.log("✅ Employee ID:", empResult.insertId);

//     // ✅ COMMIT
//     await connection.commit();

//     res.json({
//       success: true,
//       message: "Employee Added Successfully ✅",
//       userId,
//       employeeId: userId, // same as FK
//     });
//   } catch (err) {
//     console.log("❌ ERROR:", err);

//     if (connection) await connection.rollback();

//     res.status(500).json({
//       error: err.sqlMessage || err.message,
//       code: err.code,
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };

// GET ALL EMPLOYEES (with company + department + designation join)
// export const getEmployees = (req, res) => {
//   const { company_id, department_id, designation_id } = req.query;

//   let sql = `
//     SELECT
//       e.id,
//       CONCAT(e.first_name, ' ', e.last_name) AS employee,
//       e.email,
//       e.contact_no,
//       c.company_name AS company,
//       d.department_name,
//       des.designation_name
//     FROM employees e
//     LEFT JOIN companies c ON e.company_id = c.id
//     LEFT JOIN departments d ON e.department_id = d.id
//     LEFT JOIN designations des ON e.designation_id = des.id
//     WHERE e.is_active = 1
//   `;

//   const params = [];

//   // 🔹 Filters
//   if (company_id) {
//     sql += " AND e.company_id = ?";
//     params.push(company_id);
//   }

//   if (department_id) {
//     sql += " AND e.department_id = ?";
//     params.push(department_id);
//   }

//   if (designation_id) {
//     sql += " AND e.designation_id = ?";
//     params.push(designation_id);
//   }

//   sql += " ORDER BY e.id DESC";

//   db.query(sql, params, (err, result) => {
//     if (err) {
//       console.error("Employee Fetch Error:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to fetch employees",
//       });
//     }

//     res.json({
//       success: true,
//       data: result,
//     });
//   });
// };

export const addEmployee = async (req, res) => {
  let connection;

  try {
    connection = await db.promise().getConnection();

    const {
      first_name,
      last_name,
      staff_id,
      email,
      contact_no,
      password,
      date_of_birth,
      gender,
      department_id,
      designation_id,
      office_shift_id,
      role_users_id,
      joining_date,
      state,
      city,
      zip_code,
      country,
      address,
      attendance_type,
      attendance_method,
      location_id,
      username,
    } = req.body;

    // 🔥 COMPANY FROM JWT
    const companyId = req.user?.company_id;
    const validationError = validateEmployeePayload(req.body, {
      companyId,
      requirePassword: true,
    });

    console.log("📥 Data:", req.body);
    console.log("🔐 Company ID from JWT:", companyId);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company is required",
      });
    }

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const normalizedFirstName = trimValue(first_name);
    const normalizedLastName = trimValue(last_name);
    const normalizedStaffId = trimValue(staff_id);
    const normalizedUsername = trimValue(username) || trimValue(email);
    const normalizedEmail = trimValue(email);
    const normalizedContactNo = trimValue(contact_no) || null;
    const normalizedDateOfBirth = trimValue(date_of_birth) || null;
    const normalizedGender = trimValue(gender) || null;
    const normalizedJoiningDate = trimValue(joining_date) || null;
    const normalizedState = trimValue(state) || null;
    const normalizedCity = trimValue(city) || null;
    const normalizedZipCode = trimValue(zip_code) || null;
    const normalizedCountry = trimValue(country) || null;
    const normalizedAddress = trimValue(address) || null;
    const normalizedAttendanceType = trimValue(attendance_type) || null;
    const normalizedAttendanceMethod = trimValue(attendance_method) 
      ? trimValue(attendance_method).toLowerCase().replace(/\s+/g, "") 
      : "manual";
    const normalizedLocationId = parsePositiveInt(location_id);
    const normalizedDepartmentId = parsePositiveInt(department_id);
    const normalizedDesignationId = parsePositiveInt(designation_id);
    const normalizedShiftId = parsePositiveInt(office_shift_id);
    const normalizedRoleId = parsePositiveInt(role_users_id) || 1;

    // ================= CHECK DUPLICATE EMAIL =================
    const [emailExists] = await connection.query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists ❌",
      });
    }

    const [usernameExists] = await connection.query(
      `SELECT id FROM users WHERE username = ? LIMIT 1`,
      [normalizedUsername]
    );

    if (usernameExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists ❌",
      });
    }

    // ================= CHECK DUPLICATE CONTACT =================
    if (normalizedContactNo) {
      const [contactExists] = await connection.query(
        `SELECT id FROM users WHERE contact_no = ? LIMIT 1`,
        [normalizedContactNo]
      );

      if (contactExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists ❌",
        });
      }
    }

    // ================= CHECK DUPLICATE STAFF ID =================
    if (normalizedStaffId) {
      const [staffExists] = await connection.query(
        `SELECT id FROM employees WHERE staff_id = ? LIMIT 1`,
        [normalizedStaffId]
      );

      if (staffExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Staff ID already exists ❌",
        });
      }
    }

    // ================= HASH PASSWORD =================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= START TRANSACTION =================
    await connection.beginTransaction();

    // ================= USERS INSERT =================
    const userSql = `
      INSERT INTO users 
      (
        first_name,
        last_name,
        username,
        email,
        password,
        contact_no,
        role_users_id,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [userResult] = await connection.query(userSql, [
      normalizedFirstName,
      normalizedLastName,
      normalizedUsername,
      normalizedEmail,
      hashedPassword,
      normalizedContactNo,
      normalizedRoleId,
      1,
    ]);

    const userId = userResult.insertId;

    console.log("✅ User ID:", userId);

    // ================= EMPLOYEE INSERT =================
    const empSql = `
      INSERT INTO employees (
        id,
        first_name,
        last_name,
        staff_id,
        email,
        contact_no,
        date_of_birth,
        gender,
        office_shift_id,
        company_id,
        department_id,
        designation_id,
        role_users_id,
        joining_date,
        state,
        city,
        zip_code,
        country,
        address,
        attendance_type,
        attendance_method,
        location_id,
        is_active
      )
      VALUES (
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?
      )
    `;

    const [empResult] = await connection.query(empSql, [
      userId,
      normalizedFirstName,
      normalizedLastName,
      normalizedStaffId,
      normalizedEmail,
      normalizedContactNo,
      normalizedDateOfBirth,
      normalizedGender,
      normalizedShiftId,
      companyId,
      normalizedDepartmentId,
      normalizedDesignationId,
      normalizedRoleId,
      normalizedJoiningDate,
      normalizedState,
      normalizedCity,
      normalizedZipCode,
      normalizedCountry,
      normalizedAddress,
      normalizedAttendanceType,
      normalizedAttendanceMethod,
      normalizedLocationId,
      1,
    ]);

    console.log("✅ Employee ID:", empResult.insertId);

    // ================= COMMIT =================
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Employee Added Successfully ✅",
      userId,
      employeeId: userId,
    });

  } catch (err) {

    console.log("❌ ERROR:", err);

    if (connection) {
      await connection.rollback();
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
      code: err.code,
    });

  } finally {

    if (connection) {
      connection.release();
    }

  }
};

export const getEmployees = (req, res) => {
  const { company_id, department_id, designation_id } = (req.query);

  let sql = `
    SELECT 
      e.id,
      CONCAT(e.first_name, ' ', e.last_name) AS employee,
      e.email,
        e.company_id,                       
      e.department_id,
        e.office_shift_id,
      e.contact_no,
      c.company_name AS company,
      d.department_name AS department,
      des.designation_name AS designation,
      r.name AS role,
      e.is_active,
      os.shift_name AS shift
    FROM employees e
    LEFT JOIN companies c ON e.company_id = c.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN designations des ON e.designation_id = des.id
    LEFT JOIN roles r ON e.role_users_id = r.id
    LEFT JOIN office_shifts os ON e.office_shift_id = os.id
    WHERE 1=1
  `;

  const params = [];

  if (company_id) {
    sql += " AND e.company_id = ?";
    params.push(company_id);
  }

  if (department_id) {
    sql += " AND e.department_id = ?";
    params.push(department_id);
  }

  if (designation_id) {
    sql += " AND e.designation_id = ?";
    params.push(designation_id);
  }

  sql += " ORDER BY e.id DESC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Employee Fetch Error:", err);
      return res.status(500).json({
        success: false,
      });
    }
console.log("Employee Fetch Result:", result);
    res.json({
      success: true,
      data: result,
    });
  });
};

export const deleteEmployee = (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE employees SET is_active = 0 WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete Error:", err);
      return res.status(500).json({
        success: false,
        message: "Delete failed",
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  });
};

export const deleteEmployees = (req, res) => {
  const { ids } = req.body;

  if (!ids || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No IDs provided",
    });
  }

  const sql = `UPDATE employees SET is_active = 0 WHERE id IN (?)`;

  db.query(sql, [ids], (err) => {
    if (err) {
      console.error("Bulk Delete Error:", err);
      return res.status(500).json({
        success: false,
        message: "Delete failed",
      });
    }

    res.json({
      success: true,
      message: "Employees deleted successfully",
    });
  });
};

// export const getEmployeeById = (req, res) => {
//   const { id } = req.params;

//   const sql = `
//     SELECT
//       e.*,
//       c.company_name AS company,
//       d.department_name AS department,
//       des.designation_name AS designation
//     FROM employees e
//     LEFT JOIN companies c ON e.company_id = c.id
//     LEFT JOIN departments d ON e.department_id = d.id
//     LEFT JOIN designations des ON e.designation_id = des.id
//     WHERE e.id = ? AND e.is_active = 1
//   `;

//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       console.error("Fetch By ID Error:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to fetch employee",
//       });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     res.json({
//       success: true,
//       data: result[0],
//     });
//   });
// };

export const getEmployeeById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      e.*,
      u.username,
      c.company_name AS company,
      d.department_name AS department,
      des.designation_name AS designation,
      r.name AS role
    FROM employees e
    LEFT JOIN users u ON e.id = u.id   -- adjust foreign key column name
    LEFT JOIN companies c ON e.company_id = c.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN designations des ON e.designation_id = des.id
    LEFT JOIN roles r ON e.role_users_id = r.id
    WHERE e.id = ?   -- ✅ No is_active filter
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Fetch By ID Error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch employee" });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    console.log("🔍 getEmployeeById - Retrieved employee data:", result[0]);
    console.log("📋 attendance_method from DB:", result[0].attendance_method);
    res.json({ success: true, data: result[0] });
  });
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const validationError = validateEmployeePayload(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const {
      first_name,
      last_name,
      staff_id,
      username,
      email,
      contact_no,
      address,
      city,
      state,
      zip_code,
      country,
      date_of_birth,
      gender,
      marital_status,
      company_id,
      department_id,
      designation_id,
      role_users_id,
      is_active,
      office_shift_id,
      joining_date,
      exit_date,
      attendance_type,
      attendance_method,
      location_id,
    } = req.body;

    const normalizedFirstName = trimValue(first_name);
    const normalizedLastName = trimValue(last_name);
    const normalizedStaffId = trimValue(staff_id);
    const normalizedUsername = trimValue(username);
    const normalizedEmail = trimValue(email);
    const normalizedContactNo = trimValue(contact_no) || null;
    const normalizedAddress = trimValue(address) || null;
    const normalizedCity = trimValue(city) || null;
    const normalizedState = trimValue(state) || null;
    const normalizedZipCode = trimValue(zip_code) || null;
    const normalizedCountry = trimValue(country) || null;
    const normalizedDateOfBirth = trimValue(date_of_birth) || null;
    const normalizedGender = trimValue(gender) || null;
    const normalizedMaritalStatus = trimValue(marital_status) || null;
    const normalizedCompanyId = parsePositiveInt(company_id);
    const normalizedDepartmentId = parsePositiveInt(department_id);
    const normalizedDesignationId = parsePositiveInt(designation_id);
    const normalizedRoleId = parsePositiveInt(role_users_id);
    const normalizedStatus = Number(is_active);
    const normalizedShiftId = parsePositiveInt(office_shift_id);
    const normalizedJoiningDate = trimValue(joining_date) || null;
    const normalizedExitDate = trimValue(exit_date) || null;
    const normalizedAttendanceType = trimValue(attendance_type) || null;
    const normalizedAttendanceMethod = trimValue(attendance_method) 
      ? trimValue(attendance_method).toLowerCase().replace(/\s+/g, "") 
      : null;
    const normalizedLocationId = parsePositiveInt(location_id);

    console.log("🔧 updateEmployee - received attendance_method:", attendance_method);
    console.log("🔧 updateEmployee - normalized attendance_method:", normalizedAttendanceMethod);

    if (normalizedStatus !== 0 && normalizedStatus !== 1) {
      return res.status(400).json({
        success: false,
        message: "Status is invalid",
      });
    }

    const [emailExists] = await db.promise().query(
      `SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1`,
      [normalizedEmail, id]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists ❌",
      });
    }

    const [usernameExists] = await db.promise().query(
      `SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1`,
      [normalizedUsername, id]
    );

    if (usernameExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists ❌",
      });
    }

    if (normalizedContactNo) {
      const [contactExists] = await db.promise().query(
        `SELECT id FROM users WHERE contact_no = ? AND id <> ? LIMIT 1`,
        [normalizedContactNo, id]
      );

      if (contactExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists ❌",
        });
      }
    }

    const [staffExists] = await db.promise().query(
      `SELECT id FROM employees WHERE staff_id = ? AND id <> ? LIMIT 1`,
      [normalizedStaffId, id]
    );

    if (staffExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Staff ID already exists ❌",
      });
    }

    const sql = `
UPDATE employees SET
  first_name = ?,
  last_name = ?,
  staff_id = ?,
  email = ?,
  contact_no = ?,
  address = ?,
  city = ?,
  state = ?,
  zip_code = ?,
  country = ?,
  date_of_birth = ?,
  gender = ?,
  marital_status = ?,
  company_id = ?,
  department_id = ?,
  designation_id = ?,
  role_users_id = ?,
  is_active = ?,
  office_shift_id = ?,
  joining_date = ?,
  exit_date = ?,
  attendance_type = ?,
  attendance_method = ?,
  location_id = ?
WHERE id = ?
`;

    const values = [
      normalizedFirstName,
      normalizedLastName,
      normalizedStaffId,
      normalizedEmail,
      normalizedContactNo,
      normalizedAddress,
      normalizedCity,
      normalizedState,
      normalizedZipCode,
      normalizedCountry,
      normalizedDateOfBirth,
      normalizedGender,
      normalizedMaritalStatus,
      normalizedCompanyId,
      normalizedDepartmentId,
      normalizedDesignationId,
      normalizedRoleId,
      normalizedStatus,
      normalizedShiftId,
      normalizedJoiningDate,
      normalizedExitDate,
      normalizedAttendanceType,
      normalizedAttendanceMethod,
      normalizedLocationId,
      id,
    ];

    await db.promise().query(sql, values);
    console.log("✅ updateEmployee - UPDATE query executed for attendance_method:", normalizedAttendanceMethod);

    // ✅ Sync all matching fields to users table
    const userSql = `
      UPDATE users SET
        first_name = ?,
        last_name = ?,
        username = ?,
        email = ?,
        contact_no = ?,
        role_users_id = ?,
        is_active = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    const userValues = [
      normalizedFirstName,
      normalizedLastName,
      normalizedUsername,
      normalizedEmail,
      normalizedContactNo,
      normalizedRoleId,
      normalizedStatus,
      id,
    ];

    try {
      await db.promise().query(userSql, userValues);
    } catch (uErr) {
      console.error("User update error:", uErr);
      return res.json({
        success: true,
        message: "Employee updated, but user sync failed",
      });
    }

    return res.json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });
  }
};

export const updateEmployeeStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  const parsedStatus = Number(is_active); // ✅ parse like updateUserStatus does

  if (parsedStatus !== 0 && parsedStatus !== 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  const employeeSql = "UPDATE employees SET is_active = ? WHERE id = ?";

  db.query(employeeSql, [parsedStatus, id], (err, result) => {
    if (err) {
      console.error("Employee Status Update Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update employee status",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ✅ Sync is_active to users table
    const userSql = "UPDATE users SET is_active = ? WHERE id = ?";

    db.query(userSql, [parsedStatus, id], (uErr) => {
      if (uErr) {
        console.error("User status sync error:", uErr);
        return res.status(500).json({
          success: false,
          message: "Employee status updated but failed to sync user status",
        });
      }

      res.json({
        success: true,
        message: `Status updated to ${parsedStatus}`,
      });
    });
  });
};

export const getAllEmployeesDropdown = (req, res) => {
  const sql = `
    SELECT 
      id,
      CONCAT(first_name, ' ', last_name) AS employee,
      attendance_method
    FROM employees
    WHERE is_active = 1
    ORDER BY first_name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Employee Dropdown Error:", err);
      return res.status(500).json({ success: false });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// ✅ ADD ATTENDANCE
export const addAttendance = (req, res) => {
  const data = req.body;

  const sql = `
    INSERT INTO attendances (
      employee_id,
      attendance_date,
      clock_in,
      clock_in_ip,
      clock_out,
      clock_out_ip,
      clock_in_out,
      time_late,
      early_leaving,
      overtime,
      total_work,
      total_rest,
      attendance_status,
      latitude,
      longitude,
      out_lat,
      out_log,
      location_in,
      location_out,
      day_value
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.employee_id,
    data.attendance_date,
    data.clock_in,
    data.clock_in_ip,
    data.clock_out,
    data.clock_out_ip,
    data.clock_in_out,
    data.time_late,
    data.early_leaving,
    data.overtime,
    data.total_work,
    data.total_rest,
    data.attendance_status,
    data.latitude,
    data.longitude,
    data.out_lat,
    data.out_log,
    data.location_in,
    data.location_out,
    data.day_value,
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error("Add Attendance Error:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, message: "Attendance Saved ✅" });
  });
};

// ✅ GET ATTENDANCE
export const getAttendance = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT 
      a.*,
      CONCAT(e.first_name, ' ', e.last_name) AS employee_name
    FROM attendances a
    LEFT JOIN employees e ON a.employee_id = e.id
    ORDER BY a.id DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [limit, offset], (err, result) => {
    if (err) return res.status(500).json({ success: false });

    db.query(
      `SELECT COUNT(*) as total FROM attendances`,
      (err2, countResult) => {
        res.json({
          success: true,
          data: result,
          total: countResult[0].total,
          page,
          limit,
        });
      },
    );
  });
};

// 🔥 GET ALL GEO LOCATIONS
export const getAllGeoLocations = (req, res) => {
  db.query(
    "SELECT id, name, latitude, longitude, radius FROM geo_locations ORDER BY name ASC",
    (err, rows) => {
      if (err) {
        console.error("Geo Location Error:", err);
        return res.status(500).json({ success: false });
      }

      const formatted = rows.map((loc) => ({
        value: loc.id,
        label: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        radius: loc.radius,
      }));

      res.json({
        success: true,
        data: formatted,
      });
    },
  );
};

// UPLOAD EMPLOYEE PHOTO
export const uploadEmployeePhoto = (req, res) => {
  try {
    const { employee_id } = req.body;

    // Validate employee_id
    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Generate photo URL path
    const photoPath = `/uploads/employees/${req.file.filename}`;

    // Update employee photo in database
    const sql = "UPDATE employees SET photo = ? WHERE id = ?";

    db.query(sql, [photoPath, employee_id], (err, result) => {
      if (err) {
        console.error("Photo Upload Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update employee photo",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      // Also update profile photo in users table
      const userSql = "UPDATE users SET profile_photo = ? WHERE id = ?";

      db.query(userSql, [req.file.filename, employee_id], (userErr, userResult) => {
        if (userErr) {
          console.error("User Photo Upload Error:", userErr);
          return res.status(500).json({
            success: false,
            message: "Employee photo updated but failed to update user photo",
          });
        }

        if (userResult.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Photo uploaded successfully",
          data: {
            employee_id,
            photo: photoPath,
            filename: req.file.filename,
          },
        });
      });
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload photo",
    });
  }
};

export const saveEmployeeSalary = (req, res) => {
  const {
    employee_id,
    total_earnings,
    total_deductions,
    total_contribution,
    gross_salary,
    net_salary,
    basic,
    hra,
    special_allowance,
    pf,
    tds,
    pt,
  } = req.body;

  const sql = `
    UPDATE employees SET
      total_earnings = ?,
      total_deductions = ?,
      total_contribution = ?,
      total_gross = ?,
      net_salary = ?,

      basic = ?,
      hra = ?,
      special_allowance = ?,
      pf = ?,
      tds = ?,
      pt = ?

    WHERE id = ?
  `;

  db.query(
    sql,
    [
      total_earnings,
      total_deductions,
      total_contribution,
      gross_salary,
      net_salary,

      basic,
      hra,
      special_allowance,
      pf,
      tds,
      pt,

      employee_id,
    ],
    (err) => {
      if (err) {
        console.error("Salary Save Error:", err);
        return res.status(500).json({ success: false });
      }

      res.json({
        success: true,
        message: "Salary saved successfully ✅",
      });
    }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PASTE at the bottom of employeeController.js
// FIX: employees table has `is_active` (1/0), NOT `status`
// ─────────────────────────────────────────────────────────────────────────────

export const getRecentEmployees = (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const sql = `
    SELECT
      e.id,
      CONCAT(e.first_name, ' ', e.last_name) AS name,
      e.email,
      e.photo,
      d.department_name,
      des.designation_name,
      e.is_active,
      DATE_FORMAT(e.created_at, '%Y-%m-%d') AS joined_on,
      u.last_login_date,
      u.last_login_ip
    FROM employees e
    LEFT JOIN departments  d   ON e.department_id  = d.id
    LEFT JOIN designations des ON e.designation_id = des.id
    LEFT JOIN users u ON e.id = u.id
    ORDER BY e.id DESC
    LIMIT ?
  `;

  db.query(sql, [limit], (err, result) => {
    if (err) {
      console.error("getRecentEmployees error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, data: result });
  });
};

export const applyLeavePolicyToEmployee = (req, res) => {
  const { employee_id, policy_id, policy_name } = req.body;

  // ✅ validation
  if (!employee_id || !policy_id) {
    return res.status(400).json({
      success: false,
      message: "employee_id & policy_id required ❌",
    });
  }

  const sql = `
    UPDATE employees
    SET leave_policy_id = ?, leave_policy_name = ?
    WHERE id = ?
  `;

  db.query(sql, [policy_id, policy_name, employee_id], (err, result) => {
    if (err) {
      console.error("Leave Policy Save Error:", err);
      return res.status(500).json({
        success: false,
        message: "DB error ❌",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found ❌",
      });
    }

    res.json({
      success: true,
      message: "Leave Policy assigned successfully ✅",
    });
  });
};

// ─── IMPORT EMPLOYEES FROM EXCEL/CSV ─────────────────────────────────────────
export const importEmployees = async (req, res) => {
  let connection;
  const results = { success: 0, failed: 0, errors: [] };

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded ❌" });
    }

    // Parse file based on extension
    const ext = path.extname(file.originalname).toLowerCase();
    let rows = [];
if (ext === ".csv") {
  const csv = fs.readFileSync(file.path, "utf-8");
  const parsed = parse(csv, {
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true,
  });
  rows = parsed.slice(1);

} else {
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  rows.shift();
}

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "File is empty or contains only headers ❌" });
    }

    // Company from JWT
    const companyId = req.user?.company_id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company is required ❌" });
    }

    console.log("=========="+companyId+"=========")

    connection = await db.promise().getConnection();

    // Get reference data for name lookups
    const [departments] = await connection.query("SELECT id, department_name FROM departments WHERE company_id = ?", [companyId]);
    const [designations] = await connection.query("SELECT id, designation_name FROM designations WHERE company_id = ?", [companyId]);
    const [shifts] = await connection.query("SELECT id, shift_name FROM office_shifts WHERE company_id = ?", [companyId]);
    const [roles] = await connection.query("SELECT id, name FROM roles");

    const deptMap = new Map(departments.map(d => [d.department_name.toLowerCase(), d.id]));
    const desigMap = new Map(designations.map(d => [d.designation_name.toLowerCase(), d.id]));
    const shiftMap = new Map(shifts.map(s => [s.shift_name.toLowerCase(), s.id]));
    const roleMap = new Map(roles.map(r => [r.name.toLowerCase(), r.id]));

    // ─── PHASE 1: Validate ALL rows first (without inserting) ────────────────────
    const validationErrors = [];
    const validRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because header is row 1 and we removed it
      console.log(row[17])
      try {
        // Expected column order from ImportEmployees.jsx:
        const firstName = trimValue(row[0]);
        const lastName = trimValue(row[1]);
        const staffId = trimValue(row[2]);
        const username = trimValue(row[3]);
        const email = trimValue(row[4]);
        const password = trimValue(row[5]);
        const joiningDate = trimValue(row[6]);
        const gender = trimValue(row[7]);
        const dateOfBirth = trimValue(row[8]);
        const contactNo = trimValue(row[9]);
        const address = trimValue(row[10]);
        const city = trimValue(row[11]);
        const zipCode = trimValue(row[12]);
        const country = trimValue(row[13]);
        const attendanceType = trimValue(row[14]);
        const departmentName = trimValue(row[16]);
        const designationName = trimValue(row[17]);
        const shiftName = trimValue(row[18]);
        const roleName = trimValue(row[19]);

        // Basic validation
        if (!firstName || !lastName || !email || !password) {
          throw new Error("Missing required fields: First Name, Last Name, Email, Password are required");
        }

        if (!EMAIL_REGEX.test(email)) {
          throw new Error(`Invalid email format: ${email}`);
        }

        // Lookup IDs from names
        const departmentId = deptMap.get(departmentName?.toLowerCase());
        const designationId = desigMap.get(designationName?.toLowerCase());
        const shiftId = shiftMap.get(shiftName?.toLowerCase());
        const roleId = roleMap.get(roleName?.toLowerCase()) || 1;

        if (!departmentId) {
          throw new Error(`Department not found: "${departmentName}". Available: ${departments.map(d => d.department_name).join(", ")}`);
        }
        if (!designationId) {
          throw new Error(`Designation not found: "${designationName}". Available: ${designations.map(d => d.designation_name).join(", ")}`);
        }
        if (!shiftId) {
          throw new Error(`Shift not found: "${shiftName}". Available: ${shifts.map(s => s.shift_name).join(", ")}`);
        }

        // Check for duplicates
        const [emailExists] = await connection.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
        if (emailExists.length > 0) {
          throw new Error(`Email already exists: ${email}`);
        }

        const [usernameExists] = await connection.query("SELECT id FROM users WHERE username = ? LIMIT 1", [username || email]);
        if (usernameExists.length > 0) {
          throw new Error(`Username already exists: ${username || email}`);
        }

        if (staffId) {
          const [staffExists] = await connection.query("SELECT id FROM employees WHERE staff_id = ? LIMIT 1", [staffId]);
          if (staffExists.length > 0) {
            throw new Error(`Staff ID already exists: ${staffId}`);
          }
        }

        // Store valid row data
        validRows.push({
          rowNum, firstName, lastName, staffId, username, email, password,
          joiningDate, gender, dateOfBirth, contactNo, address, city, zipCode, country,
          attendanceType, departmentId, designationId, shiftId, roleId,
        });
      } catch (err) {
        validationErrors.push({ row: rowNum, message: err.message });
      }
    }

    // ─── If ANY validation errors, ABORT entire import (All or Nothing) ─────────
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Import ABORTED: ${validationErrors.length} row(s) failed validation. NO data was imported.`,
        imported: 0,
        failed: validationErrors.length,
        totalRows: rows.length,
        errors: validationErrors,
        allOrNothing: true,
      });
    }

    // ─── PHASE 2: Insert ALL valid rows in a SINGLE transaction ──────────────────
    await connection.beginTransaction();

    try {
      const insertedEmployees = [];

      for (const rowData of validRows) {
        const {
          rowNum, firstName, lastName, staffId, username, email, password,
          joiningDate, gender, dateOfBirth, contactNo, address, city, zipCode, country,
          attendanceType, departmentId, designationId, shiftId, roleId,
        } = rowData;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const userSql = `
          INSERT INTO users (first_name, last_name, username, email, password, contact_no, role_users_id, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [userResult] = await connection.query(userSql, [
          firstName, lastName, username || email, email, hashedPassword,
          contactNo || null, roleId, 1,
        ]);
        const userId = userResult.insertId;

        if (!userId) {
          throw new Error(`Row ${rowNum}: Failed to create user account`);
        }

        // Insert employee
        const empSql = `
          INSERT INTO employees (
            id, first_name, last_name, staff_id, email, contact_no, date_of_birth, gender,
            office_shift_id, company_id, department_id, designation_id, role_users_id,
            joining_date, state, city, zip_code, country, address, attendance_type, location_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [empResult] = await connection.query(empSql, [
          userId, firstName, lastName, staffId || null, email, contactNo || null,
          dateOfBirth || null, gender || null, shiftId, companyId, departmentId,
          designationId, roleId, joiningDate || new Date().toISOString().slice(0, 10),
          null, city || null, zipCode || null, country || null, address || null,
          attendanceType === "ip_based" ? "Hourly" : "Daily", null, 1,
        ]);

        insertedEmployees.push({
          row: rowNum, userId, employeeId: empResult.insertId,
          name: `${firstName} ${lastName}`, email, staffId: staffId || null,
        });
      }

      await connection.commit();

      return res.json({
        success: true,
        message: `Import SUCCESSFUL: ${insertedEmployees.length} employee(s) imported`,
        imported: insertedEmployees.length,
        failed: 0,
        totalRows: rows.length,
        employees: insertedEmployees,
        allOrNothing: true,
      });

    } catch (err) {
      await connection.rollback();
      console.error("[Employee Import] Transaction ROLLED BACK:", err.message);
      return res.status(500).json({
        success: false,
        message: `Import FAILED: ${err.message}. All changes ROLLED BACK. NO data was imported.`,
        imported: 0,
        failed: validRows.length,
        totalRows: rows.length,
        errors: [{ row: "Database", message: err.message }],
        allOrNothing: true,
      });
    }

  } catch (err) {
    console.error("Import Error:", err);
    if (connection) await connection.rollback();
    return res.status(500).json({
      success: false,
      message: err.message || "Import failed",
      imported: 0,
      failed: 0,
      allOrNothing: true,
    });
  } finally {
    if (connection) connection.release();
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};


// ─── IMPORT ATTENDANCE FROM EXCEL/CSV ─────────────────────────────────────────
export const importAttendance = async (req, res) => {
  let connection;

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded ❌" });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    let rows = [];

    if (ext === ".csv") {
      // FIX 1: proper CSV parser — handles commas inside quoted fields
      const { parse } = await import("csv-parse/sync");
      const csv = fs.readFileSync(file.path, "utf-8");
      const parsed = parse(csv, { skip_empty_lines: true, relax_quotes: true, trim: true });
      rows = parsed.slice(1);
    } else {
      // FIX 2: static-style dynamic import with .default
      const xlsxMod = await import("xlsx");
      const xlsx = xlsxMod.default ?? xlsxMod;
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      rows.shift();
    }

    fs.unlinkSync(file.path);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "File is empty or contains only headers ❌" });
    }

    connection = await db.promise().getConnection();

    // ─── PHASE 1: Validate ALL rows ──────────────────────────────────────────────
    const validationErrors = [];
    const validRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const staffId        = trimValue(row[0]);
        const attendanceDate = trimValue(row[1]);
        const clockIn        = trimValue(row[2]);
        const clockOut       = trimValue(row[3]);

        if (!staffId || !attendanceDate) {
          throw new Error("Staff ID and Attendance Date are required");
        }

        if (!isValidDateValue(attendanceDate)) {
          throw new Error(`Invalid date format: "${attendanceDate}". Use YYYY-MM-DD`);
        }

        if (clockIn  && !/^\d{2}:\d{2}$/.test(clockIn)) {
          throw new Error(`Invalid clock in time: "${clockIn}". Use HH:MM`);
        }
        if (clockOut && !/^\d{2}:\d{2}$/.test(clockOut)) {
          throw new Error(`Invalid clock out time: "${clockOut}". Use HH:MM`);
        }
        if (clockIn && clockOut && clockOut <= clockIn) {
          throw new Error(`Clock out "${clockOut}" must be after clock in "${clockIn}"`);
        }

        const [employeeRows] = await connection.query(
          "SELECT id, first_name, last_name, office_shift_id FROM employees WHERE staff_id = ? LIMIT 1",
          [staffId]
        );
        if (employeeRows.length === 0) {
          throw new Error(`Employee with Staff ID "${staffId}" not found`);
        }

        const employee = employeeRows[0];

        // FIX 5: check for duplicate log (same employee + date + clock_in)
        if (clockIn) {
          const clockInFull = `${attendanceDate} ${clockIn}:00`;
          const [dupLog] = await connection.query(
            "SELECT id FROM attendance_logs WHERE employee_id = ? AND attendance_date = ? AND clock_in = ? LIMIT 1",
            [employee.id, attendanceDate, clockInFull]
          );
          if (dupLog.length > 0) {
            throw new Error(`Duplicate entry: Staff ID "${staffId}" already has clock-in ${clockIn} on ${attendanceDate}`);
          }
        }

        validRows.push({
          rowNum,
          employeeId:   employee.id,
          staffId,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          attendanceDate,
          clockIn,
          clockOut,
        });
      } catch (err) {
        validationErrors.push({ row: rowNum, message: err.message });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Import ABORTED: ${validationErrors.length} row(s) failed validation. NO attendance was imported.`,
        imported: 0,
        failed: validationErrors.length,
        totalRows: rows.length,
        errors: validationErrors,
        allOrNothing: true,
      });
    }

    // ─── PHASE 2: Insert in a single transaction ──────────────────────────────────
    await connection.beginTransaction();

    try {
      const insertedAttendance = [];

      for (const rowData of validRows) {
        const { employeeId, staffId, employeeName, attendanceDate, clockIn, clockOut } = rowData;

        // FIX 3+4: fetch shift, combine datetime using local time (no UTC drift)
        const { shift_start, shift_end, isNextDayShift, shiftStartHour } =
          await getEmployeeShift(employeeId, attendanceDate);

        const clockInFull  = combineDateTime(attendanceDate, clockIn,  isNextDayShift, shiftStartHour);
        const clockOutFull = combineDateTime(attendanceDate, clockOut, isNextDayShift, shiftStartHour);

        await connection.query(
          `INSERT INTO attendance_logs
             (employee_id, attendance_date, clock_in, clock_out, latitude, longitude)
           VALUES (?, ?, ?, ?, NULL, NULL)`,
          [employeeId, attendanceDate, clockInFull, clockOutFull]
        );

        insertedAttendance.push({
          row: rowData.rowNum, employeeId, staffId, employeeName,
          attendanceDate, clockIn, clockOut,
        });
      }

      // ─── Aggregate and upsert attendances summary per employee+date ───────────
      const employeeDateGroups = {};
      for (const r of validRows) {
        const key = `${r.employeeId}_${r.attendanceDate}`;
        if (!employeeDateGroups[key]) {
          employeeDateGroups[key] = { employeeId: r.employeeId, attendanceDate: r.attendanceDate };
        }
      }

      for (const { employeeId, attendanceDate } of Object.values(employeeDateGroups)) {
        // FIX 3: fetch shift for proper deviation calc
        const { shift_start, shift_end, isNextDayShift } =
          await getEmployeeShift(employeeId, attendanceDate);

        // FIX 5: pull ALL logs for this day (not just the ones we just inserted)
        const [logs] = await connection.query(
          `SELECT clock_in, clock_out FROM attendance_logs
           WHERE employee_id = ? AND attendance_date = ?
           ORDER BY clock_in ASC`,
          [employeeId, attendanceDate]
        );
        if (logs.length === 0) continue;

        // FIX 3+4: reuse existing helpers — correct totals + local-time formatting
        const { totalMinutes, restMinutes, firstIn, lastOut } =
          calcLogTotals(logs, attendanceDate);

        const total_work = formatTime(totalMinutes);
        const { late, early_leaving, overtime } = calcShiftDeviations(
          firstIn, lastOut, attendanceDate, shift_start, shift_end, isNextDayShift
        );

        // FIX 6: day_value — 0 for weekoff, 1 for working day
        const dayName  = getDayName(attendanceDate);
        const [empShiftRows] = await connection.query(
          `SELECT os.* FROM employees e
           LEFT JOIN office_shifts os ON e.office_shift_id = os.id
           WHERE e.id = ?`, [employeeId]
        );
        const isWeekOff = empShiftRows.length
          ? isWeekOffShiftDay(empShiftRows[0], dayName)
          : false;

        await connection.query(
          `INSERT INTO attendances
             (employee_id, attendance_date, clock_in, clock_out,
              total_work, attendance_status, time_late, early_leaving, overtime, day_value)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             clock_in          = VALUES(clock_in),
             clock_out         = VALUES(clock_out),
             total_work        = VALUES(total_work),
             attendance_status = VALUES(attendance_status),
             time_late         = VALUES(time_late),
             early_leaving     = VALUES(early_leaving),
             overtime          = VALUES(overtime)`,
          [
            employeeId, attendanceDate,
            formatDateTimeStr(firstIn),   // FIX 4: local time, not UTC
            formatDateTimeStr(lastOut),
            total_work,
            isWeekOff ? 'weekoff' : 'present',
            late, early_leaving, overtime,
            isWeekOff ? 0 : 1,            // FIX 6
          ]
        );
      }

      await connection.commit();

      return res.json({
        success: true,
        message: `Import SUCCESSFUL: ${insertedAttendance.length} attendance record(s) imported`,
        imported: insertedAttendance.length,
        failed: 0,
        totalRows: rows.length,
        attendance: insertedAttendance,
        allOrNothing: true,
      });

    } catch (err) {
      await connection.rollback();
      console.error("[Attendance Import] Transaction ROLLED BACK:", err.message);
      return res.status(500).json({
        success: false,
        message: `Import FAILED: ${err.message}. All changes ROLLED BACK.`,
        imported: 0,
        failed: validRows.length,
        totalRows: rows.length,
        errors: [{ row: "Database", message: err.message }],
        allOrNothing: true,
      });
    }

  } catch (err) {
    console.error("Import Attendance Error:", err);
    if (connection) await connection.rollback();
    return res.status(500).json({
      success: false,
      message: err.message || "Import failed",
      imported: 0,
      failed: 0,
      allOrNothing: true,
    });
  } finally {
    if (connection) connection.release();
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

// ─── BULK UPDATE ATTENDANCE METHOD (for Employee List) ───────────────────────────
export const addBulkAttendance = async (req, res) => {
  let connection;
  const { employee_ids, method = "manual" } = req.body;

  if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
    return res.status(400).json({ success: false, error: "Employee IDs are required" });
  }

  // Map frontend method to attendance_method enum values: manual, geofence, location_tracking
  const attendanceMethodMap = {
    "manual": "manual",
    "geo": "geofence",
    "location_tracking": "location_tracking"
  };
  const attendanceMethod = attendanceMethodMap[method] || "manual";

  const success = [];
  const failed = [];

  try {
    connection = await db.promise().getConnection();

    for (const employee_id of employee_ids) {
      try {
        // Check if employee exists
        const [empRows] = await connection.query(
          "SELECT id, first_name, last_name, staff_id, attendance_method FROM employees WHERE id = ? LIMIT 1",
          [employee_id]
        );

        if (empRows.length === 0) {
          failed.push({ id: employee_id, reason: "Employee not found" });
          continue;
        }

        const employee = empRows[0];
        const oldMethod = employee.attendance_method || "manual";

        // Update employee's attendance_method
        await connection.query(
          "UPDATE employees SET attendance_method = ? WHERE id = ?",
          [attendanceMethod, employee_id]
        );

        success.push({
          id: employee_id,
          name: `${employee.first_name} ${employee.last_name}`,
          oldMethod: oldMethod,
          newMethod: attendanceMethod
        });
      } catch (err) {
        console.error(`[Bulk Attendance Method] Error for employee ${employee_id}:`, err.message);
        failed.push({ id: employee_id, reason: err.message });
      }
    }

    return res.json({
      success: true,
      message: `Attendance method updated: ${success.length} succeeded, ${failed.length} failed`,
      attendance_method: attendanceMethod,
      method: method,
      success,
      failed,
    });

  } catch (err) {
    console.error("[Bulk Attendance Method] Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) connection.release();
  }
};