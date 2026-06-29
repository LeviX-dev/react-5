import db from "../config/db.js";

function buildNavigationTree(rows) {
  const byKey = new Map();
  const roots = [];

  rows.forEach((row) => {
    byKey.set(row.menu_key, {
      id: row.menu_key, // using menu_key as id for React keys and permissions matching
      name: row.label,
      type: row.path ? "link" : "dropDown", // Assuming if it has no path, it's a dropdown.
      icon: row.icon_key,
      path: row.path,
      sub: []
    });
  });

  rows.forEach((row) => {
    const current = byKey.get(row.menu_key);

    if (!current.path) delete current.path;

    if (row.parent_key) {
      const parent = byKey.get(row.parent_key);
      if (parent) parent.sub.push(current);
    } else {
      roots.push(current);
    }
  });

  // Drop empty sub arrays for link nodes.
  const cleanSubArrays = (items) => {
    items.forEach((item) => {
      if (item.sub && item.sub.length > 0) {
        cleanSubArrays(item.sub);
      } else {
        delete item.sub;
        if (!item.path && item.type === "dropDown") {
            // It's a dropdown, but empty. We still probably want to show it, or disable it.
            // Leaving as is, just removing empty sub.
        }
      }
    });
  };

  cleanSubArrays(roots);
  return roots;
}

export const getNavigations = (req, res) => {
  const sql = `
    SELECT
      menu_id,
      menu_key,
      label,
      icon_key,
      path,
      parent_key,
      sort_order
    FROM sidebar_menu
    WHERE is_active = 1
    ORDER BY parent_key IS NULL DESC, parent_key ASC, sort_order ASC, menu_id ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log("Navigation fetch error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json(buildNavigationTree(rows));
  });
};