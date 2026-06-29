import db from "../config/db.js";

// ---------------- GET ALL ROLES ----------------
export const getAllRoles = (req, res) => {
  const sql = `
    SELECT id, name, guard_name, description, is_active, created_at, updated_at 
    FROM roles 
    WHERE is_active = 1
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("getAllRoles error:", err);
      return res.status(500).json({ message: "Failed to fetch roles" });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// ---------------- CREATE ROLE ----------------
export const createRole = (req, res) => {
  const { name, guard_name = "web", description = "" } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Role name is required" });
  }

  db.query(
    "SELECT id FROM roles WHERE name = ? LIMIT 1",
    [name.trim()],
    (err, existing) => {
      if (err) {
        console.error("createRole check error:", err);
        return res.status(500).json({ message: "Failed to create role" });
      }

      if (existing.length > 0) {
        return res
          .status(409)
          .json({ message: `Role "${name.trim()}" already exists` });
      }

      const insertSql = `
        INSERT INTO roles (name, guard_name, description, is_active, created_at, updated_at) 
        VALUES (?, ?, ?, 1, NOW(), NOW())
      `;

      db.query(
        insertSql,
        [name.trim(), guard_name, description],
        (err, result) => {
          if (err) {
            console.error("createRole insert error:", err);
            return res.status(500).json({ message: "Failed to create role" });
          }

          res.status(201).json({
            success: true,
            data: {
              id: result.insertId,
              name: name.trim(),
              guard_name,
              description,
              is_active: 1,
            },
          });
        },
      );
    },
  );
};

// ---------------- GET ROLE WITH NAVIGATION PERMISSIONS ----------------
export const getRoleNavigationPermissions = (req, res) => {
  const { id } = req.params;

  db.query("SELECT id, name FROM roles WHERE id = ?", [id], (err, role) => {
    if (err) {
      console.error("getRoleNavigationPermissions role error:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch role navigation permissions" });
    }

    if (role.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    const sql = `
      SELECT
        n.menu_id,
        n.menu_key,
        n.parent_key,
        COALESCE(rnp.can_view, 0) AS can_view
      FROM sidebar_menu n
      LEFT JOIN role_menu_permission rnp
        ON rnp.menu_key = n.menu_key
       AND rnp.role = ?
      WHERE n.is_active = 1
      ORDER BY n.parent_key IS NULL DESC, n.parent_key ASC, n.sort_order ASC, n.menu_id ASC
    `;

    db.query(sql, [role[0].name], (err, rows) => {
      if (err) {
        console.error("getRoleNavigationPermissions data error:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch role navigation permissions" });
      }

      const navigationIds = rows
        .filter((row) => Number(row.can_view) === 1)
        .map((row) => row.menu_key);

      return res.json({
        success: true,
        data: {
          role: role[0],
          navigationIds,
        },
      });
    });
  });
};

// ---------------- UPDATE ROLE NAVIGATION PERMISSIONS ----------------
export const updateRoleNavigationPermissions = (req, res) => {
  const { id } = req.params;
  let { navigation_ids } = req.body;

  if (!Array.isArray(navigation_ids)) {
    return res.status(400).json({ message: "navigation_ids must be an array" });
  }

  navigation_ids = navigation_ids
    .map(String)
    .filter((value) => value.trim() !== "");

  db.getConnection((err, conn) => {
    if (err) {
      console.error("getConnection error:", err);
      return res.status(500).json({ message: "Failed to get DB connection" });
    }

    conn.query("SELECT id, name FROM roles WHERE id = ?", [id], (err, roleData) => {
      if (err || roleData.length === 0) {
        conn.release();
        return res.status(500).json({ message: "Failed to get role" });
      }

      const roleName = roleData[0].name;

      conn.beginTransaction((err) => {
        if (err) {
          conn.release();
          console.error("beginTransaction error:", err);
          return res.status(500).json({ message: "Failed to start transaction" });
        }

        conn.query(
          "DELETE FROM role_menu_permission WHERE role = ?",
          [roleName],
          (err) => {
            if (err) {
              return conn.rollback(() => {
                conn.release();
                console.error("DELETE role_menu_permission error:", err);
                return res
                  .status(500)
                  .json({ message: "Failed to update navigation permissions" });
              });
            }

            if (navigation_ids.length === 0) {
              return conn.commit((err) => {
                conn.release();
                if (err) {
                  console.error("COMMIT error:", err);
                  return res
                    .status(500)
                    .json({ message: "Failed to update navigation permissions" });
                }

                return res.json({
                  success: true,
                  message: "Navigation permissions updated successfully",
                });
              });
            }

            const values = navigation_ids.map((menuKey) => [
              menuKey,
              roleName,
              1,
            ]);

            conn.query(
              "INSERT INTO role_menu_permission (menu_key, role, can_view) VALUES ?",
              [values],
              (err) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    console.error("INSERT role_menu_permission error:", err);
                    return res
                      .status(500)
                      .json({ message: "Failed to update navigation permissions" });
                  });
                }

                conn.commit((err) => {
                  conn.release();
                  if (err) {
                    console.error("COMMIT error:", err);
                    return res
                      .status(500)
                      .json({ message: "Failed to update navigation permissions" });
                  }

                  return res.json({
                    success: true,
                    message: "Navigation permissions updated successfully",
                  });
                });
              },
            );
          },
        );
      });
    });
  });
};