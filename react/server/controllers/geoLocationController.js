import db from "../config/db.js";

// GET all geo locations
// export const getAllGeoLocations = async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM geo_locations");
//     res.status(200).json({ success: true, data: rows });
//   } catch (error) {
//     console.error("getAllGeoLocations error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // GET single geo location by ID
// export const getGeoLocationById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [rows] = await db.query("SELECT * FROM geo_locations WHERE id = ?", [
//       id,
//     ]);
//     if (rows.length === 0)
//       return res.status(404).json({ success: false, message: "Not found" });
//     res.status(200).json({ success: true, data: rows[0] });
//   } catch (error) {
//     console.error("getGeoLocationById error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // POST create geo location
// export const createGeoLocation = async (req, res) => {
//   try {
//     const { name, latitude, longitude } = req.body;
//     if (!name || !latitude || !longitude)
//       return res.status(400).json({
//         success: false,
//         message: "name, latitude, longitude are required",
//       });

//     const [result] = await db.query(
//       "INSERT INTO geo_locations (name, latitude, longitude) VALUES (?, ?, ?)",
//       [name, latitude, longitude],
//     );
//     res.status(201).json({
//       success: true,
//       message: "Geo location created",
//       data: { id: result.insertId, name, latitude, longitude },
//     });
//   } catch (error) {
//     console.error("createGeoLocation error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // PUT update geo location
// export const updateGeoLocation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, latitude, longitude } = req.body;
//     const [result] = await db.query(
//       "UPDATE geo_locations SET name = ?, latitude = ?, longitude = ? WHERE id = ?",
//       [name, latitude, longitude, id],
//     );
//     if (result.affectedRows === 0)
//       return res.status(404).json({ success: false, message: "Not found" });
//     res.status(200).json({ success: true, message: "Geo location updated" });
//   } catch (error) {
//     console.error("updateGeoLocation error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // DELETE geo location
// export const deleteGeoLocation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [result] = await db.query("DELETE FROM geo_locations WHERE id = ?", [
//       id,
//     ]);
//     if (result.affectedRows === 0)
//       return res.status(404).json({ success: false, message: "Not found" });
//     res.status(200).json({ success: true, message: "Geo location deleted" });
//   } catch (error) {
//     console.error("deleteGeoLocation error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // DELETE bulk geo locations
// export const bulkDeleteGeoLocations = async (req, res) => {
//   try {
//     const { ids } = req.body;

//     if (!ids || !Array.isArray(ids) || ids.length === 0)
//       return res
//         .status(400)
//         .json({ success: false, message: "No IDs provided" });

//     const placeholders = ids.map(() => "?").join(", ");
//     const [result] = await db.query(
//       `DELETE FROM geo_locations WHERE id IN (${placeholders})`,
//       ids,
//     );

//     res.status(200).json({
//       success: true,
//       message: `${result.affectedRows} geo location(s) deleted`,
//     });
//   } catch (error) {
//     console.error("bulkDeleteGeoLocations error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// ---------------- GET ALL GEO LOCATIONS ----------------
export const getAllGeoLocations = (req, res) => {
  const companyId = req.user?.company_id;

  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: "Company is required",
    });
  }

  const sql = "SELECT * FROM geo_locations WHERE company_id = ? ORDER BY id ASC";

  db.query(sql, [companyId], (err, result) => {
    if (err) {
      console.error("getAllGeoLocations error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// ---------------- GET SINGLE GEO LOCATION BY ID ----------------
export const getGeoLocationById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM geo_locations WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("getGeoLocationById error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({
      success: true,
      data: result[0],
    });
  });
};

// ---------------- CREATE GEO LOCATION ----------------
export const createGeoLocation = (req, res) => {
  const { name, latitude, longitude, radius } = req.body;

  const companyId = req.user.company_id; // 🔥 JWT se

  console.log("Creating geo location:", {
    name,
    latitude,
    longitude,
    companyId,
  });

  if (!name || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "name, latitude, longitude are required",
    });
  }

  const query = `
    INSERT INTO geo_locations 
    (company_id, name, latitude, longitude, radius, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [companyId, name, latitude, longitude, radius || 500],
    (err, result) => {
      if (err) {
        console.error("createGeoLocation error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({
        success: true,
        message: "Geo location created",
        data: {
          id: result.insertId,
          name,
          latitude,
          longitude,
          radius: radius || 500,
        },
      });
    },
  );
};

// ---------------- UPDATE GEO LOCATION ----------------
export const updateGeoLocation = (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, radius } = req.body;

  const companyId = req.user.company_id; // 🔥 security

  const query = `
    UPDATE geo_locations 
    SET 
      name = ?, 
      latitude = ?, 
      longitude = ?, 
      radius = ?, 
      updated_at = NOW()
    WHERE id = ? AND company_id = ?
  `;

  db.query(
    query,
    [name, latitude, longitude, radius || 500, id, companyId],
    (err, result) => {
      if (err) {
        console.error("updateGeoLocation error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Not found or unauthorized",
        });
      }

      res.json({
        success: true,
        message: "Geo location updated",
      });
    },
  );
};

// ---------------- DELETE GEO LOCATION ----------------
export const deleteGeoLocation = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM geo_locations WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("deleteGeoLocation error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({
      success: true,
      message: "Geo location deleted",
    });
  });
};

// ---------------- BULK DELETE GEO LOCATIONS ----------------
export const bulkDeleteGeoLocations = async (req, res) => {
  try {
    let { ids } = req.body;

    // ✅ Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No IDs provided",
      });
    }

    // ✅ Remove duplicates
    ids = [...new Set(ids)];

    // ✅ Ensure all are numbers (important)
    ids = ids.map((id) => Number(id)).filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs",
      });
    }

    // ✅ Dynamic placeholders
    const placeholders = ids.map(() => "?").join(",");

    const query = `DELETE FROM geo_locations WHERE id IN (${placeholders})`;

    // ✅ Execute query
    db.query(query, ids, (err, result) => {
      if (err) {
        console.error("❌ bulkDeleteGeoLocations DB Error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      return res.status(200).json({
        success: true,
        message: `${result.affectedRows} location(s) deleted successfully`,
        deletedCount: result.affectedRows,
      });
    });
  } catch (error) {
    console.error("❌ bulkDeleteGeoLocations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
