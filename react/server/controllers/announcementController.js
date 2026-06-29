import db from "../config/db.js";

// GET all announcements
export const getAnnouncements = (req, res) => {
  const sql = `
    SELECT 
      a.id,
      a.title,
      a.summary,
      a.description,
      a.start_date AS startDate,
      a.end_date AS endDate,
      a.added_by AS addedBy,
      a.is_notify AS notify,
      c.company_name AS company,
      d.department_name AS publishedFor
    FROM announcements a
    LEFT JOIN companies c ON a.company_id = c.id
    LEFT JOIN departments d ON a.department_id = d.id
    ORDER BY a.id DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ announcements: result });
  });
};

// POST add announcement
export const addAnnouncement = (req, res) => {
  const {
    title,
    summary,
    description,
    companyId,
    departmentId,
    startDate,
    endDate,
    notify,
  } = req.body;

  const sql = `
    INSERT INTO announcements 
    (title, summary, description, company_id, department_id, start_date, end_date, is_notify, added_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      summary,
      description,
      companyId || null,
      departmentId || null,
      startDate,
      endDate,
      notify ? 1 : 0,
      "admin",
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ id: result.insertId });
    },
  );
};

// PUT update announcement
export const updateAnnouncement = (req, res) => {
  const { id } = req.params;
  const {
    title,
    summary,
    description,
    companyId,
    departmentId,
    startDate,
    endDate,
    notify,
  } = req.body;

  const sql = `
    UPDATE announcements
    SET title=?, summary=?, description=?, company_id=?, department_id=?, start_date=?, end_date=?, is_notify=?
    WHERE id=?
  `;
  db.query(
    sql,
    [
      title,
      summary,
      description,
      companyId || null,
      departmentId || null,
      startDate,
      endDate,
      notify ? 1 : 0,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Updated successfully" });
    },
  );
};

// DELETE announcement
export const deleteAnnouncement = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM announcements WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Deleted successfully" });
  });
};
