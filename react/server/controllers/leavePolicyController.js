import db from "../config/db.js";

/* ================= CREATE ================= */
export const createPolicy = (req, res) => {
  const { title, description, leaves } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title & Description required" });
  }

  // Normalize leaves array
  const normalizedLeaves = (leaves || []).map((item) => ({
    type: typeof item.type === "string" ? item.type : "",
    days: typeof item.days === "number" ? item.days : 0,
    isPaid: typeof item.isPaid === "boolean" ? item.isPaid : true,
  }));

  const sql =
    "INSERT INTO leave_policies (title, description, leaves) VALUES (?, ?, ?)";

  db.query(
    sql,
    [title, description, JSON.stringify(normalizedLeaves)],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Policy created successfully",
        id: result.insertId,
      });
    }
  );
};

/* ================= GET ALL ================= */
export const getPolicies = (req, res) => {
  db.query("SELECT * FROM leave_policies ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }

    const data = rows.map((item) => ({
      ...item,
      leaves: item.leaves ? JSON.parse(item.leaves) : [],
    }));

    res.json({ data });
  });
};

/* ================= UPDATE ================= */
export const updatePolicy = (req, res) => {
  const { id } = req.params;
  const { title, description, leaves } = req.body;

  // Normalize leaves array
  const normalizedLeaves = (leaves || []).map((item) => ({
    type: typeof item.type === "string" ? item.type : "",
    days: typeof item.days === "number" ? item.days : 0,
    isPaid: typeof item.isPaid === "boolean" ? item.isPaid : true,
  }));

  db.query(
    "UPDATE leave_policies SET title=?, description=?, leaves=? WHERE id=?",
    [title, description, JSON.stringify(normalizedLeaves), id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Updated successfully" });
    }
  );
};

/* ================= DELETE ================= */
export const deletePolicy = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM leave_policies WHERE id=?", [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Deleted successfully" });
  });
};