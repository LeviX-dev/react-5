import db from "../config/db.js";

/**
 * Migration: Add attendance_method column to employees table
 * Purpose: Support manual vs geo-fence attendance marking
 * Options: 'manual', 'geofence', 'tbd'
 */

export const addAttendanceMethodColumn = () => {
  const checkColumnSQL = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'employees' 
    AND TABLE_SCHEMA = 'dzmbjxtk_myospazhrms'
    AND COLUMN_NAME = 'attendance_method'
  `;

  db.query(checkColumnSQL, (err, result) => {
    if (err) {
      console.error("❌ Error checking for attendance_method column:", err);
      return;
    }

    if (result.length === 0) {
      // Column doesn't exist, add it
      const addColumnSQL = `
        ALTER TABLE employees 
        ADD COLUMN attendance_method ENUM('manual', 'geofence', 'tbd') DEFAULT 'manual' AFTER location_id
      `;

      db.query(addColumnSQL, (err) => {
        if (err) {
          console.error("❌ Error adding attendance_method column:", err);
        } else {
          console.log("✅ Successfully added attendance_method column to employees table");
        }
      });
    } else {
      console.log("✅ attendance_method column already exists");
    }
  });
};

// Run migration on startup
addAttendanceMethodColumn();
