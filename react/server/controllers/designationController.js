// designationController.js
import db from "../config/db.js";

// ---------------- GET ALL DESIGNATIONS ----------------
export const getDesignations = (req, res) => {
  const { department_id } = req.query;
  
  let sql = `
    SELECT 
      d.id,
      d.designation_name,
      d.remark,
      d.department_id,
      c.company_name,
      dept.department_name
    FROM designations d
    LEFT JOIN companies c ON d.company_id = c.id
    LEFT JOIN departments dept ON d.department_id = dept.id
  `;
  
  const params = [];
  
  if (department_id) {
    sql += " WHERE d.department_id = ?";
    params.push(department_id);
  }
  
  sql += " ORDER BY d.id ASC";
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({
      sessionUser: req.session.user,
      designations: result,
    });
  });
};

// ---------------- ADD DESIGNATION ----------------
// ---------------- ADD DESIGNATION ----------------
export const addDesignation = (req, res) => {
  const { designation_name, department_id, remark } = req.body;

  const companyId = req.user.company_id; // 🔥 JWT se

  if (!designation_name) {
    return res.status(400).json({
      message: "Designation name is required",
    });
  }

  const query = `
    INSERT INTO designations 
    (
      designation_name,
      company_id,
      department_id,
      is_active,
      created_at,
      updated_at,
      remark
    ) 
    VALUES (?, ?, ?, 1, NOW(), NOW(), ?)
  `;

  db.query(
    query,
    [designation_name, companyId, department_id, remark],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        message: "Designation added successfully",
        id: results.insertId,
      });
    },
  );
};

// ---------------- UPDATE DESIGNATION ----------------
export const updateDesignation = (req, res) => {
  const { id } = req.params;
  const { designation_name, department_id, remark, is_active } = req.body;

  const companyId = req.user.company_id; // 🔥 security

  const query = `
    UPDATE designations 
    SET 
      designation_name = ?, 
      department_id = ?, 
      remark = ?, 
      is_active = ?, 
      updated_at = NOW()
    WHERE id = ? AND company_id = ?
  `;

  db.query(
    query,
    [designation_name, department_id, remark, is_active ?? 1, id, companyId],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        message: "Designation updated successfully",
      });
    },
  );
};

// ---------------- DELETE DESIGNATION ----------------
export const deleteDesignation = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM designations WHERE id=?";

  db.query(query, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({
      message: "Designation deleted successfully",
      sessionUser: req.session.user,
    });
  });
};
