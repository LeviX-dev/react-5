// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "gull"
// });

// db.connect((err) => {
//   if (err) {
//     console.log("Database connection failed:", err);
//   } else {
//     console.log("MySQL Connected...");
//   }
// });

// module.exports = db;

// import mysql from "mysql2";

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "gull",
// });

// db.connect((err) => {
//   if (err) {
//     console.log("Database connection failed:", err);
//   } else {
//     console.log("MySQL Connected...");
//   }
// });

// export default db;

//dzmbjxtk_hrms

import mysql from "mysql2";

const db = mysql.createPool({
  host: "react5.myospaz.in",
  user: "dzmbjxtk_myospazhrms",
  password: "dzmbjxtk_myospazhrms",
  database: "dzmbjxtk_myospazhrms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected...");
    connection.release();
  }
});

export default db;
