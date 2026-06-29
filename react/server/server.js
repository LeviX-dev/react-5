// const express = require("express");
// const cors = require("cors");
// const app = express();

// app.use(cors());
// app.use(express.json());

// const departmentRoutes = require("./routes/departmentRoutes");

// app.use("/api", departmentRoutes);

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });

import express from "express";
import session from "express-session";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import designationRoutes from "./routes/designationRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import rolesRouter from "./routes/rolesRoutes.js";
import permissionRoutes from "./routes/permissionsRoutes.js";
import geoLocationRoutes from "./routes/geoLocationRoutes.js";
import officeShiftRoutes from "./routes/officeShiftRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import yearattendenceRoutes from "./routes/yearattendeceRoutes.js";
import "./cron/attendanceCron.js";
import { startAttendanceCron } from "./cron/attendanceCron.js";
import { startGeoFenceCron } from "./cron/geoFenceCron.js";
import { generateTodayAttendance } from "./controllers/yearattendeceController.js";
import companyRoutes from "./routes/companyRoutes.js";
import navigationRoutes from "./routes/navigationRoutes.js";
import salaryPolicyRoutes from "./routes/salaryPolicyRoutes.js";
import leavePolicyRoutes from "./routes/leavePolicyRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import paySlipRoutes from "./routes/payslipRoutes.js";
import geoFenceMonitorRoutes from "./routes/geoFenceMonitorRoutes.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://react5.myospaz.in","http://192.168.1.2:3000"],
    credentials: true,
  }),
);

app.set("trust proxy", 1);

// ✅ Determine if we're in production (HTTPS) or development (HTTP)
const isProduction = process.env.NODE_ENV === 'production';
const isLocalHttpRequest = (req) => {
  return req.hostname === 'localhost' || req.hostname.startsWith('192.168');
};

app.use(
  session({
    name: "sessionId",
    secret: "mysessionsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Allow HTTP for local/mobile development
      sameSite: "lax", // Changed to "lax" to allow cross-origin in most cases
      httpOnly: true,
    },
  }),
);

// ✅ Comprehensive API Request/Response Logging Middleware
app.use((req, res, next) => {
  // Capture request start time
  const startTime = Date.now();
  
  // Log incoming request details
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    params: req.params,
    query: req.query,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : null,
  };
  
  console.log("📥 [INCOMING REQUEST]", JSON.stringify(requestLog, null, 2));
  
  // Intercept response
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusMessage = statusCode >= 400 ? "❌ FAILURE" : "✅ SUCCESS";
    
    const responseLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: statusCode,
      statusMessage: statusMessage,
      responseTime: `${responseTime}ms`,
      responseSize: data ? Buffer.byteLength(JSON.stringify(data)) : 0,
      response: typeof data === "string" ? data : (data && Object.keys(data).length > 0 ? data : "No data"),
    };
    
    console.log(`📤 [${statusMessage}]`, JSON.stringify(responseLog, null, 2));
    
    // Call original send function
    return originalSend.call(this, data);
  };
  
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api", departmentRoutes);
app.use("/api", designationRoutes);
app.use("/api", employeeRoutes);
app.use("/api", usersRoutes);
app.use("/api", rolesRouter);
app.use("/api/permissions", permissionRoutes);
app.use("/api", geoLocationRoutes);
app.use("/api", officeShiftRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api", announcementRoutes);
app.use("/api", calendarRoutes);
app.use("/api", yearattendenceRoutes);
app.use("/api/companies", companyRoutes); 
app.use("/api", navigationRoutes); 
app.use("/api/salary-policies", salaryPolicyRoutes);
app.use("/api/leave-policy", leavePolicyRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payslips", paySlipRoutes);
app.use("/api", geoFenceMonitorRoutes);

// ✅ Global Error Handler Middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  const errorLog = {
    timestamp: timestamp,
    method: req.method,
    url: req.originalUrl,
    statusCode: err.statusCode || 500,
    message: err.message,
    stack: err.stack,
    ip: req.ip || req.connection.remoteAddress,
  };
  
  console.error("❌ [ERROR CAUGHT]", JSON.stringify(errorLog, null, 2));
  
  // Send error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    statusCode: statusCode,
    timestamp: timestamp,
  });
});

// ✅ 404 Not Found Handler
app.use((req, res) => {
  const notFoundLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode: 404,
    message: "Route not found",
    ip: req.ip || req.connection.remoteAddress,
  };
  
  console.warn("⚠️  [404 NOT FOUND]", JSON.stringify(notFoundLog, null, 2));
  
  res.status(404).json({
    error: "Route not found",
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
});

app.listen(5000, async () => {
  console.log("Server running on port 5000");

  // ✅ Start CRONs
  startAttendanceCron();
  startGeoFenceCron();

  // ✅ Ensure today's attendance
  await generateTodayAttendance();

  console.log("✅ System ready");
});
