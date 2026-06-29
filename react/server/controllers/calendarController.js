import db from "../config/db.js";

// ---------------- GET ALL EVENTS ----------------
export const getEvents = (req, res) => {
  const { year } = req.query;

  const sql = `
    SELECT 
      id,
      title,
      description,
      DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date,
      type,
      icon,
      is_holiday_marked,
      is_event_marked
    FROM calendar_events
    WHERE YEAR(event_date) = ?
    ORDER BY event_date ASC
  `;

  db.query(sql, [year], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = {};

    result.forEach((ev) => {
      const date = ev.event_date;

      if (!formatted[date]) {
        formatted[date] = [];
      }

      formatted[date].push({
        id: ev.id,
        name: ev.title,
        description: ev.description,
        type: ev.type,
        icon: ev.icon,
        isHolidayMarked: !!ev.is_holiday_marked,
        isEventMarked: !!ev.is_event_marked,
      });
    });

    res.json(formatted);
  });
};

// ---------------- ADD EVENT ----------------
export const addEvent = (req, res) => {
  console.log(req.body);
  const { title, description, event_date, type, icon, isHolidayMarked, isEventMarked } =
    req.body;

  if (!title || !event_date) {
    return res.status(400).json({
      message: "Title and Date are required",
    });
  }

  const sql = `
    INSERT INTO calendar_events 
    (title, description, event_date, type, icon, is_holiday_marked, is_event_marked)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, event_date, type, icon, isHolidayMarked || 0, isEventMarked || 0],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      res.json({
        message: "Event added successfully",
        id: result.insertId,
      });
    },
  );
};

// ---------------- ✅ UPDATE HOLIDAY (NEW) ----------------
export const markHolidayByDate = (req, res) => {
  const { date, isHolidayMarked } = req.body;

  if (!date) {
    return res.status(400).json({
      message: "Date is required",
    });
  }

  const sql = `
    UPDATE calendar_events
    SET is_holiday_marked = ?
    WHERE event_date = ?
  `;

  db.query(sql, [isHolidayMarked, date], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    res.json({
      message: "Holiday updated successfully",
    });
  });
};

// ---------------- DELETE EVENT ----------------
export const deleteEvent = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM calendar_events WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    res.json({
      message: "Event deleted successfully",
    });
  });
};

// ---------------- MARK HOLIDAY BY EVENT ID ----------------
export const markHolidayById = (req, res) => {
  const { id, isHolidayMarked } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  const sql = `
    UPDATE calendar_events
    SET is_holiday_marked = ?
    WHERE id = ?
  `;

  db.query(sql, [isHolidayMarked, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Holiday updated successfully" });
  });
};

// ---------------- GET ALL HOLIDAYS ----------------
export const getHolidays = (req, res) => {
  const sql = `
    SELECT
      id,
      event_name,
      company,
      description,
      DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
      status,
      published
    FROM holidays
    ORDER BY start_date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
};

// ---------------- ADD HOLIDAY ----------------
export const addHoliday = (req, res) => {
  const { eventName, company, description, startDate, endDate, status } = req.body;

  if (!eventName || !startDate || !endDate) {
    return res.status(400).json({
      message: "Event name, start date, and end date are required",
    });
  }

  const sql = `
    INSERT INTO holidays
    (event_name, company, description, start_date, end_date, status, published)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `;

  db.query(
    sql,
    [eventName, company, description, startDate, endDate, status],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      res.json({
        message: "Holiday added successfully",
        id: result.insertId,
      });
    },
  );
};

// ---------------- UPDATE HOLIDAY ----------------
export const updateHoliday = (req, res) => {
  const { id } = req.params;
  const { eventName, company, description, startDate, endDate, status } = req.body;

  if (!id || !eventName || !startDate || !endDate) {
    return res.status(400).json({
      message: "ID, event name, start date, and end date are required",
    });
  }

  const sql = `
    UPDATE holidays
    SET event_name = ?, company = ?, description = ?, start_date = ?, end_date = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [eventName, company, description, startDate, endDate, status, id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      res.json({
        message: "Holiday updated successfully",
      });
    },
  );
};

// ---------------- DELETE HOLIDAY ----------------
export const deleteHoliday = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM holidays WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    res.json({
      message: "Holiday deleted successfully",
    });
  });
};
export const getUpcomingHolidays = (req, res) => {
  const sql = `
  SELECT 
  id,
  title,
  description,
  DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date,
  type,
  icon
FROM calendar_events
WHERE is_holiday_marked = 1
  AND event_date >= CURDATE()
ORDER BY event_date ASC
LIMIT 5;
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
};

// ---- MARK EVENT BY ID ----
export const markEventById = (req, res) => {
  const { id, isEventMarked } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  const sql = `
    UPDATE calendar_events
    SET is_event_marked = ?
    WHERE id = ?
  `;

  db.query(sql, [isEventMarked ? 1 : 0, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Event marked successfully" });
  });
};

// ---- GET UPCOMING EVENTS ----
export const getUpcomingEvents = (req, res) => {
  const sql = `
  SELECT 
  id,
  title,
  description,
  DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date,
  type,
  icon
FROM calendar_events
WHERE is_event_marked = 1
  AND is_holiday_marked = 0
  AND event_date >= CURDATE()
ORDER BY event_date ASC
LIMIT 5;
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
};