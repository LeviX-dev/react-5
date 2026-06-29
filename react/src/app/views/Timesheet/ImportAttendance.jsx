import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "app/services/api";
import { Alert, Table, Spinner } from "react-bootstrap";

const Page = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(null);
    setFileError("");
    setImportResult(null);

    if (!selectedFile) return;

    // Validate file extension
    const ext = "." + selectedFile.name.split(".").pop().toLowerCase();
    const allowedExts = [".xls", ".xlsx", ".csv"];
    if (!allowedExts.includes(ext)) {
      setFileError("Only .xls, .xlsx, and .csv files are allowed.");
      e.target.value = "";
      return;
    }

    // Validate file size (2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setFileError("File size must not exceed 2MB.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const downloadSample = () => {
    const headers = ["Staff Id", "Attendance Date", "Clock In", "Clock Out"];
    const sampleRows = [
      // Employee 1 - Full week with clock in/out times
      ["EMP001", "2026-06-01", "09:00", "18:00"],
      ["EMP001", "2026-06-02", "09:15", "18:30"],
      ["EMP001", "2026-06-03", "08:45", "17:45"],
      ["EMP001", "2026-06-04", "08:30", "17:30"],
      ["EMP001", "2026-06-05", "09:00", "18:00"],
      // Employee 2 - Mix of present and partial entries
      ["EMP002", "2026-06-01", "09:00", "18:00"],
      ["EMP002", "2026-06-02", "09:00", "18:00"],
      ["EMP002", "2026-06-03", "09:00", "18:00"],
      // Employee 3 - Week with varying times
      ["EMP003", "2026-06-01", "08:30", "17:30"],
      ["EMP003", "2026-06-02", "08:30", "17:30"],
      ["EMP003", "2026-06-03", "08:30", "17:30"],
      ["EMP003", "2026-06-04", "08:30", "17:30"],
      ["EMP003", "2026-06-05", "08:30", "17:30"],
    ];
    const csvContent = [headers.join(","), ...sampleRows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_import_sample_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!file) {
      toast.error("Please choose a file before saving!");
      return;
    }

    setUploading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/api/attendance/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // Handle new all-or-nothing response format
        setImportResult({
          success: response.data.imported || 0,
          failed: response.data.failed || 0,
          totalRows: response.data.totalRows || 0,
          errors: response.data.errors || [],
          attendance: response.data.attendance || [],
          allOrNothing: response.data.allOrNothing,
        });
        setFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(response.data.message || "Import failed");
      }
    } catch (error) {
      console.error("Import error:", error);
      const message = error.response?.data?.message || error.message || "Import failed";
      toast.error(message);
      // Handle all-or-nothing error response with detailed errors
      if (error.response?.data) {
        setImportResult({
          success: 0,
          failed: error.response.data.failed || error.response.data.totalRows || 0,
          totalRows: error.response.data.totalRows || 0,
          errors: error.response.data.errors || [],
          allOrNothing: true,
          aborted: true,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const styles = {
    container: {
      padding: "32px",
      backgroundColor: "#f3f3f3",
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "900px", // controls content width
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderRadius: "12px",
      padding: "24px",
    },
    heading: {
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "16px",
    },
    button: {
      backgroundColor: "#6b21a8",
      color: "#ffffff",
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      marginBottom: "16px",
    },
    paragraph: {
      color: "#6b7280",
      marginBottom: "8px",
    },
    list: {
      color: "#6b7280",
      marginBottom: "16px",
      paddingLeft: "20px",
    },
    input: {
      width: "100%",
      padding: "8px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      marginBottom: "4px",
    },
    smallText: {
      color: "#9ca3af",
      fontSize: "12px",
      marginTop: "4px",
    },
    selectedFile: {
      marginTop: "8px",
      color: "#374151",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Import EXCEL/CSV file (Manual)</h2>

        <button
          style={styles.button}
          onClick={downloadSample}
        >
          Download Sample File
        </button>

<p style={styles.paragraph}>
  The first row in the downloaded sample file is the header — <strong>do not remove or rename it</strong>.
  Do not change the order of columns.
</p>

<p style={styles.paragraph}>
  <strong>Required column order:</strong>
</p>

<div style={{ overflowX: "auto", marginBottom: "16px" }}>
  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
    <thead>
      <tr style={{ backgroundColor: "#f3e8ff" }}>
        {["Column", "Field", "Required", "Format", "Example"].map(h => (
          <th key={h} style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "left", fontWeight: "600" }}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {[
        ["A", "Staff Id",        "✅ Yes", "Text",            "EMP001"],
        ["B", "Attendance Date", "✅ Yes", "YYYY-MM-DD",      "2026-06-15"],
        ["C", "Clock In",        "⬜ No",  "HH:MM (24-hour)", "09:00"],
        ["D", "Clock Out",       "⬜ No",  "HH:MM (24-hour)", "18:00"],
      ].map(([col, field, req, fmt, ex]) => (
        <tr key={col} style={{ backgroundColor: "#fff" }}>
          <td style={{ padding: "7px 12px", border: "1px solid #ddd", color: "#6b7280" }}>{col}</td>
          <td style={{ padding: "7px 12px", border: "1px solid #ddd", fontWeight: "500" }}>{field}</td>
          <td style={{ padding: "7px 12px", border: "1px solid #ddd", textAlign: "center" }}>{req}</td>
          <td style={{ padding: "7px 12px", border: "1px solid #ddd", fontFamily: "monospace", color: "#6b21a8" }}>{fmt}</td>
          <td style={{ padding: "7px 12px", border: "1px solid #ddd", fontFamily: "monospace", color: "#374151" }}>{ex}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<ul style={styles.list}>
  <li><strong>Staff Id</strong> must match an existing employee in the system exactly.</li>
  <li><strong>Attendance Date</strong> must be in <code>YYYY-MM-DD</code> format (e.g. <code>2026-06-15</code>).</li>
  <li><strong>Clock In / Clock Out</strong> must be in 24-hour <code>HH:MM</code> format (e.g. <code>09:00</code>, <code>18:30</code>). Both are optional but Clock Out must be later than Clock In.</li>
  <li>A duplicate entry for the same Staff Id, Date, and Clock In time will be rejected.</li>
  <li>Import is <strong>all-or-nothing</strong> — if any row fails, no records are imported. Fix all errors shown and re-upload.</li>
</ul>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            Upload File
          </label>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            style={styles.input}
          />
          {fileError && (
            <p style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
              {fileError}
            </p>
          )}
          <p style={styles.smallText}>
            Please select excel/csv file (allowed file size 2MB)
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!file || uploading}
          style={{
            ...styles.button,
            opacity: !file || uploading ? 0.65 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {uploading ? (
            <>
              <Spinner animation="border" size="sm" />
              Uploading...
            </>
          ) : (
            "Save"
          )}
        </button>

        {file && (
          <p style={styles.selectedFile}>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        {/* Import Results - All or Nothing */}
        {importResult && (
          <div style={{ marginTop: "24px" }}>
            {/* Summary Alert */}
            {importResult.aborted ? (
              <Alert variant="danger">
                <strong>❌ Import ABORTED</strong> - No attendance was imported
                <div style={{ marginTop: "8px", fontSize: "14px" }}>
                  {importResult.failed} of {importResult.totalRows} row(s) failed validation.
                  <br />
                  <strong>Fix all errors and try again.</strong>
                </div>
              </Alert>
            ) : importResult.failed > 0 ? (
              <Alert variant="warning">
                <strong>⚠️ Import FAILED</strong> - All changes rolled back
                <div style={{ marginTop: "8px", fontSize: "14px" }}>
                  Database error occurred. No attendance was imported.
                </div>
              </Alert>
            ) : (
              <Alert variant="success">
                <strong>✅ Import SUCCESSFUL</strong>
                <div style={{ marginTop: "8px", fontSize: "14px" }}>
                  {importResult.success} attendance record(s) imported successfully
                  {importResult.totalRows > 0 && ` (${importResult.totalRows} total rows)`}
                </div>
              </Alert>
            )}

            {/* Detailed Errors Table */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h6 style={{ color: "#c62828", marginBottom: "12px" }}>
                  Validation Errors (Fix these and re-import):
                </h6>
                <div style={{ maxHeight: "400px", overflow: "auto", border: "1px solid #ddd", borderRadius: "4px" }}>
                  <Table bordered size="sm" responsive style={{ marginBottom: 0 }}>
                    <thead style={{ backgroundColor: "#ffebee", position: "sticky", top: 0 }}>
                      <tr>
                        <th style={{ width: "80px" }}>Row</th>
                        <th>Error Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((err, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: "bold", textAlign: "center" }}>{err.row}</td>
                          <td style={{ color: "#c62828" }}>{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                {importResult.errors.length > 10 && (
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                    Showing all {importResult.errors.length} errors
                  </p>
                )}
              </div>
            )}

            {/* Successfully Imported Attendance */}
            {importResult.attendance && importResult.attendance.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h6 style={{ color: "#2e7d32", marginBottom: "12px" }}>
                  ✅ Successfully Imported Attendance:
                </h6>
                <div style={{ maxHeight: "300px", overflow: "auto", border: "1px solid #ddd", borderRadius: "4px" }}>
                  <Table bordered size="sm" responsive style={{ marginBottom: 0 }}>
                    <thead style={{ backgroundColor: "#e8f5e9", position: "sticky", top: 0 }}>
                      <tr>
                        <th>Row</th>
                        <th>Staff ID</th>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.attendance.map((att, idx) => (
                        <tr key={idx}>
                          <td>{att.row}</td>
                          <td>{att.staffId}</td>
                          <td>{att.employeeName}</td>
                          <td>{att.attendanceDate}</td>
                          <td>{att.clockIn || "-"}</td>
                          <td>{att.clockOut || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
