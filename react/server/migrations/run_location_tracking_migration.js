import db from "../config/db.js";

const executeQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) { console.error("DB ERROR:", err); reject(err); }
      else resolve(results);
    });
  });

async function runMigration() {
  try {
    console.log("Starting live location tracking migration...");

    // 1. Create employee_tracking_stops table
    const createStopsTableSQL = `
      CREATE TABLE IF NOT EXISTS employee_tracking_stops (
        id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        employee_id BIGINT(20) UNSIGNED NOT NULL,
        attendance_log_id BIGINT(20) UNSIGNED NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        duration_seconds INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await executeQuery(createStopsTableSQL);
    console.log("✅ Created/verified employee_tracking_stops table");

    // 1b. Create employee_route_summaries table
    const createSummariesTableSQL = `
      CREATE TABLE IF NOT EXISTS employee_route_summaries (
        id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        employee_id BIGINT(20) UNSIGNED NOT NULL,
        attendance_log_id BIGINT(20) UNSIGNED NOT NULL UNIQUE,
        attendance_date DATE NOT NULL,
        total_distance_km DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        total_stops INT NOT NULL DEFAULT 0,
        moving_seconds INT NOT NULL DEFAULT 0,
        stopped_seconds INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await executeQuery(createSummariesTableSQL);
    console.log("✅ Created/verified employee_route_summaries table");

    // 2. Check if columns exist in employee_live_tracking
    const cols = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'employee_live_tracking' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    const columnNames = cols.map(c => c.COLUMN_NAME.toLowerCase());

    if (!columnNames.includes("distance_from_last")) {
      await executeQuery(`
        ALTER TABLE employee_live_tracking 
        ADD COLUMN distance_from_last DECIMAL(10, 2) DEFAULT 0.00 AFTER distance_from_office
      `);
      console.log("✅ Added column distance_from_last to employee_live_tracking");
    } else {
      console.log("ℹ️ Column distance_from_last already exists");
    }

    if (!columnNames.includes("stop_id")) {
      await executeQuery(`
        ALTER TABLE employee_live_tracking 
        ADD COLUMN stop_id BIGINT(20) UNSIGNED NULL DEFAULT NULL AFTER distance_from_last
      `);
      console.log("✅ Added column stop_id to employee_live_tracking");
    } else {
      console.log("ℹ️ Column stop_id already exists");
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
