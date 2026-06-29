// import React, { useState } from "react";
// import { Row, Col, Card, Button, Form, Alert, Table, Spinner } from "react-bootstrap";
// import { toast } from "react-toastify";
// import Breadcrumb from "app/components/Breadcrumb";
// import api from "app/services/api";

// // Rule: allowed MIME types for import files
// const ALLOWED_MIME_TYPES = [
//   "application/vnd.ms-excel",                                          // .xls
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
//   "text/csv",                                                          // .csv
//   "application/csv",
// ];
// // Rule: allowed file extensions
// const ALLOWED_EXTENSIONS = [".xls", ".xlsx", ".csv"];
// // Rule: max file size 2MB
// const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

// export default function ImportEmployees() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [fileError, setFileError] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [importResult, setImportResult] = useState(null);

//   // ---------- File validation handler ----------
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setSelectedFile(null);
//     setFileError("");
//     setImportResult(null);

//     if (!file) return;

//     // Rule: check file extension (case-insensitive)
//     const ext = "." + file.name.split(".").pop().toLowerCase();
//     if (!ALLOWED_EXTENSIONS.includes(ext)) {
//       setFileError("Only .xls, .xlsx, and .csv files are allowed.");
//       e.target.value = "";
//       return;
//     }

//     // Rule: check MIME type
//     if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
//       setFileError("Invalid file type. Please upload an Excel or CSV file.");
//       e.target.value = "";
//       return;
//     }

//     // Rule: enforce 2MB size limit
//     if (file.size > MAX_FILE_SIZE_BYTES) {
//       setFileError("File size must not exceed 2MB.");
//       e.target.value = "";
//       return;
//     }

//     setSelectedFile(file);
//   };

//   // ---------- Download sample file ----------
//   const downloadSample = () => {
//     const headers = [
//       "First Name",
//       "Last Name",
//       "Staff Id",
//       "Username",
//       "Email",
//       "Password",
//       "Joining Date",
//       "Gender",
//       "Date of Birth",
//       "Contact Number",
//       "Address",
//       "City",
//       "Zip",
//       "Country",
//       "Attendance Type",
//       "Company Name",
//       "Department Name",
//       "Designation Name",
//       "Shift Name",
//       "Role Name",
//     ];
//     const sampleRow = [
//       "John",
//       "Doe",
//       "EMP001",
//       "johndoe",
//       "john@example.com",
//       "Password123",
//       "2024-01-15",
//       "Male",
//       "1990-05-20",
//       "1234567890",
//       "123 Main St",
//       "New York",
//       "10001",
//       "USA",
//       "general",
//       "My Company",
//       "IT Department",
//       "Software Engineer",
//       "Morning Shift",
//       "Employee",
//     ];
//     const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     const url = URL.createObjectURL(blob);
//     link.setAttribute("href", url);
//     link.setAttribute("download", "employee_import_sample.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // ---------- Upload file ----------
//   const handleUpload = async () => {
//     if (!selectedFile) return;

//     setUploading(true);
//     setImportResult(null);

//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const response = await api.post("/api/employees/import", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       if (response.data.success) {
//         toast.success(response.data.message);
//         // Handle new all-or-nothing response format
//         setImportResult({
//           success: response.data.imported || 0,
//           failed: response.data.failed || 0,
//           totalRows: response.data.totalRows || 0,
//           errors: response.data.errors || [],
//           employees: response.data.employees || [],
//           allOrNothing: response.data.allOrNothing,
//         });
//         setSelectedFile(null);
//         // Reset file input
//         const fileInput = document.getElementById("formFile");
//         if (fileInput) fileInput.value = "";
//       } else {
//         toast.error(response.data.message || "Import failed");
//       }
//     } catch (error) {
//       console.error("Import error:", error);
//       const message = error.response?.data?.message || error.message || "Import failed";
//       toast.error(message);
//       // Handle all-or-nothing error response with detailed errors
//       if (error.response?.data) {
//         setImportResult({
//           success: 0,
//           failed: error.response.data.failed || error.response.data.totalRows || 0,
//           totalRows: error.response.data.totalRows || 0,
//           errors: error.response.data.errors || [],
//           allOrNothing: true,
//           aborted: true,
//         });
//       }
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div>
//       <Breadcrumb
//         routeSegments={[
//           { name: "Employees", path: "/employees" },
//           { name: "Import Employees" }
//         ]}
//       />

//       <Card
//         body
//         style={{
//           borderRadius: "10px",
//           padding: "20px",
//           marginTop: "20px",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
//         }}
//       >
//         <h5 style={{ marginBottom: "15px" }}>Import EXCEL/CSV file only</h5>

//         {/* Download Sample Button */}
//         <Row className="mb-3">
//           <Col md="auto">
//             <Button
//               onClick={downloadSample}
//               style={{
//                 backgroundColor: "#6f42c1",
//                 borderColor: "#6f42c1",
//                 color: "#fff",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//                 borderRadius: "5px",
//                 padding: "8px 16px"
//               }}
//             >
//               <i className="i-Download"></i>
//               Download Sample File
//             </Button>
//           </Col>
//         </Row>

//         {/* Instructions */}
//         <p style={{ fontSize: "14px", color: "#959292ff", marginBottom: "10px" }}>
//           The first line in downloaded sample file should remain as it is. Please do not change the order of columns in file.
//         </p>
//         <p style={{ fontSize: "14px", color: "#959292ff", marginBottom: "10px" }}>
//           The correct column order is (First Name, Last Name, Staff Id, Username, Email, Password, Joining Date, Gender, Date of Birth, Contact Number, Address, City, Zip, County, Attendance Type, Company Name, Department Name, Designation Name, Shift Name, Role Name).
//         </p>
//         <ul style={{ fontSize: "14px", color: "#0c0c0cff", paddingLeft: "20px", marginBottom: "20px"}}>
//           <li>Date format should be (According to general settings)</li>
//           <li>Company, Department, Designation, Shift and Role name must be matched with your existing data.</li>
//           <li>Gender must be Male / Female / Other.</li>
//           <li>Attendance Type must be general / ip_based.</li>
//           <li>You must follow the file, otherwise you will get an error while importing the file.</li>
//         </ul>

//         {/* File Upload */}
//         <Form.Group controlId="formFile" className="mb-3">
//           <Form.Label>Upload File <span className="text-danger">*</span></Form.Label>
//           <Form.Control
//             type="file"
//             // Rule: browser-level hint — only show Excel/CSV in picker
//             accept=".xls,.xlsx,.csv"
//             onChange={handleFileChange}
//             isInvalid={!!fileError}
//             style={{
//               borderRadius: "5px",
//               padding: "6px 12px"
//             }}
//           />
//           {/* Inline error message when file is invalid */}
//           <Form.Control.Feedback type="invalid">{fileError}</Form.Control.Feedback>
//           <small style={{ fontSize: "12px", color: "#777" }}>
//             Please select excel/csv file (allowed file size 2MB)
//           </small>
//         </Form.Group>

//         {/* Save Button — disabled until a valid file is selected */}
//         <Row>
//           <Col md="auto">
//             <Button
//               onClick={handleUpload}
//               disabled={!selectedFile || uploading}
//               style={{
//                 backgroundColor: "#6f42c1",
//                 borderColor: "#6f42c1",
//                 color: "#fff",
//                 borderRadius: "5px",
//                 padding: "8px 16px",
//                 opacity: !selectedFile || uploading ? 0.65 : 1,
//               }}
//             >
//               {uploading ? (
//                 <>
//                   <Spinner
//                     as="span"
//                     animation="border"
//                     size="sm"
//                     role="status"
//                     aria-hidden="true"
//                     style={{ marginRight: "8px" }}
//                   />
//                   Uploading...
//                 </>
//               ) : (
//                 <>
//                   <i className="i-Data-Save" style={{ marginRight: "8px" }}></i>
//                   Save
//                 </>
//               )}
//             </Button>
//           </Col>
//         </Row>

//         {/* Import Results - All or Nothing */}
//         {importResult && (
//           <div style={{ marginTop: "24px" }}>
//             {/* Summary Alert */}
//             {importResult.aborted ? (
//               <Alert variant="danger">
//                 <strong>❌ Import ABORTED</strong> - No data was imported
//                 <div style={{ marginTop: "8px", fontSize: "14px" }}>
//                   {importResult.failed} of {importResult.totalRows} row(s) failed validation.
//                   <br />
//                   <strong>Fix all errors and try again.</strong>
//                 </div>
//               </Alert>
//             ) : importResult.failed > 0 ? (
//               <Alert variant="warning">
//                 <strong>⚠️ Import FAILED</strong> - All changes rolled back
//                 <div style={{ marginTop: "8px", fontSize: "14px" }}>
//                   Database error occurred. No employees were imported.
//                 </div>
//               </Alert>
//             ) : (
//               <Alert variant="success">
//                 <strong>✅ Import SUCCESSFUL</strong>
//                 <div style={{ marginTop: "8px", fontSize: "14px" }}>
//                   {importResult.success} employee(s) imported successfully
//                   {importResult.totalRows > 0 && ` (${importResult.totalRows} total rows)`}
//                 </div>
//               </Alert>
//             )}

//             {/* Detailed Errors Table */}
//             {importResult.errors && importResult.errors.length > 0 && (
//               <div style={{ marginTop: "16px" }}>
//                 <h6 style={{ color: "#c62828", marginBottom: "12px" }}>
//                   Validation Errors (Fix these and re-import):
//                 </h6>
//                 <div style={{ maxHeight: "400px", overflow: "auto", border: "1px solid #ddd", borderRadius: "4px" }}>
//                   <Table bordered size="sm" responsive style={{ marginBottom: 0 }}>
//                     <thead style={{ backgroundColor: "#ffebee", position: "sticky", top: 0 }}>
//                       <tr>
//                         <th style={{ width: "80px" }}>Row</th>
//                         <th>Error Details</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {importResult.errors.map((err, idx) => (
//                         <tr key={idx}>
//                           <td style={{ fontWeight: "bold", textAlign: "center" }}>{err.row}</td>
//                           <td style={{ color: "#c62828" }}>{err.message}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </div>
//                 {importResult.errors.length > 10 && (
//                   <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
//                     Showing all {importResult.errors.length} errors
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Successfully Imported Employees */}
//             {importResult.employees && importResult.employees.length > 0 && (
//               <div style={{ marginTop: "24px" }}>
//                 <h6 style={{ color: "#2e7d32", marginBottom: "12px" }}>
//                   ✅ Successfully Imported Employees:
//                 </h6>
//                 <div style={{ maxHeight: "300px", overflow: "auto", border: "1px solid #ddd", borderRadius: "4px" }}>
//                   <Table bordered size="sm" responsive style={{ marginBottom: 0 }}>
//                     <thead style={{ backgroundColor: "#e8f5e9", position: "sticky", top: 0 }}>
//                       <tr>
//                         <th>Row</th>
//                         <th>Name</th>
//                         <th>Email</th>
//                         <th>Staff ID</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {importResult.employees.map((emp, idx) => (
//                         <tr key={idx}>
//                           <td>{emp.row}</td>
//                           <td>{emp.name}</td>
//                           <td>{emp.email}</td>
//                           <td>{emp.staffId || "-"}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Form, Alert, Table, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// Rule: allowed MIME types for import files
const ALLOWED_MIME_TYPES = [
  "application/vnd.ms-excel",                                          // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/csv",                                                          // .csv
  "application/csv",
];
// Rule: allowed file extensions
const ALLOWED_EXTENSIONS = [".xls", ".xlsx", ".csv"];
// Rule: max file size 2MB
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

// ---- Real Indian sample data with valid combinations ----
// These names, departments, designations, shifts, and roles are realistic
// and should match your database seeded data

// Indian first names (male and female)
const INDIAN_FIRST_NAMES = [
  "Aarav", "Aisha", "Akash", "Amit", "Ananya", "Anil", "Anjali", "Ankit",
  "Ankur", "Arjun", "Arpita", "Ashok", "Asha", "Ashwin", "Bharat", "Bhavna",
  "Chetan", "Chitra", "Deepa", "Deepak", "Dev", "Dinesh", "Divya", "Ganesh",
  "Gaurav", "Gautam", "Geeta", "Harish", "Hema", "Hitesh", "Hrithik", "Isha",
  "Jai", "Jaya", "Jayesh", "Jitendra", "Kajal", "Karan", "Kavita", "Kiran",
  "Krishna", "Kumar", "Kunal", "Lakshmi", "Lalit", "Leela", "Madhav", "Madhuri",
  "Mahesh", "Mamta", "Manoj", "Meena", "Meera", "Mohan", "Monica", "Mukesh",
  "Naina", "Nandini", "Naresh", "Naveen", "Neha", "Neelam", "Nikhil", "Nirmala",
  "Nisha", "Nitin", "Pankaj", "Pooja", "Pradeep", "Prakash", "Pramod", "Priya",
  "Priyanka", "Rahul", "Raj", "Raja", "Rajesh", "Rakesh", "Rama", "Ramesh",
  "Rani", "Rashmi", "Ravi", "Rekha", "Ritu", "Rohit", "Ronit", "Ruby",
  "Sachin", "Sagar", "Sahil", "Sakshi", "Samantha", "Sameer", "Sanjay", "Sanjeev",
  "Sapna", "Sarita", "Satyam", "Saurabh", "Savita", "Seema", "Shankar", "Shanti",
  "Sharad", "Shashi", "Sheela", "Shilpa", "Shiv", "Shiva", "Shreya", "Shyam",
  "Siddharth", "Sneha", "Sohan", "Soniya", "Srinivas", "Subhash", "Sudha", "Sudhir",
  "Sujata", "Suman", "Sunil", "Sunita", "Suraj", "Suresh", "Swati", "Tanvi",
  "Tarun", "Tejas", "Uday", "Umesh", "Uma", "Upendra", "Urvashi", "Vandana",
  "Varun", "Vasudev", "Ved", "Veena", "Vijay", "Vikas", "Vikram", "Vimal",
  "Vinay", "Vipul", "Vishal", "Vivek", "Yash", "Yogesh"
];

const INDIAN_LAST_NAMES = [
  "Agarwal", "Ahuja", "Arora", "Bajaj", "Banerjee", "Bansal", "Batra", "Bedi",
  "Bhardwaj", "Bhatia", "Bhatnagar", "Bhatt", "Bhushan", "Bose", "Chadha", "Chand",
  "Chandra", "Chatterjee", "Chauhan", "Chawla", "Chopra", "Dang", "Das", "Datta",
  "Dayal", "Desai", "Dhawan", "Dixit", "Dube", "Dutta", "Gandhi", "Garg",
  "Gaur", "Gautam", "Ghosh", "Gokhale", "Goyal", "Grover", "Gupta", "Jain",
  "Jaiswal", "Joshi", "Kadam", "Kale", "Kapoor", "Kar", "Kashyap", "Kaur",
  "Khanna", "Khatri", "Kohli", "Kulkarni", "Kumar", "Lal", "Luthra", "Mahajan",
  "Maheshwari", "Malhotra", "Mallik", "Mehra", "Mehta", "Mishra", "Mittal", "Modi",
  "Mohan", "Mukherjee", "Murthy", "Nair", "Nanda", "Narasimhan", "Nayak", "Nayar",
  "Oberoi", "Padmanabhan", "Pandey", "Pandit", "Parekh", "Parikh", "Patel", "Pathak",
  "Patil", "Paul", "Pillai", "Prasad", "Puri", "Raghavan", "Rai", "Rajan",
  "Rajput", "Raman", "Rao", "Rastogi", "Rathore", "Reddy", "Roy", "Sachdev",
  "Saha", "Sahai", "Saini", "Sanghvi", "Sarin", "Saxena", "Sehgal", "Sengupta",
  "Shah", "Sharma", "Shastri", "Sheikh", "Shetty", "Shukla", "Singh", "Sinha",
  "Sood", "Srinivasan", "Subramanian", "Suri", "Swarup", "Tandon", "Taneja", "Tiwari",
  "Trivedi", "Vaidya", "Varma", "Varshney", "Verma", "Vohra", "Wadia", "Yadav"
];

// Indian cities
const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai",
  "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur",
  "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna",
  "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
  "Meerut", "Rajkot", "Kalyan", "Varanasi", "Srinagar", "Aurangabad",
  "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah",
  "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
  "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli",
  "Bareilly", "Moradabad", "Mysore", "Tiruchirappalli", "Bhubaneswar", "Salem",
  "Mira-Bhayandar", "Thiruvananthapuram", "Bhiwandi", "Saharanpur", "Warangal",
  "Guntur", "Amravati", "Nanded", "Kolhapur", "Dehradun", "Ajmer"
];

// Indian street names
const INDIAN_STREETS = [
  "MG Road", "Banjara Hills", "Jubilee Hills", "Connaught Place", "Chanakyapuri",
  "Koramangala", "Indiranagar", "Church Street", "Marine Drive", "Bandra West",
  "Juhu", "Andheri East", "Powai", "Hitech City", "Gachibowli",
  "Adyar", "T Nagar", "Mylapore", "Salt Lake City", "Park Street",
  "Cuffe Parade", "Worli", "Lower Parel", "BKC", "Santacruz",
  "Vile Parle", "Dadar", "Ghatkopar", "Chembur", "Thane West",
  "Navi Mumbai Sector 15", "Nerul", "Vashi", "Panvel", "Airoli",
  "Whitefield", "Electronic City", "Marathahalli", "Sarjapur", "Yelahanka"
];

// Indian states
const INDIAN_STATES = [
  "Maharashtra", "Delhi", "Karnataka", "Telangana", "Gujarat", "Tamil Nadu",
  "West Bengal", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Kerala",
  "Punjab", "Haryana", "Bihar", "Odisha", "Jharkhand", "Assam",
  "Chhattisgarh", "Himachal Pradesh", "Jammu and Kashmir", "Uttarakhand",
  "Andhra Pradesh", "Goa", "Tripura", "Meghalaya", "Manipur", "Nagaland"
];

// Indian postal codes (pincodes)
const INDIAN_PINCODES = [
  "110001", "110002", "110003", "400001", "400002", "400003",
  "560001", "560002", "560003", "500001", "500002", "500003",
  "380001", "380002", "380003", "600001", "600002", "600003",
  "700001", "700002", "700003", "302001", "302002", "302003",
  "226001", "226002", "226003", "208001", "208002", "208003"
];

// Phone number prefixes (Indian)
const INDIAN_PHONE_PREFIXES = [
  "98765", "98764", "98763", "98762", "98761",
  "87654", "87653", "87652", "87651", "87650",
  "76543", "76542", "76541", "76540", "76549",
  "65432", "65431", "65430", "65429", "65428",
  "54321", "54320", "54329", "54328", "54327"
];

// ---- Helper to get random item from array ----
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---- Helper to generate random phone number ----
const generatePhone = () => {
  const prefix = randomItem(INDIAN_PHONE_PREFIXES);
  const suffix = String(Math.floor(10000 + Math.random() * 90000));
  return prefix + suffix;
};

// ---- Helper to generate date string (YYYY-MM-DD) ----
const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ---- Generate a single employee row ----
// deptDesigPairs: array of { department_name, designation_name } — pre-paired from DB
const generateEmployeeRow = (index, deptDesigPairs, shifts, roles, companyName) => {
  const firstName = randomItem(INDIAN_FIRST_NAMES);
  const lastName  = randomItem(INDIAN_LAST_NAMES);
  const staffId   = `EMP${String(1000 + index).padStart(4, "0")}`;
  const username  = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}`;
  const email     = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@myospaz.com`;
  const password  = "Password@123";

  // Joining date: 1–3 years ago, never future
  const joiningDate = new Date();
  joiningDate.setFullYear(joiningDate.getFullYear() - (1 + Math.floor(Math.random() * 3)));
  joiningDate.setMonth(Math.floor(Math.random() * 12));
  joiningDate.setDate(1 + Math.floor(Math.random() * 27));

  // Date of birth: 24–45 years ago
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - (24 + Math.floor(Math.random() * 22)));
  dob.setMonth(Math.floor(Math.random() * 12));
  dob.setDate(1 + Math.floor(Math.random() * 27));

  const gender        = randomItem(["Male", "Female", "Male", "Male", "Female"]);
  const contactNo     = generatePhone();
  const address       = `${1 + Math.floor(Math.random() * 500)}, ${randomItem(INDIAN_STREETS)}`;
  const city          = randomItem(INDIAN_CITIES);
  const zip           = randomItem(INDIAN_PINCODES);
  // VALID_ATTENDANCE_TYPES in backend = ["Daily", "Hourly"]
  const attendanceType = randomItem(["Daily", "Daily", "Daily", "Hourly"]);

  // Pick a dept+desig pair so they are always consistent with each other
  const pair        = randomItem(deptDesigPairs);
  const shift       = randomItem(shifts);
  // Default to first role if no Employee role found
  const employeeRole = roles.find(r => r.name.toLowerCase() === "employee") || roles[0];

  return [
    firstName,
    lastName,
    staffId,
    username,
    email,
    password,
    formatDateStr(joiningDate),
    gender,
    formatDateStr(dob),
    contactNo,
    address,
    city,
    zip,
    "India",
    attendanceType,
    companyName,
    pair.department_name,
    pair.designation_name,
    shift.shift_name,
    employeeRole?.name || "",
  ];
};

export default function ImportEmployees() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);


  // ---- Download sample file — pulls live data from your actual DB ----
  const downloadSample = async () => {
    setLoadingSample(true);

    try {
      // ── 1. Departments ──────────────────────────────────────────────────────
      // Route: GET /api/departments  (departmentRoutes, no auth needed for sample)
      // Controller: getDepartments → res.json({ departments: [...] })
      // Each item: { id, department_name, company_id, ... }
      const deptRes = await api.get("/api/departments");
      const departments = deptRes.data?.departments || [];

      if (!departments.length) {
        toast.error("No departments found. Add departments in the system before downloading a sample.");
        setLoadingSample(false);
        return;
      }

      // ── 2. Designations — fetch all in one call, pair with departments locally ──
      // Route: GET /api/designations  (no filter — returns all with department_id field)
      // Controller: getDesignations → res.json({ designations: [...] })
      // Each item: { id, designation_name, department_id, ... }
      const desigRes = await api.get("/api/designations");
      const allDesigs = desigRes.data?.designations || [];

      // Build a dept id→name lookup from the departments we already fetched
      const deptIdToName = {};
      departments.forEach((d) => { deptIdToName[d.id] = d.department_name; });

      // Build valid pairs: designation must have a department_id that exists in our dept list
      const deptDesigPairs = [];
      allDesigs.forEach((d) => {
        const deptName = deptIdToName[d.department_id];
        if (deptName && d.designation_name) {
          deptDesigPairs.push({
            department_name: deptName,
            designation_name: d.designation_name,
          });
        }
      });

      // Fallback: if no paired designations, use depts × desigs unpaired
      // (better than blocking the sample entirely)
      if (!deptDesigPairs.length && allDesigs.length && departments.length) {
        departments.forEach((dept) => {
          allDesigs.forEach((d) => {
            deptDesigPairs.push({
              department_name: dept.department_name,
              designation_name: d.designation_name,
            });
          });
        });
      }

      if (!deptDesigPairs.length) {
        toast.error("No designations found. Add designations under your departments first.");
        setLoadingSample(false);
        return;
      }

      // ── 3. Office Shifts ────────────────────────────────────────────────────
      // Route: GET /api/office-shifts  (officeShiftRoutes, no auth)
      // Controller: getAllOfficeShifts → res.json([...])  ← bare array, NOT { data: [] }
      // Each item: { id, Shift: "shift_name", Company: company_id, ... }
      const shiftRes = await api.get("/api/office-shifts");
      const rawShifts = shiftRes.data?.data || (Array.isArray(shiftRes.data) ? shiftRes.data : []);
      const shifts = rawShifts
        .map((s) => ({ id: s.id, shift_name: s.Shift || "" }))
        .filter((s) => s.shift_name);

      if (!shifts.length) {
        toast.error("No office shifts found. Add shifts before downloading a sample.");
        setLoadingSample(false);
        return;
      }

      // ── 4. Roles ────────────────────────────────────────────────────────────
      // Route: GET /api/roles/all  (rolesRoutes, checkAuth)
      // Controller: getAllRoles → res.json({ success, data: [...] })
      // Each item: { id, name, ... }
      const roleRes = await api.get("/api/roles/all");
      const roles = roleRes.data?.data || [];

      // ── 5. Company name ─────────────────────────────────────────────────────
      // Route: GET /api/companies/me  (companyRoutes mounted at /companies)
      // Controller: getMyCompany → res.json({ company: { company_name, ... } })
      let companyName = departments[0]?.company_name || "My Company";
      try {
        const compRes = await api.get("/api/companies/me");
        companyName = compRes.data?.company?.company_name || companyName;
      } catch (_) { /* non-critical — we have it from the dept join */ }

      // ── 6. Generate 10 rows ─────────────────────────────────────────────────
      const usedKeys = new Set();
      const rows = [];

      for (let i = 0; i < 10; i++) {
        let row;
        let attempts = 0;
        do {
          row = generateEmployeeRow(
            Date.now() % 1000 + i * 7 + attempts,
            deptDesigPairs,
            shifts,
            roles,
            companyName
          );
          attempts++;
        } while (usedKeys.has(row[3] + row[4]) && attempts < 30); // username+email unique
        usedKeys.add(row[3] + row[4]);
        rows.push(row);
      }

      // ── 7. Build and download CSV ────────────────────────────────────────────
      const headers = [
        "First Name", "Last Name", "Staff Id", "Username", "Email", "Password",
        "Joining Date", "Gender", "Date of Birth", "Contact Number",
        "Address", "City", "Zip", "Country", "Attendance Type",
        "Company Name", "Department Name", "Designation Name", "Shift Name", "Role Name",
      ];

      const escapeCsv = (val) => {
        const str = String(val ?? "");
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      };

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map(escapeCsv).join(",")),
      ].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url  = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `employee_import_sample_${formatDateStr(new Date())}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Sample file with 10 employees downloaded — uses your live DB values!`);

    } catch (err) {
      console.error("downloadSample error:", err);
      toast.error("Failed to fetch data from server. Check your connection and try again.");
    } finally {
      setLoadingSample(false);
    }
  };

  // ---------- File validation handler ----------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(null);
    setFileError("");
    setImportResult(null);

    if (!file) return;

    // Rule: check file extension (case-insensitive)
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError("Only .xls, .xlsx, and .csv files are allowed.");
      e.target.value = "";
      return;
    }

    // Rule: check MIME type
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      setFileError("Invalid file type. Please upload an Excel or CSV file.");
      e.target.value = "";
      return;
    }

    // Rule: enforce 2MB size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("File size must not exceed 2MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // ---------- Upload file ----------
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post("/api/employees/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setImportResult({
          success: response.data.imported || 0,
          failed: response.data.failed || 0,
          totalRows: response.data.totalRows || 0,
          errors: response.data.errors || [],
          employees: response.data.employees || [],
          allOrNothing: response.data.allOrNothing,
        });
        setSelectedFile(null);
        const fileInput = document.getElementById("formFile");
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(response.data.message || "Import failed");
      }
    } catch (error) {
      console.error("Import error:", error);
      const message = error.response?.data?.message || error.message || "Import failed";
      toast.error(message);
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

  return (
    <div>
      <Breadcrumb
        routeSegments={[
          { name: "Employees", path: "/employees" },
          { name: "Import Employees" }
        ]}
      />

      <Card
        body
        style={{
          borderRadius: "10px",
          padding: "20px",
          marginTop: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}
      >
        <h5 style={{ marginBottom: "15px" }}>Import EXCEL/CSV file only</h5>

        {/* Download Sample Button */}
        <Row className="mb-3">
          <Col md="auto">
            <Button
              onClick={downloadSample}
              disabled={loadingSample}
              style={{
                backgroundColor: "#6f42c1",
                borderColor: "#6f42c1",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "5px",
                padding: "8px 16px"
              }}
            >
              {loadingSample ? (
                <>
                  <Spinner size="sm" animation="border" />
                  Loading...
                </>
              ) : (
                <>
                  <i className="i-Download"></i>
                  Download Sample File
                </>
              )}
            </Button>
          </Col>
          <Col md="auto" className="d-flex align-items-center">
            <small style={{ color: "#6c757d" }}>
              ✓ Pulls live department, designation &amp; shift names from your database
            </small>
          </Col>
        </Row>

        {/* Instructions */}
        <p style={{ fontSize: "14px", color: "#959292ff", marginBottom: "10px" }}>
          The first line in the downloaded sample file is the header — do not change it. Do not change the order of columns.
        </p>
        <p style={{ fontSize: "14px", color: "#959292ff", marginBottom: "10px" }}>
          Column order: (First Name, Last Name, Staff Id, Username, Email, Password, Joining Date, Gender, Date of Birth, Contact Number, Address, City, Zip, Country, Attendance Type, Company Name, Department Name, Designation Name, Shift Name, Role Name).
        </p>
        <ul style={{ fontSize: "14px", color: "#0c0c0cff", paddingLeft: "20px", marginBottom: "20px"}}>
          <li>Date format must be <strong>YYYY-MM-DD</strong> (e.g. 2024-06-15). Joining date cannot be a future date.</li>
          <li><strong>Company Name, Department Name, Designation Name, Shift Name, and Role Name must exactly match your existing data</strong> (case-insensitive). The downloaded sample file already contains your live database values.</li>
          <li>Gender must be <strong>Male</strong>, <strong>Female</strong>, or <strong>Other</strong>.</li>
          <li>Attendance Type must be <strong>Daily</strong> or <strong>Hourly</strong>.</li>
          <li>Email, Username, Staff ID, and Contact Number must be unique across the system.</li>
          <li>Password must be at least 8 characters.</li>
          <li>Import is all-or-nothing — if any row fails, no data is imported. Fix all errors and re-import.</li>
          <li>Do not change column order or remove the header row.</li>
        </ul>

        {/* File Upload */}
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Upload File <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileChange}
            isInvalid={!!fileError}
            style={{
              borderRadius: "5px",
              padding: "6px 12px"
            }}
          />
          <Form.Control.Feedback type="invalid">{fileError}</Form.Control.Feedback>
          <small style={{ fontSize: "12px", color: "#777" }}>
            Please select excel/csv file (allowed file size 2MB)
          </small>
        </Form.Group>

        {/* Save Button */}
        <Row>
          <Col md="auto">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{
                backgroundColor: "#6f42c1",
                borderColor: "#6f42c1",
                color: "#fff",
                borderRadius: "5px",
                padding: "8px 16px",
                opacity: !selectedFile || uploading ? 0.65 : 1,
              }}
            >
              {uploading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    style={{ marginRight: "8px" }}
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <i className="i-Data-Save" style={{ marginRight: "8px" }}></i>
                  Save
                </>
              )}
            </Button>
          </Col>
        </Row>

        {/* Import Results */}
        {importResult && (
          <div style={{ marginTop: "24px" }}>
            {importResult.aborted ? (
              <Alert variant="danger">
                <strong>❌ Import ABORTED</strong> - No data was imported
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
                  Database error occurred. No employees were imported.
                </div>
              </Alert>
            ) : (
              <Alert variant="success">
                <strong>✅ Import SUCCESSFUL</strong>
                <div style={{ marginTop: "8px", fontSize: "14px" }}>
                  {importResult.success} employee(s) imported successfully
                  {importResult.totalRows > 0 && ` (${importResult.totalRows} total rows)`}
                </div>
              </Alert>
            )}

            {/* Error details */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h6 style={{ color: "#c62828", marginBottom: "12px" }}>
                  Validation Errors:
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
              </div>
            )}

            {/* Successfully imported employees */}
            {importResult.employees && importResult.employees.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h6 style={{ color: "#2e7d32", marginBottom: "12px" }}>
                  ✅ Successfully Imported Employees:
                </h6>
                <div style={{ maxHeight: "300px", overflow: "auto", border: "1px solid #ddd", borderRadius: "4px" }}>
                  <Table bordered size="sm" responsive style={{ marginBottom: 0 }}>
                    <thead style={{ backgroundColor: "#e8f5e9", position: "sticky", top: 0 }}>
                      <tr>
                        <th>Row</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Staff ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.employees.map((emp, idx) => (
                        <tr key={idx}>
                          <td>{emp.row}</td>
                          <td>{emp.name}</td>
                          <td>{emp.email}</td>
                          <td>{emp.staffId || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}