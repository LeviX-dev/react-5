import db from "../config/db.js";

/**
 * Migration: Add is_event_marked column to calendar_events table
 * Purpose: Distinguish between holiday markings and event markings
 */

export const addEventMarkingColumn = () => {
  const checkColumnSQL = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'calendar_events' 
    AND TABLE_SCHEMA = 'dzmbjxtk_myospazhrms'
    AND COLUMN_NAME = 'is_event_marked'
  `;

  db.query(checkColumnSQL, (err, result) => {
    if (err) {
      console.error("Error checking for is_event_marked column:", err);
      return;
    }

    if (result.length === 0) {
      // Column doesn't exist, add it
      const addColumnSQL = `
        ALTER TABLE calendar_events 
        ADD COLUMN is_event_marked TINYINT(1) DEFAULT 0 AFTER is_holiday_marked
      `;

      db.query(addColumnSQL, (err) => {
        if (err) {
          console.error("Error adding is_event_marked column:", err);
        } else {
          console.log("Successfully added is_event_marked column to calendar_events table");
        }
      });
    } else {
      console.log("is_event_marked column already exists");
    }
  });
};

// Run migration on startup if needed
addEventMarkingColumn();
