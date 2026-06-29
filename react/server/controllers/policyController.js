import db from "../config/db.js";

// ✅ GET ALL POLICIES
export const getPolicies = (req, res) => {
  console.log("User Session:", req.session.user);

  const sql = `
    SELECT id, title, description
    FROM policies
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({
      sessionUser: req.session.user,
      data: result,
    });
  });
};

// // ✅ ADD POLICY
// export const addPolicy = (req, res) => {

//   console.log("User Session:", req.session.user);

//   const { title, description } = req.body;

//   const sql = `
//     INSERT INTO policies (title, description)
//     VALUES (?, ?)
//   `;

//   db.query(sql, [title, description], (err, result) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ message: "Insert failed" });
//     }

//     res.json({
//       message: "Policy added successfully",
//       sessionUser: req.session.user
//     });
//   });
// };

export const addPolicy = (req, res) => {
  const { title, description } = req.body;

  const companyId = req.user.company_id; // 🔥 JWT
  const addedBy = req.user.user_id; // 🔥 user id

  if (!title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  const sql = `
    INSERT INTO policies 
    (title, description, company_id, added_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, NOW(), NOW())
  `;

  db.query(
    sql,
    [title, description || null, companyId, addedBy],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Insert failed" });
      }

      res.json({
        message: "Policy added successfully",
        id: result.insertId,
      });
    },
  );
};

// ✅ UPDATE POLICY
// export const updatePolicy = (req, res) => {
//   console.log("User Session:", req.session.user);

//   const { id } = req.params;
//   const { title, description } = req.body;

//   const sql = `
//     UPDATE policies
//     SET title = ?, description = ?
//     WHERE id = ?
//   `;

//   db.query(sql, [title, description, id], (err, result) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ message: "Update failed" });
//     }

//     res.json({
//       message: "Policy updated successfully",
//       sessionUser: req.session.user,
//     });
//   });
// };

export const updatePolicy = (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const companyId = req.user.company_id;

  if (!title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  const sql = `
    UPDATE policies
    SET 
      title = ?, 
      description = ?, 
      updated_at = NOW()
    WHERE id = ? AND company_id = ?
  `;

  db.query(sql, [title, description || null, id, companyId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Update failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Policy not found or unauthorized",
      });
    }

    res.json({
      message: "Policy updated successfully",
    });
  });
};

// ✅ DELETE POLICY
export const deletePolicy = (req, res) => {
  console.log("User Session:", req.session.user);

  const { id } = req.params;

  const sql = `DELETE FROM policies WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Delete failed" });
    }

    res.json({
      message: "Policy deleted successfully",
      sessionUser: req.session.user,
    });
  });
};
