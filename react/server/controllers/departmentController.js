import db from "../config/db.js";

// ---------------- GET ALL DEPARTMENTS ----------------
export const getDepartments = (req, res) => {
  console.log("User Session:", req.session.user);

  const sql = `
    SELECT 
      d.id,
      d.department_name,
      d.remark,
          d.company_id,     
      c.company_name
    FROM departments d
    LEFT JOIN companies c ON d.company_id = c.id
    ORDER BY d.id ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({
      sessionUser: req.session.user,
      departments: result,
    });
  });
};

// // ---------------- ADD DEPARTMENT ----------------
// export const addDepartment = (req, res) => {

//   const { department, remark } = req.body;

//   if (!department) {
//     return res.status(400).json({
//       message: "Department is required"
//     });
//   }

//   const sql = `
//     INSERT INTO departments (department_name, remark)
//     VALUES (?, ?)
//   `;

//   db.query(sql, [department, remark], (err, result) => {

//     if (err) {
//       console.log(err);
//       return res.status(500).json({
//         message: "Database error"
//       });
//     }

//     res.json({
//       message: "Department added successfully",
//       id: result.insertId
//     });

//   });

// };

// // ---------------- UPDATE DEPARTMENT ----------------
// export const updateDepartment = (req, res) => {

//   const { id } = req.params;
//   const { department, remark } = req.body;

//   const sql = `
//     UPDATE departments
//     SET department_name = ?, remark = ?
//     WHERE id = ?
//   `;

//   db.query(sql, [department, remark, id], (err, result) => {

//     if (err) {
//       console.log(err);
//       return res.status(500).json({
//         message: "Database error"
//       });
//     }

//     res.json({
//       message: "Department updated successfully"
//     });

//   });
// };

export const addDepartment = (req, res) => {
  const { department, remark } = req.body;

  const companyId = req.user.company_id;

  console.log("USER:", req.user);

  if (!department) {
    return res.status(400).json({
      message: "Department is required",
    });
  }

  const sql = `
    INSERT INTO departments 
    (
      department_name,
      remark,
      company_id,
      is_active,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, 1, NOW(), NOW())
  `;

  db.query(sql, [department, remark, companyId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    res.json({
      message: "Department added successfully",
      id: result.insertId,
    });
  });
};

// ---------------- UPDATE DEPARTMENT ----------------
export const updateDepartment = (req, res) => {
  const { id } = req.params;
  const { department, remark, is_active } = req.body;

  const companyId = req.user.company_id;

  const sql = `
    UPDATE departments
    SET 
      department_name = ?, 
      remark = ?, 
      is_active = ?, 
      updated_at = NOW()
    WHERE id = ? AND company_id = ?
  `;

  db.query(
    sql,
    [
      department,
      remark,
      is_active ?? 1, // default active
      id,
      companyId,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      res.json({
        message: "Department updated successfully",
      });
    },
  );
};

// ---------------- DELETE DEPARTMENT ----------------
export const deleteDepartment = (req, res) => {
  const { id } = req.params;

  console.log("Delete request ID:", id);

  const sql = "DELETE FROM departments WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Delete Error:", err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    // check if row exists
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json({
      message: "Department deleted successfully",
      deletedId: id,
    });
  });
};


export const getDepartmentStats = (req, res) => {
  const sql = `
    SELECT
      d.department_name,
      COUNT(e.id) AS employee_count
    FROM departments d
    LEFT JOIN employees e
      ON e.department_id = d.id
     AND e.is_active = 1
    WHERE d.is_active = 1
    GROUP BY d.id, d.department_name
    ORDER BY employee_count DESC
  `;
 
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("getDepartmentStats error:", err);
      return res.status(500).json({ message: "Failed to fetch department stats" });
    }
 
    // Cast employee_count to Number (MySQL returns BigInt for COUNT)
    const result = rows.map((r) => ({
      department_name: r.department_name,
      employee_count:  Number(r.employee_count),
    }));
 
    res.json(result);
  });
};
