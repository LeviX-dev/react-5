import db from "../config/db.js";

// ✅ GET ALL
export const getAllOfficeShifts = (req, res) => {
  const query = "SELECT * FROM office_shifts";

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Database error" });
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

    res.json(formatted);
  });
};

export const getOfficeShiftById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM office_shifts WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error fetching shift by id:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!result.length) {
      return res.status(404).json({ error: "Office shift not found" });
    }

    res.json(result[0]);
  });
};

// ✅ CREATE (FIXED)
// export const createOfficeShift = (req, res) => {
//   console.log("BODY DATA:", req.body);

//   const companyId = req.user.company_id; // 🔥 JWT se

//   let {
//     shift_name,
//     monday_in,
//     monday_out,
//     tuesday_in,
//     tuesday_out,
//     wednesday_in,
//     wednesday_out,
//     thursday_in,
//     thursday_out,
//     friday_in,
//     friday_out,
//     saturday_in,
//     saturday_out,
//     sunday_in,
//     sunday_out,
//   } = req.body;

//   // ✅ VALIDATION
//   if (!shift_name) {
//     return res.status(400).json({
//       error: "Shift Name is required",
//     });
//   }

//   const values = [
//     companyId,
//     shift_name || null,

//     monday_in || null,
//     monday_out || null,
//     tuesday_in || null,
//     tuesday_out || null,
//     wednesday_in || null,
//     wednesday_out || null,
//     thursday_in || null,
//     thursday_out || null,
//     friday_in || null,
//     friday_out || null,
//     saturday_in || null,
//     saturday_out || null,
//     sunday_in || null,
//     sunday_out || null,
//   ];

//   const query = `
//     INSERT INTO office_shifts (
//       company_id, shift_name,
//       monday_in, monday_out,
//       tuesday_in, tuesday_out,
//       wednesday_in, wednesday_out,
//       thursday_in, thursday_out,
//       friday_in, friday_out,
//       saturday_in, saturday_out,
//       sunday_in, sunday_out
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(query, values, (err, result) => {
//     if (err) {
//       console.error("Insert Error:", err);
//       return res.status(500).json({
//         error: "Database insert error",
//         details: err.message,
//       });
//     }

//     res.status(201).json({
//       message: "Office Shift Created Successfully",
//       id: result.insertId,
//     });
//   });
// };

export const createOfficeShift = (req, res) => {
  console.log("BODY DATA:", req.body);

  const companyId = req.user.company_id;

  let {
    shift_name,
    monday_in,
    monday_out,
    tuesday_in,
    tuesday_out,
    wednesday_in,
    wednesday_out,
    thursday_in,
    thursday_out,
    friday_in,
    friday_out,
    saturday_in,
    saturday_out,
    sunday_in,
    sunday_out,
  } = req.body;

  // ✅ FORMAT FIX FUNCTION 🔥
  const fixTime = (time) => {
    if (!time) return null;

    // 09.30 → 09:30
    let t = time.replace(".", ":");

    // 9:5 → 09:05
    const parts = t.split(":");
    if (parts.length === 2) {
      let h = parts[0].padStart(2, "0");
      let m = parts[1].padStart(2, "0");
      return `${h}:${m}`;
    }

    return t;
  };

  // ✅ APPLY FIX
  monday_in = fixTime(monday_in);
  monday_out = fixTime(monday_out);
  tuesday_in = fixTime(tuesday_in);
  tuesday_out = fixTime(tuesday_out);
  wednesday_in = fixTime(wednesday_in);
  wednesday_out = fixTime(wednesday_out);
  thursday_in = fixTime(thursday_in);
  thursday_out = fixTime(thursday_out);
  friday_in = fixTime(friday_in);
  friday_out = fixTime(friday_out);
  saturday_in = fixTime(saturday_in);
  saturday_out = fixTime(saturday_out);
  sunday_in = fixTime(sunday_in);
  sunday_out = fixTime(sunday_out);

  // ✅ VALIDATION
  if (!shift_name) {
    return res.status(400).json({
      error: "Shift Name is required",
    });
  }

  const values = [
    companyId,
    shift_name,

    monday_in,
    monday_out,
    tuesday_in,
    tuesday_out,
    wednesday_in,
    wednesday_out,
    thursday_in,
    thursday_out,
    friday_in,
    friday_out,
    saturday_in,
    saturday_out,
    sunday_in,
    sunday_out,
  ];

  const query = `
    INSERT INTO office_shifts (
      company_id, shift_name,
      monday_in, monday_out,
      tuesday_in, tuesday_out,
      wednesday_in, wednesday_out,
      thursday_in, thursday_out,
      friday_in, friday_out,
      saturday_in, saturday_out,
      sunday_in, sunday_out
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Insert Error:", err);
      return res.status(500).json({
        error: "Database insert error",
        details: err.message,
      });
    }

    res.status(201).json({
      message: "Office Shift Created Successfully ✅",
      id: result.insertId,
    });
  });
};
// ✅ UPDATE (FIXED)
export const updateOfficeShift = (req, res) => {
  const { id } = req.params;

  const companyId = req.user.company_id; // 🔥 security

  let {
    shift_name,
    monday_in,
    monday_out,
    tuesday_in,
    tuesday_out,
    wednesday_in,
    wednesday_out,
    thursday_in,
    thursday_out,
    friday_in,
    friday_out,
    saturday_in,
    saturday_out,
    sunday_in,
    sunday_out,
  } = req.body;

  if (!shift_name) {
    return res.status(400).json({
      error: "Shift Name is required",
    });
  }

  const query = `
    UPDATE office_shifts SET
      shift_name=?,
      monday_in=?, monday_out=?,
      tuesday_in=?, tuesday_out=?,
      wednesday_in=?, wednesday_out=?,
      thursday_in=?, thursday_out=?,
      friday_in=?, friday_out=?,
      saturday_in=?, saturday_out=?,
      sunday_in=?, sunday_out=?
    WHERE id=? AND company_id=?
  `;

  const values = [
    shift_name || null,

    monday_in || null,
    monday_out || null,
    tuesday_in || null,
    tuesday_out || null,
    wednesday_in || null,
    wednesday_out || null,
    thursday_in || null,
    thursday_out || null,
    friday_in || null,
    friday_out || null,
    saturday_in || null,
    saturday_out || null,
    sunday_in || null,
    sunday_out || null,

    id,
    companyId,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({
        error: "Database update error",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Not found or unauthorized",
      });
    }

    res.json({
      message: "Office Shift Updated Successfully",
    });
  });
};
// ✅ DELETE (SAFE)
export const deleteOfficeShift = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM office_shifts WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Delete Error:", err);
      return res.status(500).json({
        error: "Database delete error",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    res.json({ message: "Office Shift Deleted Successfully" });
  });
};

export const bulkDeleteOfficeShift = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    // ✅ MySQL Query (since your DB is MySQL)
    const query = "DELETE FROM office_shifts WHERE id IN (?)";

    db.query(query, [ids], (err, result) => {
      if (err) {
        console.error("Bulk delete error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(200).json({
        message: "Deleted successfully",
        affectedRows: result.affectedRows,
      });
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
