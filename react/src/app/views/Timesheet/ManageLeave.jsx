// import { useEffect, useState } from "react";
// import { Card, Table } from "react-bootstrap";
// import Breadcrumb from "app/components/Breadcrumb";
// import api from "app/services/api";

// export default function SearchInDataTable() {
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   const rowsPerPage = 5;
//   const [currentPage, setCurrentPage] = useState(1);

//   // ================= FETCH =================
//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   const fetchLeaves = async () => {
//     try {
//       setLoading(true);

//       const res = await api.get("/api/leave/list");
//       const data = res?.data?.data || [];

//       // 🔥 ONLY REQUIRED FIELDS FROM YOUR FIRST TABLE
//  const mapped = data.map((item) => ({
//   id: item.id,
//   policy: item.policy_name,
//   type: item.leave_type,
//   start: item.start_date,
//   end: item.end_date,
//   days: item.total_days,
//   description: item.description,
//   status: (item.status || "pending").toLowerCase(),

//   // NEW 👇
//   employeeName: item.employee_name,
//   department: item.department,
// }));

//       setLeaves(mapped);
//       setFilteredLeaves(mapped);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= SEARCH =================
//   useEffect(() => {
//     if (!search) {
//       setFilteredLeaves(leaves);
//       return;
//     }

//     const lower = search.toLowerCase();

//     const filtered = leaves.filter((item) =>
//       Object.values(item).some(
//         (val) => val && val.toString().toLowerCase().includes(lower)
//       )
//     );

//     setFilteredLeaves(filtered);
//     setCurrentPage(1);
//   }, [search, leaves]);

//   // ================= STATUS CHANGE =================
// const handleStatusChange = (id, value) => {
//   const updated = leaves.map((item) =>
//     item.id === id ? { ...item, status: value } : item
//   );

//   setLeaves(updated);

//   // keep search filter active properly
//   setFilteredLeaves((prev) =>
//     prev.map((item) =>
//       item.id === id ? { ...item, status: value } : item
//     )
//   );
// };

//   // ================= SAVE STATUS =================
//   const handleSaveStatus = async (id) => {
//     try {
//       const item = leaves.find((l) => l.id === id);

//       await api.put("/api/leave/update-status", {
//         leave_id: id,
//         status: item.status,
//       });

//       alert("Status updated successfully ✅");
//       fetchLeaves();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update status ❌");
//     }
//   };

//   // ================= PAGINATION =================
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const paginatedLeaves = filteredLeaves.slice(
//     startIndex,
//     startIndex + rowsPerPage
//   );

//   return (
//     <section>
//       <Breadcrumb
//         routeSegments={[
//           { name: "Dashboard", path: "/" },
//           { name: "Leave Management" },
//         ]}
//       />

//       <Card body>
//         <div className="d-flex justify-content-between mb-3">
//           <h5>Leave Applications</h5>

//           <input
//             type="text"
//             placeholder="Search..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             style={{
//               width: "250px",
//               padding: "6px",
//               border: "1px solid #ccc",
//             }}
//           />
//         </div>

//         <Table bordered hover>
//           <thead>
//             <tr>
//               <th>No</th>
//               <th>Employee Name</th>
// <th>Department</th>
//               <th>Policy Applied</th>
//               <th>Type</th>
//               <th>Start</th>
//               <th>End</th>
//               <th>Days</th>
//               <th>Description</th>
//               <th>Status</th>
//               <th>Action</th>
              
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="9" className="text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : paginatedLeaves.length > 0 ? (
//               paginatedLeaves.map((item, index) => (
//                 <tr key={item.id}>
//                   <td>{startIndex + index + 1}</td>
//                           <td>{item.employeeName}</td>
// <td>{item.department}</td>
//                   <td>{item.policy}</td>
//                   <td>{item.type}</td>
//                   <td>{item.start}</td>
//                   <td>{item.end}</td>
//                   <td>{item.days}</td>
//                   <td>{item.description}</td>

//                   {/* STATUS (UNCHANGED) */}
//                   <td>
//                     <select
//                       value={item.status}
//                       onChange={(e) =>
//                         handleStatusChange(item.id, e.target.value)
//                       }
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="approved">Approved</option>
//                       <option value="rejected">Rejected</option>
//                     </select>
//                   </td>
          

//                   {/* SAVE (UNCHANGED) */}
//                   <td>
//                     <button
//                       onClick={() => handleSaveStatus(item.id)}
//                       style={{
//                         padding: "4px 10px",
//                         background: "#663399",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "4px",
//                       }}
//                     >
//                       Save
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="9" className="text-center">
//                   No data found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       </Card>
//     </section>
//   );
// }


import { useEffect, useState } from "react";
import { Card, Table, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

export default function SearchInDataTable() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // ================= FETCH =================
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/leave/list");
      const data = res?.data?.data || [];

      const mapped = data.map((item) => ({
        id: item.id,
        policy: item.policy_name,
        type: item.leave_type,
        start: item.start_date,
        end: item.end_date,
        days: item.total_days,
        description: item.description,
        status: (item.status || "pending").toLowerCase(),
        employeeName: item.employee_name,
        department: item.department,
      }));

      setLeaves(mapped);
      setFilteredLeaves(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH =================
  useEffect(() => {
    const lower = search.toLowerCase();

    const filtered = leaves.filter((item) =>
      Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(lower)
      )
    );

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  }, [search, leaves]);

  // ================= PDF DOWNLOAD =================
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "No",
      "Employee",
      "Department",
      "Policy",
      "Type",
      "Start",
      "End",
      "Days",
      "Status",
    ];

    const tableRows = filteredLeaves.map((item, index) => [
      index + 1,
      item.employeeName,
      item.department,
      item.policy,
      item.type,
      item.start,
      item.end,
      item.days,
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("leave-data.pdf");
  };

  // ================= STATUS UPDATE =================
  const handleStatusChange = (id, value) => {
    const updated = leaves.map((item) =>
      item.id === id ? { ...item, status: value } : item
    );

    setLeaves(updated);
    setFilteredLeaves(updated);
  };

  const handleSaveStatus = async (id) => {
    try {
      const item = leaves.find((l) => l.id === id);

      await api.put("/api/leave/update-status", {
        leave_id: id,
        status: item.status,
      });

      alert("Status updated successfully ✅");
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to update status ❌");
    }
  };

  // ================= PAGINATION =================
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLeaves = filteredLeaves.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Leave Management" },
        ]}
      />

      <Card body>
        {/* ================= HEADER ================= */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Leave Applications</h5>

          {/* SEARCH + ICON + DOWNLOAD */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "260px",
                height: "38px",
                border: "1px solid #d1d1d1",
                borderRight: "none",
                paddingLeft: "10px",
                outline: "none",
              }}
            />

            <div
              style={{
                width: "40px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #d1d1d1",
                borderLeft: "none",
                background: "#f5f5f5",
              }}
            >
              <i className="i-Magnifi-Glass"></i>
            </div>

            {/* DOWNLOAD PDF */}
            <div
              onClick={handleDownloadPDF}
              style={{
                width: "40px",
                height: "38px",
                backgroundColor: "#6f42c1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderTopRightRadius: "6px",
                borderBottomRightRadius: "6px",
                cursor: "pointer",
              }}
            >
              <i className="i-Download text-white"></i>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <Table bordered hover>
          <thead style={{ backgroundColor: "#cfc7d9" }}>
            <tr>
              <th style={{ backgroundColor: "#cfc7d9" }}>No</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Employee</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Department</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Policy</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Type</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Start</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>End</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Days</th>
             <th style={{ backgroundColor: "#cfc7d9" }}>Status</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : paginatedLeaves.length > 0 ? (
              paginatedLeaves.map((item, index) => (
                <tr key={item.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{item.employeeName}</td>
                  <td>{item.department}</td>
                  <td>{item.policy}</td>
                  <td>{item.type}</td>
        <td>
  {new Date(item.start).toLocaleDateString("en-GB")}
</td>

<td>
  {new Date(item.end).toLocaleDateString("en-GB")}
</td>
                  <td>{item.days}</td>

                  <td>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>

                  <td>
                    <Button
                      onClick={() => handleSaveStatus(item.id)}
                      style={{
                        padding: "4px 10px",
                        background: "#663399",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      Save
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </section>
  );
}