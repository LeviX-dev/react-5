
import db from "../config/db.js";
import bcrypt from "bcrypt";

const PROFILE_EDITABLE_FIELDS = ["firstName", "lastName", "email", "phone"];
const PROFILE_READ_ONLY_FIELDS = ["role", "company", "designation"];

const PROFILE_FIELD_TO_COLUMN = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  phone: "contact_no",
};

const fetchProfileByUserId = (userId, callback) => {
  const sql = `
    SELECT
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.email AS email,
      u.contact_no AS phone,
      r.name AS role,
      c.company_name AS company,
      des.designation_name AS designation
    FROM users u
    LEFT JOIN employees e ON e.id = u.id
    LEFT JOIN roles r ON u.role_users_id = r.id
    LEFT JOIN companies c ON e.company_id = c.id
    LEFT JOIN designations des ON e.designation_id = des.id
    WHERE u.id = ? AND u.deleted_at IS NULL
    LIMIT 1
  `;

  db.query(sql, [userId], callback);
};

export const getAllUsers = (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.username,
      u.email,
      u.contact_no,
      u.is_active,
      r.name AS role
    FROM users u
    LEFT JOIN roles r ON u.role_users_id = r.id
    WHERE u.deleted_at IS NULL
    ORDER BY u.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Fetch Users Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};
// Toggle user active/inactive status
// Toggle user active/inactive status
export const updateUserStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  const parsedStatus = Number(is_active);

  if (parsedStatus !== 0 && parsedStatus !== 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  const userSql = "UPDATE users SET is_active = ? WHERE id = ?";

  db.query(userSql, [parsedStatus, id], (err, result) => {
    if (err) {
      console.error("Update User Status Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update user status",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const employeeSql = "UPDATE employees SET is_active = ? WHERE id = ?";

    db.query(employeeSql, [parsedStatus, id], (eErr) => {
      if (eErr) {
        console.error("Employee status sync error:", eErr);
        return res.status(500).json({
          success: false,
          message: "User status updated but failed to sync employee status",
        });
      }

      res.json({
        success: true,
        message: `User status updated to ${parsedStatus}`,
      });
    });
  });
};
export const getUserById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      u.*,
      r.name AS role,
      e.staff_id AS staff_id,
      e.date_of_birth AS date_of_birth,
      e.gender AS gender,
      e.joining_date AS joining_date,
      e.address AS address,
      e.city AS city,
      e.state AS state,
      e.country AS country,
      e.zip_code AS zip_code,
      e.photo AS photo,
      c.company_name AS company,
      d.department_name AS department,
      des.designation_name AS designation
    FROM users u
    LEFT JOIN roles r ON u.role_users_id = r.id
    LEFT JOIN employees e ON e.id = u.id
    LEFT JOIN companies c ON e.company_id = c.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN designations des ON e.designation_id = des.id
    WHERE u.id = ? AND u.deleted_at IS NULL
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Fetch User Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  });
};

export const updateUser = (req, res) => {
  const { id } = req.params;

  const {
    first_name,
    last_name,
    username,
    email,
    contact_no,
    role_users_id,
    is_active,
  } = req.body;

  // 🔥 validation
  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  const sql = `
    UPDATE users SET
      first_name = ?,
      last_name = ?,
      username = ?,
      email = ?,
      contact_no = ?,
      role_users_id = ?,
      is_active = ?
    WHERE id = ?
  `;

  const values = [
    first_name || null,
    last_name || null,
    username,
    email || null,
    contact_no || null,
    role_users_id || null,
    is_active ?? 1,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Update User Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to update user",
      });
    }

    const employeeSql = `
      UPDATE employees SET
        first_name = ?,
        last_name = ?,
        email = ?,
        contact_no = ?,
        role_users_id = ?,
        is_active = ?
      WHERE id = ?
    `;

    const employeeValues = [
      first_name || null,
      last_name || null,
      email || null,
      contact_no || null,
      role_users_id || null,
      is_active ?? 1,
      id,
    ];

    db.query(employeeSql, employeeValues, (eErr) => {
      if (eErr) {
        console.error("Employee sync update error:", eErr);
        return res.status(500).json({
          success: false,
          message: "User updated but failed to sync employee profile",
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
      });
    });
  });
};



export const changeUserPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password required",
    });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashed, id],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false });
        }

        res.json({
          success: true,
          message: "Password updated",
        });
      },
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getUsersLastLogin = (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.username,
      u.last_login_date,
      u.last_login_ip,
      u.is_active,
      e.photo AS photo
    FROM users u
    LEFT JOIN employees e ON e.id = u.id
    WHERE u.deleted_at IS NULL
    ORDER BY u.last_login_date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Last Login Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

export const getMyProfile = (req, res) => {
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  fetchProfileByUserId(userId, (err, result) => {
    if (err) {
      console.error("Fetch My Profile Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }

    if (!result.length) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.json({
      success: true,
      data: result[0],
      editableFields: PROFILE_EDITABLE_FIELDS,
      readOnlyFields: PROFILE_READ_ONLY_FIELDS,
    });
  });
};

export const updateMyProfile = (req, res) => {
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const payload = req.body || {};
  const attemptedReadOnlyFields = Object.keys(payload).filter((field) =>
    PROFILE_READ_ONLY_FIELDS.includes(field),
  );

  if (attemptedReadOnlyFields.length > 0) {
    return res.status(403).json({
      success: false,
      message: "Read-only fields cannot be modified",
      fields: attemptedReadOnlyFields,
    });
  }

  const editableUpdates = PROFILE_EDITABLE_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(payload, field),
  );

  if (!editableUpdates.length) {
    return res.status(400).json({
      success: false,
      message: "No editable fields provided",
    });
  }

  const emailValue = String(payload.email || "").trim();
  if (
    Object.prototype.hasOwnProperty.call(payload, "email") &&
    emailValue &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  const phoneValue = String(payload.phone || "").trim();
  if (
    Object.prototype.hasOwnProperty.call(payload, "phone") &&
    phoneValue &&
    !/^[+\d\s()-]{7,20}$/.test(phoneValue)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone format",
    });
  }

  const setClauses = [];
  const values = [];

  editableUpdates.forEach((field) => {
    const column = PROFILE_FIELD_TO_COLUMN[field];
    const rawValue = payload[field];
    const normalizedValue =
      typeof rawValue === "string" ? rawValue.trim() : rawValue;

    setClauses.push(`${column} = ?`);
    values.push(normalizedValue || null);
  });

  const sql = `
    UPDATE users
    SET ${setClauses.join(", ")}
    WHERE id = ? AND deleted_at IS NULL
  `;

  values.push(userId);

  db.query(sql, values, (err) => {
    if (err) {
      console.error("Update My Profile Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }

    fetchProfileByUserId(userId, (fetchErr, result) => {
      if (fetchErr) {
        console.error("Fetch Updated Profile Error:", fetchErr);
        return res.status(500).json({
          success: false,
          message: "Profile updated but failed to fetch latest profile",
        });
      }

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: result[0] || null,
      });
    });
  });
};
