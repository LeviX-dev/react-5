import db from "../config/db.js";

// ---------------- GET ALL PERMISSIONS ----------------
export const getAllPermissions = (req, res) => {
  const sql = "SELECT id, name, guard_name FROM permissions";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("getAllPermissions error:", err);
      return res.status(500).json({ message: "Failed to fetch permissions" });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};
