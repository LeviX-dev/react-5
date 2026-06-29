// import { useEffect, useRef, useState } from "react";
// import { Row, Col, Card, Button, Form, Badge, Table, Spinner, Alert } from "react-bootstrap";
// import Breadcrumb from "app/components/Breadcrumb";
// import api from "app/services/api";

// export default function LiveTrackingMap() {
//   const [leafletLoaded, setLeafletLoaded] = useState(false);
//   const [mode, setMode] = useState("historical"); // "live" | "historical"
  
//   // Data State
//   const [employees, setEmployees] = useState([]);
//   const [activeEmployees, setActiveEmployees] = useState([]);
//   const [departments, setDepartments] = useState([]);
  
//   // Filters
//   const [selectedDept, setSelectedDept] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  
//   // Route Data
//   const [routePoints, setRoutePoints] = useState([]);
//   const [stopPoints, setStopPoints] = useState([]);
//   const [routeSummary, setRouteSummary] = useState(null);
//   const [attendanceLogs, setAttendanceLogs] = useState([]); 
  
//   // UI States
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshInterval, setRefreshInterval] = useState(null);

//   const mapRef = useRef(null);
//   const leafletMapInstance = useRef(null);
//   const mapMarkersGroup = useRef(null);

//   // 1. Dynamically load Leaflet assets
//   useEffect(() => {
//     // CSS
//     const link = document.createElement("link");
//     link.rel = "stylesheet";
//     link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
//     link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
//     link.crossOrigin = "";
//     document.head.appendChild(link);

//     // JS
//     const script = document.createElement("script");
//     script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
//     script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
//     script.crossOrigin = "";
//     script.async = true;
//     script.onload = () => {
//       setLeafletLoaded(true);
//     };
//     document.body.appendChild(script);

//     // Fetch master lists
//     const fetchMaster = async () => {
//       try {
//         const [deptRes, empRes] = await Promise.all([
//           api.get("/api/departments"),
//           api.get("/api/employees/dropdown")
//         ]);
//         setDepartments(deptRes.data.departments || []);
        
//         // Filter dropdown to only include location_tracking employees
//         const allEmps = empRes.data.data || empRes.data || [];
//         const trackingEmps = allEmps.filter(e => e.attendance_method === "location_tracking");
//         setEmployees(trackingEmps);
//       } catch (err) {
//         console.error("Failed to load master filters:", err);
//       }
//     };
//     fetchMaster();

//     return () => {
//       document.head.removeChild(link);
//       document.body.removeChild(script);
//       if (refreshInterval) clearInterval(refreshInterval);
//     };
//   }, []);

//   // 2. Fetch Active live employees
//   const fetchActiveEmployees = async () => {
//     try {
//       const res = await api.get("/api/attendance/live-tracking/active");
//       setActiveEmployees(res.data.employees || []);
//     } catch (err) {
//       console.error("Failed to fetch active employees:", err);
//     }
//   };

//   // Poll active employees when in live mode
//   useEffect(() => {
//     if (mode === "live") {
//       fetchActiveEmployees();
//       const interval = setInterval(fetchActiveEmployees, 30000); // refresh every 30s
//       setRefreshInterval(interval);
//       return () => {
//         clearInterval(interval);
//         setRefreshInterval(null);
//       };
//     } else {
//       if (refreshInterval) {
//         clearInterval(refreshInterval);
//         setRefreshInterval(null);
//       }
//       setActiveEmployees([]);
//     }
//   }, [mode]);

//   // 3. Initialize/Reset Leaflet Map
//   useEffect(() => {
//     if (!leafletLoaded || !mapRef.current) return;

//     if (!leafletMapInstance.current) {
//       // Create map instance centered at India by default
//       const L = window.L;
//       leafletMapInstance.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution: '&copy; OpenStreetMap contributors'
//       }).addTo(leafletMapInstance.current);

//       mapMarkersGroup.current = L.featureGroup().addTo(leafletMapInstance.current);
//     }
//   }, [leafletLoaded]);

//   // Helper to format duration
//   const formatDuration = (seconds) => {
//     if (!seconds) return "00:00:00";
//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     return [hrs, mins, secs].map(v => String(v).padStart(2, "0")).join(":");
//   };

//   // 4. Fetch historical tracking data
//  const fetchRouteDetails = async () => {
//   if (!selectedEmployee || !selectedDate) return;

//   setLoading(true);
//   setError(null);
//   try {
//     const [routeRes, attendanceRes] = await Promise.all([
//       api.get(`/api/attendance/live-tracking/route/${selectedEmployee}`, {
//         params: { date: selectedDate }
//       }),
//       api.get(`/api/attendance/${selectedEmployee}`, {
//         params: { date: selectedDate }
//       })
//     ]);
//     setRoutePoints(routeRes.data.points || []);
//     setStopPoints(routeRes.data.stops || []);
//     setRouteSummary(routeRes.data.summary || null);
//     setAttendanceLogs(attendanceRes.data.logs || []);
//   } catch (err) {
//     console.error(err);
//     setError("Failed to fetch historical route path.");
//   } finally {
//     setLoading(false);
//   }
// };

//   // Fetch when filters change in historical mode
//   useEffect(() => {
//     if (mode === "historical") {
//       fetchRouteDetails();
//     }
//   }, [selectedEmployee, selectedDate, mode]);

//   // 5. Redraw Map overlay (Polylines and Markers)
//   useEffect(() => {
//     if (!leafletLoaded || !leafletMapInstance.current || !mapMarkersGroup.current) return;

//     const L = window.L;
//     const markersGroup = mapMarkersGroup.current;
//     markersGroup.clearLayers();

//     if (mode === "historical") {
//       if (routePoints.length === 0) {
//         // Reset center if no points
//         leafletMapInstance.current.setView([20.5937, 78.9629], 5);
//         return;
//       }

//       // Plot route path polyline
// const latlngs = routePoints
//   .map(p => [
//     parseFloat(p.latitude),
//     parseFloat(p.longitude)
//   ])
//   .filter(([lat, lng]) =>
//     !isNaN(lat) &&
//     !isNaN(lng) &&
//     lat >= -90 &&
//     lat <= 90 &&
//     lng >= -180 &&
//     lng <= 180
//   );

// if (latlngs.length < 2) {
//   console.error("Not enough valid route points", routePoints);
//   leafletMapInstance.current.setView([20.5937, 78.9629], 5);
//   return;
// }

// const polyline = L.polyline(latlngs, {
//   color: "#663399",
//   weight: 4,
//   opacity: 0.8,
//   dashArray: "5, 5"
// }).addTo(markersGroup);

//       // Create start marker
//       const startPoint = routePoints[0];
//       const startIcon = L.divIcon({
//         className: "custom-map-marker start",
//         html: `<div style="background-color: #28a745; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
//         iconSize: [14, 14],
//         iconAnchor: [7, 7]
//       });
//       L.marker([parseFloat(startPoint.latitude), parseFloat(startPoint.longitude)], { icon: startIcon })
//         .bindPopup(`<b>Start Location</b><br/>Time: ${new Date(startPoint.created_at).toLocaleTimeString()}`)
//         .addTo(markersGroup);

//       // Create end marker
//       const endPoint = routePoints[routePoints.length - 1];
//       const endIcon = L.divIcon({
//         className: "custom-map-marker end",
//         html: `<div style="background-color: #dc3545; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
//         iconSize: [14, 14],
//         iconAnchor: [7, 7]
//       });
//       L.marker([parseFloat(endPoint.latitude), parseFloat(endPoint.longitude)], { icon: endIcon })
//         .bindPopup(`<b>Last Recorded Location</b><br/>Time: ${new Date(endPoint.created_at).toLocaleTimeString()}<br/>Battery: ${endPoint.battery_level ? endPoint.battery_level + '%' : 'N/A'}`)
//         .addTo(markersGroup);

//       // Plot stops markers
//       stopPoints.forEach(stop => {
//         const stopIcon = L.divIcon({
//           className: "custom-map-marker stop",
//           html: `<div style="background-color: #ffc107; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><span style="font-size: 9px; font-weight: bold; color: #000;">S</span></div>`,
//           iconSize: [18, 18],
//           iconAnchor: [9, 9]
//         });
        
//         L.marker([parseFloat(stop.latitude), parseFloat(stop.longitude)], { icon: stopIcon })
//           .bindPopup(`
//             <div style="font-family: 'Inter', sans-serif;">
//               <b style="color: #663399;">Stop Detected</b><br/>
//               <b>Arrived:</b> ${new Date(stop.start_time).toLocaleTimeString()}<br/>
//               <b>Departed:</b> ${new Date(stop.end_time).toLocaleTimeString()}<br/>
//               <b>Duration:</b> ${formatDuration(stop.duration_seconds)}
//             </div>
//           `)
//           .addTo(markersGroup);
//       });
//       // Check-in / Check-out markers
// attendanceLogs.forEach((log, idx) => {
//   const sessionNum = idx + 1;

//   if (log.latitude && log.longitude) {
//     const ciLat = parseFloat(log.latitude);
//     const ciLng = parseFloat(log.longitude);

//     if (!isNaN(ciLat) && !isNaN(ciLng)) {
//       const checkInIcon = L.divIcon({
//         className: "",
//         html: `
//           <div style="
//             background:#28a745;
//             color:#fff;
//             font-size:10px;
//             font-weight:700;
//             width:26px;
//             height:26px;
//             border-radius:50%;
//             border:2.5px solid #fff;
//             box-shadow:0 2px 6px rgba(0,0,0,.35);
//             display:flex;
//             align-items:center;
//             justify-content:center;
//           ">
//             IN
//           </div>
//         `,
//         iconSize: [26, 26],
//         iconAnchor: [13, 13]
//       });

//       L.marker([ciLat, ciLng], { icon: checkInIcon })
//         .bindPopup(`
//           <div style="font-family:'Inter',sans-serif;min-width:150px;">
//             <b style="color:#28a745;">Check-in — Session ${sessionNum}</b><br/>
//             <b>Time:</b> ${log.clock_in || "—"}
//           </div>
//         `)
//         .addTo(markersGroup);
//     }
//   }

//   if (log.checkout_latitude && log.checkout_longitude) {
//     const coLat = parseFloat(log.checkout_latitude);
//     const coLng = parseFloat(log.checkout_longitude);

//     if (!isNaN(coLat) && !isNaN(coLng)) {
//       const checkOutIcon = L.divIcon({
//         className: "",
//         html: `
//           <div style="
//             background:#dc3545;
//             color:#fff;
//             font-size:10px;
//             font-weight:700;
//             width:26px;
//             height:26px;
//             border-radius:50%;
//             border:2.5px solid #fff;
//             box-shadow:0 2px 6px rgba(0,0,0,.35);
//             display:flex;
//             align-items:center;
//             justify-content:center;
//           ">
//             OUT
//           </div>
//         `,
//         iconSize: [26, 26],
//         iconAnchor: [13, 13]
//       });

//       L.marker([coLat, coLng], { icon: checkOutIcon })
//         .bindPopup(`
//           <div style="font-family:'Inter',sans-serif;min-width:150px;">
//             <b style="color:#dc3545;">Check-out — Session ${sessionNum}</b><br/>
//             <b>Time:</b> ${log.clock_out || "—"}
//           </div>
//         `)
//         .addTo(markersGroup);
//     }
//   }
// });

//       // Fit map boundary
//       leafletMapInstance.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });

//     } else if (mode === "live") {
//       if (activeEmployees.length === 0) return;

//       activeEmployees.forEach(emp => {
//         if (!emp.current_lat || !emp.current_lon) return;

//         const liveIcon = L.divIcon({
//           className: "custom-map-marker live",
//           html: `
//             <div style="position: relative; width: 20px; height: 20px;">
//               <div style="position: absolute; top: 0; left: 0; width: 20px; height: 20px; background-color: #3b82f6; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
//               <div style="position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; background-color: #1d4ed8; border: 2.5px solid #fff; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>
//             </div>
//             <style>
//               @keyframes ping {
//                 75%, 100% { transform: scale(2); opacity: 0; }
//               }
//             </style>
//           `,
//           iconSize: [20, 20],
//           iconAnchor: [10, 10]
//         });

//         const empName = `${emp.first_name} ${emp.last_name}`;
//         L.marker([parseFloat(emp.current_lat), parseFloat(emp.current_lon)], { icon: liveIcon })
//           .bindPopup(`
//             <div style="font-family: 'Inter', sans-serif;">
//               <b style="color: #1d4ed8;">${empName}</b> (Staff ID: ${emp.staff_id})<br/>
//               <b>Clock-in:</b> ${new Date(emp.check_in_time).toLocaleTimeString()}<br/>
//               <b>Last ping:</b> ${new Date(emp.last_update).toLocaleTimeString()}<br/>
//               <b>Status:</b> ${emp.is_inside_geofence ? '<span class="text-success">In Geofence</span>' : '<span class="text-danger">Out of boundary</span>'}
//             </div>
//           `)
//           .addTo(markersGroup);
//       });

//       // Zoom to fit all active markers
//       const bounds = markersGroup.getBounds();
//       if (bounds.isValid()) {
//         leafletMapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
//       }
//     }
//   }, [routePoints, stopPoints, activeEmployees,attendanceLogs, mode, leafletLoaded]);

//   // Filter employees dropdown list based on department selection
//   const filteredEmployees = employees.filter(e => {
//     if (!selectedDept) return true;
//     return String(e.department_id) === String(selectedDept);
//   });

//   return (
//     <section style={{ fontFamily: "'Inter', sans-serif" }}>
//       <Breadcrumb
//         routeSegments={[
//           { name: "Timesheet", path: "/Timesheet/Daily Attendance" },
//           { name: "Live Location Tracking" }
//         ]}
//       />

//       <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
//         <h4 style={{ fontWeight: 700, color: "#333" }}>Live Location Tracking Panel</h4>
//         <div className="d-flex gap-2">
//           <Button
//             variant={mode === "historical" ? "primary" : "outline-primary"}
//             onClick={() => setMode("historical")}
//             style={{ fontWeight: 600 }}
//           >
//             Historical Route Path
//           </Button>
//           <Button
//             variant={mode === "live" ? "danger" : "outline-danger"}
//             onClick={() => setMode("live")}
//             style={{ fontWeight: 600 }}
//           >
//             Live Active Field Map
//           </Button>
//         </div>
//       </div>

//       {/* Filter and configuration dashboard */}
//       <Card className="p-3 shadow-sm mt-3 border-0" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
//         {mode === "historical" ? (
//           <Row className="align-items-end g-3">
//             <Col md={3}>
//               <Form.Label className="mb-1 small fw-bold">Department</Form.Label>
//               <Form.Select
//                 value={selectedDept}
//                 onChange={(e) => {
//                   setSelectedDept(e.target.value);
//                   setSelectedEmployee("");
//                 }}
//                 className="border-0 shadow-sm"
//                 style={{ borderRadius: "8px" }}
//               >
//                 <option value="">All Departments</option>
//                 {departments.map((d) => (
//                   <option key={d.id} value={d.id}>{d.department_name}</option>
//                 ))}
//               </Form.Select>
//             </Col>
//             <Col md={4}>
//               <Form.Label className="mb-1 small fw-bold">Select Employee (Live Tracked)</Form.Label>
//               <Form.Select
//                 value={selectedEmployee}
//                 onChange={(e) => setSelectedEmployee(e.target.value)}
//                 className="border-0 shadow-sm"
//                 style={{ borderRadius: "8px" }}
//               >
//                 <option value="">-- Choose Employee --</option>
//                 {filteredEmployees.map((e) => (
//                   <option key={e.id} value={e.id}>
//                     {e.employee}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col>
//             <Col md={3}>
//               <Form.Label className="mb-1 small fw-bold">Tracking Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 max={new Date().toISOString().split("T")[0]}
//                 className="border-0 shadow-sm"
//                 style={{ borderRadius: "8px" }}
//               />
//             </Col>
//             <Col md={2}>
//               <Button
//                 variant="outline-secondary"
//                 onClick={fetchRouteDetails}
//                 className="w-100 shadow-sm border-0"
//                 style={{ borderRadius: "8px", fontWeight: 600 }}
//                 disabled={loading}
//               >
//                 {loading ? <Spinner size="sm" animation="border" /> : "Refresh Route"}
//               </Button>
//             </Col>
//           </Row>
//         ) : (
//           <div className="d-flex justify-content-between align-items-center">
//             <span style={{ fontWeight: 600, color: "#555" }}>
//               🟢 Showing all employees with <code>location_tracking</code> method who are currently clocked in.
//             </span>
//             <Button
//               variant="outline-secondary"
//               size="sm"
//               onClick={fetchActiveEmployees}
//               className="shadow-sm border-0"
//               style={{ borderRadius: "8px", fontWeight: 600 }}
//             >
//               Sync Live Feeds
//             </Button>
//           </div>
//         )}
//       </Card>

//       {error && <Alert variant="warning" className="mt-3">{error}</Alert>}

//       {/* Metrics & stats row (Only for Historical Mode with summary data) */}
//       {mode === "historical" && routeSummary && (
//         <Row className="mt-4 g-3">
//           <Col md={3} sm={6}>
//             <Card className="p-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", borderRadius: "12px" }}>
//               <div className="small text-white-50 uppercase fw-bold">Total Shift Distance</div>
//               <h3 className="mt-2 mb-0 fw-bold">{routeSummary.total_distance_km} km</h3>
//             </Card>
//           </Col>
//           <Col md={3} sm={6}>
//             <Card className="p-3 border-0 shadow-sm" style={{ background: "#fff", borderRadius: "12px", borderLeft: "4px solid #ffc107" }}>
//               <div className="small text-muted fw-bold">Number of Stops</div>
//               <h3 className="mt-2 mb-0 fw-bold text-dark">{routeSummary.total_stops} stops</h3>
//             </Card>
//           </Col>
//           <Col md={3} sm={6}>
//             <Card className="p-3 border-0 shadow-sm" style={{ background: "#fff", borderRadius: "12px", borderLeft: "4px solid #28a745" }}>
//               <div className="small text-muted fw-bold">Active Moving Time</div>
//               <h3 className="mt-2 mb-0 fw-bold text-success">{formatDuration(routeSummary.moving_seconds)}</h3>
//             </Card>
//           </Col>
//           <Col md={3} sm={6}>
//             <Card className="p-3 border-0 shadow-sm" style={{ background: "#fff", borderRadius: "12px", borderLeft: "4px solid #dc3545" }}>
//               <div className="small text-muted fw-bold">Total Stationary Time</div>
//               <h3 className="mt-2 mb-0 fw-bold text-danger">{formatDuration(routeSummary.stopped_seconds)}</h3>
//             </Card>
//           </Col>
//         </Row>
//       )}

//       {/* Map display */}
//       <Row className="mt-4">
//         <Col lg={mode === "historical" && stopPoints.length > 0 ? 8 : 12}>
//           <Card className="p-1 border-0 shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
//             {!leafletLoaded && (
//               <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "500px", background: "#f8f9fa" }}>
//                 <Spinner animation="grow" color="primary" />
//                 <span className="mt-2 text-muted small">Loading map canvas...</span>
//               </div>
//             )}
//             <div
//               ref={mapRef}
//               style={{
//                 height: "500px",
//                 width: "100%",
//                 borderRadius: "10px",
//                 display: leafletLoaded ? "block" : "none"
//               }}
//             />
//           </Card>
//         </Col>

//         {/* Stops summary sidebar */}
//         {mode === "historical" && stopPoints.length > 0 && (
//           <Col lg={4}>
//             <Card className="p-3 border-0 shadow-sm" style={{ borderRadius: "12px", height: "508px", overflow: "hidden" }}>
//               <h5 className="fw-bold mb-3 text-dark">Detected Stop Durations</h5>
//               <div style={{ overflowY: "auto", height: "calc(100% - 40px)" }} className="pe-1">
//                 <Table hover responsive className="align-middle border-0 small">
//                   <thead>
//                     <tr>
//                       <th>Time</th>
//                       <th>Duration</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {stopPoints.map((stop, idx) => (
//                       <tr key={stop.id || idx}>
//                         <td>
//                           <div className="fw-bold">Stop #{idx + 1}</div>
//                           <div className="text-muted text-xxs">
//                             {new Date(stop.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(stop.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                           </div>
//                         </td>
//                         <td>
//                           <Badge bg="warning" text="dark" style={{ fontSize: "10.5px" }}>
//                             {formatDuration(stop.duration_seconds)}
//                           </Badge>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>
//             </Card>
//           </Col>
//         )}
//       </Row>
//     </section>
//   );
// }


import { useEffect, useRef, useState, useCallback } from "react";
import { Row, Col, Form, Badge, Spinner } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─── Palette tokens (aligned to Avcore brand / design system) ────────────────
const C = {
  purple: "#663399",
  purpleLight: "#f3ecfa",
  purpleMid: "#c49de0",
  green: "#16a34a",
  greenLight: "#dcfce7",
  red: "#dc2626",
  redLight: "#fee2e2",
  amber: "#d97706",
  amberLight: "#fef3c7",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  gray50: "#f8fafc",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
  gray400: "#94a3b8",
  gray600: "#475569",
  gray800: "#1e293b",
  white: "#ffffff",
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase() || "?";

// Resolve display name from either shape: { employee } or { first_name, last_name }
const resolveName = (emp) =>
  emp.employee || `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Unknown";

// ─── Reverse geocoding (OpenStreetMap Nominatim) ──────────────────────────────
// Turns raw lat/lon into a human-readable place name for popups, e.g.
// "MG Road, Pune" instead of "18.52040, 73.85670". Results are cached by
// rounded coordinates, and requests are chained ~1.1s apart so a route with
// many stops/check-ins never exceeds Nominatim's 1 request/sec usage policy.
const geocodeCache = new Map();
let geocodeChain = Promise.resolve();

function reverseGeocode(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number" || isNaN(lat) || isNaN(lon)) {
    return Promise.resolve(null);
  }
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geocodeCache.has(key)) return Promise.resolve(geocodeCache.get(key));

  const task = geocodeChain.then(
    () =>
      new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
              { headers: { Accept: "application/json" } }
            );
            const data = await res.json();
            const a = data.address || {};
            const place =
              a.road || a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.county || null;
            const city = a.city || a.town || a.village || null;
            const label = place
              ? city && city !== place
                ? `${place}, ${city}`
                : place
              : data.display_name
              ? data.display_name.split(",").slice(0, 2).join(",").trim()
              : null;
            geocodeCache.set(key, label);
            resolve(label);
          } catch {
            geocodeCache.set(key, null);
            resolve(null);
          }
        }, 1100);
      })
  );
  geocodeChain = task;
  return task;
}

// Binds a popup that shows "Locating…" then swaps in the resolved address
// once it's ready. `render(locationLineHtml)` returns the full popup HTML.
function bindLocatedPopup(marker, mg, lat, lon, render) {
  marker.bindPopup(render(`<span style="color:${C.gray400}">Locating…</span>`));
  reverseGeocode(lat, lon).then((place) => {
    if (!mg.hasLayer(marker)) return; // marker was cleared/replaced before the lookup resolved
    const line = `📍 ${place || `${lat.toFixed(5)}, ${lon.toFixed(5)}`}`;
    marker.setPopupContent(render(line));
    if (marker.isPopupOpen()) marker.getPopup().update();
  });
  return marker;
}

// ─── StatusDot ───────────────────────────────────────────────────────────────
function StatusDot({ active }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: active ? C.green : C.gray400,
        marginRight: 6,
        boxShadow: active ? `0 0 0 3px ${C.greenLight}` : "none",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Stat card (inside modal) ─────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.gray200}`,
        borderRadius: 10,
        padding: "10px 14px",
        minWidth: 0,
        flex: 1,
      }}
    >
      <div
        style={{ fontSize: 11, color: C.gray400, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}
      >
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || C.gray800 }}>
        {value}
      </div>
    </div>
  );
}

// ─── Map Modal ────────────────────────────────────────────────────────────────
function MapModal({ employee, mode, selectedDate, onClose }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(!!window.L);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [stopPoints, setStopPoints] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [summary, setSummary] = useState(null);

  // Load Leaflet if not already present
  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.crossOrigin = "";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.crossOrigin = "";
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Fetch data
  useEffect(() => {
    if (!employee) return;
    if (mode === "historical") {
      setLoading(true);
      setError(null);
      Promise.all([
        api.get(`/api/attendance/live-tracking/route/${employee.id}`, { params: { date: selectedDate } }),
        api.get(`/api/attendance/${employee.id}`, { params: { date: selectedDate } }),
      ])
        .then(([routeRes, attRes]) => {
          setRoutePoints(routeRes.data.points || []);
          setStopPoints(routeRes.data.stops || []);
          setSummary(routeRes.data.summary || null);
          setAttendanceLogs(attRes.data.logs || []);
        })
        .catch(() => setError("Failed to load route data."))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [employee, mode, selectedDate]);

  // Init map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    if (!mapInstance.current) {
      const L = window.L;
      mapInstance.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance.current);
      markersGroup.current = L.featureGroup().addTo(mapInstance.current);
    }
    setTimeout(() => mapInstance.current?.invalidateSize(), 200);
  }, [leafletLoaded]);

  // Draw overlay
  useEffect(() => {
    if (!leafletLoaded || !mapInstance.current || !markersGroup.current) return;
    const L = window.L;
    const mg = markersGroup.current;
    mg.clearLayers();

    if (mode === "live" && employee) {
      if (!employee.current_lat || !employee.current_lon) return;
      const lat = parseFloat(employee.current_lat);
      const lon = parseFloat(employee.current_lon);
      const liveIcon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:20px;height:20px;">
          <div style="position:absolute;top:0;left:0;width:20px;height:20px;background:${C.blue};border-radius:50%;opacity:.35;animation:ping 1.5s infinite;"></div>
          <div style="position:absolute;top:3px;left:3px;width:14px;height:14px;background:${C.blue};border:2px solid #fff;border-radius:50%;"></div>
          <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
        </div>`,
        iconSize: [20, 20], iconAnchor: [10, 10],
      });
      const name = resolveName(employee);
      const liveMarker = L.marker([lat, lon], { icon: liveIcon }).addTo(mg);
      bindLocatedPopup(liveMarker, mg, lat, lon, (locationLine) =>
        `<b>${name}</b><br/>Last ping: ${new Date(employee.last_update).toLocaleTimeString()}<br/>${locationLine}`
      );
      mapInstance.current.setView([lat, lon], 14);
      return;
    }

    if (mode === "historical" && routePoints.length > 0) {
      const latlngs = routePoints
        .map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180);

      if (latlngs.length < 2) return;

      const polyline = L.polyline(latlngs, { color: C.purple, weight: 4, opacity: 0.85, dashArray: "6, 5" }).addTo(mg);

      const mkIcon = (bg, label) => L.divIcon({
        className: "",
        html: `<div style="background:${bg};color:#fff;font-size:9px;font-weight:700;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;">${label}</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12],
      });

      const s = routePoints[0];
      const e = routePoints[routePoints.length - 1];

      const sLat = parseFloat(s.latitude), sLon = parseFloat(s.longitude);
      const startMarker = L.marker([sLat, sLon], { icon: mkIcon(C.green, "S") }).addTo(mg);
      bindLocatedPopup(startMarker, mg, sLat, sLon, (locationLine) =>
        `<b>Start</b><br/>${new Date(s.created_at).toLocaleTimeString()}<br/>${locationLine}`
      );

      const eLat = parseFloat(e.latitude), eLon = parseFloat(e.longitude);
      const endMarker = L.marker([eLat, eLon], { icon: mkIcon(C.red, "E") }).addTo(mg);
      bindLocatedPopup(endMarker, mg, eLat, eLon, (locationLine) =>
        `<b>Last location</b><br/>${new Date(e.created_at).toLocaleTimeString()}<br/>${locationLine}`
      );

      stopPoints.forEach((stop) => {
        const stLat = parseFloat(stop.latitude), stLon = parseFloat(stop.longitude);
        const stopMarker = L.marker([stLat, stLon], { icon: mkIcon(C.amber, "S") }).addTo(mg);
        bindLocatedPopup(stopMarker, mg, stLat, stLon, (locationLine) =>
          `<b>Stop</b><br/>${new Date(stop.start_time).toLocaleTimeString()} – ${new Date(stop.end_time).toLocaleTimeString()}<br/>Duration: ${formatDuration(stop.duration_seconds)}<br/>${locationLine}`
        );
      });

      attendanceLogs.forEach((log, idx) => {
        const n = idx + 1;
        if (log.latitude && log.longitude) {
          const lat = parseFloat(log.latitude), lng = parseFloat(log.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            const inMarker = L.marker([lat, lng], { icon: mkIcon(C.green, "IN") }).addTo(mg);
            bindLocatedPopup(inMarker, mg, lat, lng, (locationLine) =>
              `<b>Check-in — Session ${n}</b><br/>${log.clock_in || "—"}<br/>${locationLine}`
            );
          }
        }
        if (log.checkout_latitude && log.checkout_longitude) {
          const lat = parseFloat(log.checkout_latitude), lng = parseFloat(log.checkout_longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            const outMarker = L.marker([lat, lng], { icon: mkIcon(C.red, "OUT") }).addTo(mg);
            bindLocatedPopup(outMarker, mg, lat, lng, (locationLine) =>
              `<b>Check-out — Session ${n}</b><br/>${log.clock_out || "—"}<br/>${locationLine}`
            );
          }
        }
      });

      mapInstance.current.fitBounds(polyline.getBounds(), { padding: [36, 36] });
    }
  }, [leafletLoaded, routePoints, stopPoints, attendanceLogs, mode, employee]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersGroup.current = null;
      }
    };
  }, []);

  const empName = employee ? resolveName(employee) : "";

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 960,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,.22)",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${C.gray200}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: C.purpleLight,
              color: C.purple,
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {initials(empName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.gray800, lineHeight: 1.2 }}>{empName}</div>
            <div style={{ fontSize: 12, color: C.gray400, marginTop: 1 }}>
              {mode === "live" ? "Live location" : `Route — ${selectedDate}`}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
              color: C.gray600,
              fontSize: 20,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Stats strip */}
        {mode === "historical" && summary && !loading && (
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 20px",
              background: C.gray50,
              borderBottom: `1px solid ${C.gray200}`,
              flexWrap: "wrap",
              flexShrink: 0,
            }}
          >
            <StatCard label="Distance" value={`${summary.total_distance_km} km`} color={C.purple} />
            <StatCard label="Stops" value={`${summary.total_stops}`} color={C.amber} />
            <StatCard label="Moving time" value={formatDuration(summary.moving_seconds)} color={C.green} />
            <StatCard label="Stationary" value={formatDuration(summary.stopped_seconds)} color={C.red} />
          </div>
        )}

        {/* Map area */}
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: C.gray50,
                zIndex: 10,
                gap: 10,
              }}
            >
              <Spinner animation="border" style={{ color: C.purple, width: 28, height: 28, borderWidth: 3 }} />
              <span style={{ fontSize: 13, color: C.gray400 }}>Loading route data…</span>
            </div>
          )}
          {error && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.gray50,
              }}
            >
              <div
                style={{
                  background: C.redLight,
                  color: C.red,
                  borderRadius: 10,
                  padding: "12px 20px",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            </div>
          )}
          {!leafletLoaded && !loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: C.gray50 }}>
              <Spinner animation="grow" style={{ color: C.purple }} />
            </div>
          )}
          <div
            ref={mapRef}
            style={{
              height: "100%",
              width: "100%",
              minHeight: 380,
              display: leafletLoaded ? "block" : "none",
            }}
          />
        </div>

        {/* Legend */}
        <div
          style={{
            padding: "10px 20px",
            borderTop: `1px solid ${C.gray200}`,
            display: "flex",
            gap: 20,
            fontSize: 11,
            color: C.gray600,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {mode === "historical" ? (
            <>
              <span><span style={{ color: C.green, fontWeight: 700 }}>● S</span> Start</span>
              <span><span style={{ color: C.red, fontWeight: 700 }}>● E</span> End</span>
              <span><span style={{ color: C.amber, fontWeight: 700 }}>● S</span> Stop</span>
              <span><span style={{ color: C.green, fontWeight: 700 }}>● IN</span> Check-in</span>
              <span><span style={{ color: C.red, fontWeight: 700 }}>● OUT</span> Check-out</span>
              <span><span style={{ color: C.purple, fontWeight: 700 }}>─ ─</span> Route path</span>
            </>
          ) : (
            <span><span style={{ color: C.blue, fontWeight: 700 }}>● </span> Live location (pulses every 30s)</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Employee row ─────────────────────────────────────────────────────────────
function EmployeeRow({ employee, mode, onView }) {
  const name = `${employee.first_name || employee.name || ""} ${employee.last_name || ""}`.trim();
  const isActive = mode === "live" ? !!employee.current_lat : true;

  return (
    <tr style={{ verticalAlign: "middle" }}>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: C.purpleLight,
              color: C.purple,
              fontWeight: 700,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {initials(name)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.gray800 }}>{name}</div>
            <div style={{ fontSize: 12, color: C.gray400 }}>{employee.staff_id || employee.employee_code || "—"}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray600 }}>
        {employee.department_name || employee.department || "—"}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: isActive ? C.greenLight : C.gray100,
            color: isActive ? C.green : C.gray400,
          }}
        >
          <StatusDot active={isActive} />
          {mode === "live" ? (isActive ? "Active" : "Not located") : "Location tracked"}
        </span>
      </td>
      {mode === "live" && (
        <td style={{ padding: "12px 16px", fontSize: 12, color: C.gray600 }}>
          {employee.check_in_time ? new Date(employee.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
        </td>
      )}
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <button
          onClick={() => onView(employee)}
          title="View route on map"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            border: `1px solid ${C.purple}`,
            background: C.purpleLight,
            color: C.purple,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.purpleMid)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.purpleLight)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          View route
        </button>
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LiveTrackingMap() {
  const [mode, setMode] = useState("historical");
  const [employees, setEmployees] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Load master lists
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/api/departments"),
      api.get("/api/employees/dropdown"),
    ])
      .then(([deptRes, empRes]) => {
        setDepartments(deptRes.data.departments || []);
        const all = empRes.data.data || empRes.data || [];
        setEmployees(all.filter((e) => e.attendance_method === "location_tracking"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Live mode: fetch active employees
  const fetchActive = useCallback(async () => {
    try {
      const res = await api.get("/api/attendance/live-tracking/active");
      setActiveEmployees(res.data.employees || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (mode !== "live") { setActiveEmployees([]); return; }
    fetchActive();
    const t = setInterval(fetchActive, 30000);
    return () => clearInterval(t);
  }, [mode, fetchActive]);

  // Derived list
  const displayList = (mode === "live" ? activeEmployees : employees).filter((e) => {
    const name = resolveName(e).toLowerCase();
    const matchDept = !selectedDept || String(e.department_id) === String(selectedDept);
    const matchSearch = !search || name.includes(search.toLowerCase()) || (e.staff_id || "").toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <section style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      {viewingEmployee && (
        <MapModal
          employee={viewingEmployee}
          mode={mode}
          selectedDate={selectedDate}
          onClose={() => setViewingEmployee(null)}
        />
      )}

      <Breadcrumb
        routeSegments={[
          { name: "Timesheet", path: "/Timesheet/Daily Attendance" },
          { name: "Live location tracking" },
        ]}
      />

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <div>
          <h4 style={{ fontWeight: 700, color: C.gray800, margin: 0, fontSize: 20 }}>
            Location tracking
          </h4>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: C.gray400 }}>
            {mode === "live"
              ? `${activeEmployees.length} employee${activeEmployees.length !== 1 ? "s" : ""} currently active in the field`
              : "View historical route paths for tracked employees"}
          </p>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "inline-flex",
            background: C.gray100,
            borderRadius: 10,
            padding: 3,
            gap: 3,
          }}
        >
          {[
            { id: "historical", label: "Historical", icon: "🕐" },
            { id: "live", label: "Live map", icon: "🟢" },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                border: "none",
                background: mode === id ? C.white : "transparent",
                color: mode === id ? C.gray800 : C.gray400,
                fontWeight: mode === id ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: mode === id ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.gray200}`,
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
          marginBottom: 16,
        }}
      >
        {/* Search */}
        <div style={{ flex: "1 1 200px", minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Search
          </label>
          <div style={{ position: "relative" }}>
            <svg
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.gray400, pointerEvents: "none" }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or staff ID"
              style={{
                width: "100%",
                padding: "7px 10px 7px 30px",
                border: `1px solid ${C.gray200}`,
                borderRadius: 8,
                fontSize: 13,
                color: C.gray800,
                outline: "none",
                fontFamily: "inherit",
                background: C.gray50,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Department */}
        <div style={{ flex: "1 1 180px", minWidth: 140 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Department
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              border: `1px solid ${C.gray200}`,
              borderRadius: 8,
              fontSize: 13,
              color: C.gray800,
              background: C.gray50,
              fontFamily: "inherit",
              cursor: "pointer",
              outline: "none",
              boxSizing: "border-box",
            }}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.department_name}</option>
            ))}
          </select>
        </div>

        {/* Date — historical only */}
        {mode === "historical" && (
          <div style={{ flex: "0 0 auto" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              style={{
                padding: "7px 10px",
                border: `1px solid ${C.gray200}`,
                borderRadius: 8,
                fontSize: 13,
                color: C.gray800,
                background: C.gray50,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Refresh — live only */}
        {mode === "live" && (
          <button
            onClick={fetchActive}
            style={{
              padding: "7px 16px",
              border: `1px solid ${C.gray200}`,
              borderRadius: 8,
              background: C.white,
              fontSize: 13,
              fontWeight: 600,
              color: C.gray600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              alignSelf: "flex-end",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Sync
          </button>
        )}
      </div>

      {/* Employee table */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.gray200}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, gap: 10 }}>
            <Spinner animation="border" style={{ color: C.purple, width: 24, height: 24, borderWidth: 3 }} />
            <span style={{ fontSize: 13, color: C.gray400 }}>Loading employees…</span>
          </div>
        ) : displayList.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📍</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.gray800, marginBottom: 4 }}>
              {mode === "live" ? "No employees currently active" : "No employees found"}
            </div>
            <div style={{ fontSize: 13, color: C.gray400 }}>
              {mode === "live"
                ? "Field employees will appear here once they clock in."
                : "Adjust your search or department filter."}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
                  {[
                    "Employee",
                    ...(mode === "live" ? ["Department"] : []),
                    "Status",
                    ...(mode === "live" ? ["Clocked in"] : []),
                    "",
                  ].map((h, i, arr) => (
                    <th
                      key={i}
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.gray400,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: i === arr.length - 1 ? "right" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayList.map((emp, idx) => {
                  const empDisplayName = resolveName(emp);
                  return (
                  <tr
                    key={emp.id || idx}
                    style={{
                      borderBottom: `1px solid ${C.gray100}`,
                      transition: "background .1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.gray50)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Avatar + name */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: C.purpleLight, color: C.purple,
                            fontWeight: 700, fontSize: 12,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {initials(empDisplayName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: C.gray800 }}>
                            {empDisplayName}
                          </div>
                          <div style={{ fontSize: 12, color: C.gray400 }}>
                            {emp.staff_id || emp.employee_code || `ID: ${emp.id}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department — live mode only (active endpoint includes it) */}
                    {mode === "live" && (
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray600 }}>
                        {emp.department_name || emp.department || "—"}
                      </td>
                    )}

                    {/* Status */}
                    <td style={{ padding: "12px 16px" }}>
                      {(() => {
                        const active = mode === "live" ? !!emp.current_lat : true;
                        return (
                          <span
                            style={{
                              display: "inline-flex", alignItems: "center",
                              padding: "3px 10px", borderRadius: 20,
                              fontSize: 12, fontWeight: 600,
                              background: active ? C.greenLight : C.gray100,
                              color: active ? C.green : C.gray400,
                            }}
                          >
                            <StatusDot active={active} />
                            {mode === "live" ? (active ? "Active" : "Not located") : "Tracked"}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Clock-in (live only) */}
                    {mode === "live" && (
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray600 }}>
                        {emp.check_in_time
                          ? new Date(emp.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>
                    )}

                    {/* View route button */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => setViewingEmployee(emp)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 8,
                          border: `1px solid ${C.purple}`,
                          background: C.purpleLight, color: C.purple,
                          fontSize: 13, fontWeight: 600, cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "background .15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.purpleMid)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = C.purpleLight)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        View route
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {displayList.length > 0 && (
          <div
            style={{
              padding: "10px 16px",
              borderTop: `1px solid ${C.gray100}`,
              fontSize: 12,
              color: C.gray400,
              background: C.gray50,
            }}
          >
            {displayList.length} employee{displayList.length !== 1 ? "s" : ""}
            {mode === "live" && " currently in field"}
          </div>
        )}
      </div>
    </section>
  );
}