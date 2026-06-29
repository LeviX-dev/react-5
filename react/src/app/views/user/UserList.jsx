// import { useEffect, useMemo, useState } from "react";
// import { RBTable } from "@pallassystems/react-bootstrap-table";
// import { Row, Col, Card, Button, Badge,Modal, Form,Dropdown} from "react-bootstrap";
// import Breadcrumb from "app/components/Breadcrumb";
// import { axios } from "fake-db/mock";

// export default function SearchInDataTable() {
//   const [users, setUsers] = useState([]);
// //For edit Modal
// const [showModal, setShowModal] = useState(false);
// const [editData, setEditData] = useState({});

// const [editForm, setEditForm] = useState({
//   firstName: "",
//   lastName: "",
//   username: "",
//   password: "",
//   role: ""
// });

//   const columns = useMemo(
//     () => [
//       { accessorKey: "index", header: "No" },
//       { accessorKey: "User", header: "User", searchable: true },

//    { accessorKey: "username", header: "Username", searchable: true },

//     { accessorKey: "role", header: "Role", searchable: true },

//    {
//   accessorKey: "action",
//   header: "action",
//   Cell: ({ row }) => {
//     const item = row?.original || {};
//     const userId = item.id;

//     return (
//       <div className="d-flex align-items-center gap-2">
//         {/* Edit Button */}
//         <Button
//           className="btn-icon d-flex align-items-center justify-content-center"
//           style={{ width: '32px', height: '32px', backgroundColor: '#663399', border: 'none' }}
//           // onClick={() => {

//           //   setEditData(item);
//           //   setShowModal(true);
//           //   console.log("Editing user ID: " + userId);
//           // }}
// onClick={() => {
//   setEditData(item);

//   const nameParts = item.User?.split(" ") || [];

//   setEditForm({
//     firstName: nameParts[0] || "",
//     lastName: nameParts[1] || "",
//     username: item.username || "",
//     password: "",
//     role: item.role || ""
//   });

//   setShowModal(true);
// }}

//         >
//           <i className="i-Edit text-white"></i>
//         </Button>

//         {/* Delete Button */}
//         <Button
//           className="btn-icon d-flex align-items-center justify-content-center"
//           style={{
//             width: '28px',
//             height: '28px',
//             backgroundColor: '#c4302b',
//             border: 'none',
//             borderRadius: '4px'
//           }}
//           onClick={() => alert("Deleting user ID: " + userId)}
//         >
//           <i className="i-Close-Window text-white"></i>
//         </Button>
//       </div>
//     );
//   }
// }
//     ],
//     []
//   );

//   useEffect(() => {
//     axios.get("/api/user/all").then(({ data }) => {
//       const userList = data.map((item, ind) => ({
//         id: item.id || ind + 1,
//         index: ind + 1,
//         User: item.user || item.name,
//         username: item.username || "user_" + (ind + 1),
//         role: item.role || "Admin"

//       }));

//       setUsers(userList);
//     }).catch(err => console.error("Data fetch error:", err));
//   }, []);

// const handleUpdateUser = () => {
//   setUsers((prevUsers) =>
//     prevUsers.map((user) =>
//       user.id === editData.id
//         ? {
//             ...user,
//             User: `${editForm.firstName} ${editForm.lastName}`,
//             username: editForm.username,
//             role: editForm.role
//           }
//         : user
//     )
//   );

//   setShowModal(false);
// };

//   return (
//     <section>
//       <Breadcrumb
//         routeSegments={[
//           { name: "Dashboard", path: "/" },
//           { name: "User", path: "/user/UserList" },
//           { name: "Users List" }
//         ]}
//       />

//       <div className="mb-3">
//         <Row>
//           <Col lg={12}>
//             <Card body>
//               <div className="d-flex justify-content-between align-items-center">
//                 <div className="d-flex">

//                 </div>

// {/* //right  side icon */}
//  <div className="d-flex align-items-center border-0">
//   {/* PDF Icon */}
//   <Button
//     className="btn-icon d-flex align-items-center justify-content-center me-1"
//     style={{ width: 36, height: 36, backgroundColor: "#f44336", border: "none", borderRadius: "0" }}
//   >
//     <i className="i-File-Horizontal-Text text-18 text-white"></i>
//   </Button>

//   {/* CSV Icon */}
//   <Button
//     className="btn-icon d-flex align-items-center justify-content-center me-1"
//     style={{ width: 36, height: 36, backgroundColor: "#ffc107", border: "none", borderRadius: "0" }}
//   >
//     <i className="i-File-CSV text-18 text-white"></i>
//   </Button>

//   {/* Print Icon  */}
//   <Button
//     className="btn-icon d-flex align-items-center justify-content-center me-1"
//     style={{ width: 36, height: 36, backgroundColor: "#007bff", border: "none", borderRadius: "0" }}
//   >
//     <i className="i-Billing text-18 text-white"></i>
//   </Button>

//   {/* Eye Icon  */}
//   {/* <Button
//     className="btn-icon d-flex align-items-center justify-content-center me-1"
//     style={{ width: 36, height: 36, backgroundColor: "#663399", border: "none", borderRadius: "0" }}
//   >
//     <i className="i-Eye text-18 text-white"></i>
//   </Button>
// </div>
//               </div> */}
//                 <Dropdown align="end">
//       <Dropdown.Toggle
//         className="btn-icon d-flex align-items-center justify-content-center"
//         style={{
//           width: 36,
//           height: 36,
//           backgroundColor: "#663399",
//           border: "none",
//           borderRadius: 0
//         }}
//       >
//               <i className="i-Eye text-18 text-white"></i>
//             </Dropdown.Toggle>

//             <Dropdown.Menu style={{ backgroundColor: "#7d5bbe" }}>
//               <Dropdown.Item className="text-black">User</Dropdown.Item>
//               <Dropdown.Item className="text-black">username</Dropdown.Item>
//               <Dropdown.Item className="text-black">Role</Dropdown.Item>
//               <Dropdown.Item className="text-black">action</Dropdown.Item>
//             </Dropdown.Menu>
//           </Dropdown>
//         </div>
//       </div>
//             </Card>
//           </Col>
//         </Row>
//       </div>

//       <Card body className="mt-4">
//         <Card.Title>Search In Table</Card.Title>

//         {users.length > 0 ? (
//           <div className="table-responsive">
//             <RBTable data={users} varient="primary" columns={columns} />
//           </div>
//         ) : (
//           <div className="text-center p-4">Loading user data...</div>
//         )}
//       </Card>

// {/* //Edit Popup Modal */}
// <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
//   <Modal.Header closeButton>
//     <Modal.Title>Edit User</Modal.Title>
//   </Modal.Header>

//   <Modal.Body>
//     <Form>
//       <Row>
//         <Col md={6} className="mb-3">
//           <Form.Label>First Name </Form.Label>
//           <Form.Control
//             type="text"
//             value={editForm.firstName}
//             onChange={(e) =>
//               setEditForm({ ...editForm, firstName: e.target.value })
//             }
//           />
//         </Col>

//         <Col md={6} className="mb-3">
//           <Form.Label>Last Name </Form.Label>
//           <Form.Control
//             type="text"
//             value={editForm.lastName}
//             onChange={(e) =>
//               setEditForm({ ...editForm, lastName: e.target.value })
//             }
//           />
//         </Col>

//         <Col md={6} className="mb-3">
//           <Form.Label>Username </Form.Label>
//           <Form.Control
//             type="text"
//             value={editForm.username}
//             onChange={(e) =>
//               setEditForm({ ...editForm, username: e.target.value })
//             }
//           />
//         </Col>

//         <Col md={6} className="mb-3">
//           <Form.Label>Password </Form.Label>
//           <Form.Control
//             type="password"
//             placeholder="Enter new password"
//             value={editForm.password}
//             onChange={(e) =>
//               setEditForm({ ...editForm, password: e.target.value })
//             }
//           />
//         </Col>

//         <Col md={6} className="mb-3">
//           <Form.Label>Role </Form.Label>
//           <Form.Select
//             value={editForm.role}
//             onChange={(e) =>
//               setEditForm({ ...editForm, role: e.target.value })
//             }
//           >
//             <option value="">Select Role</option>
//             <option value="Admin">Admin</option>
//             <option value="HR">HR</option>
//             <option value="Manager">Manager</option>
//           </Form.Select>
//         </Col>
//       </Row>
//     </Form>
//   </Modal.Body>

//   <Modal.Footer className="border-0 justify-content-end">
//     <Button
//       style={{ backgroundColor: "#663399", border: "none", padding: "8px 60px" }}
//       onClick={handleUpdateUser}
//     >
//       Update
//     </Button>
//   </Modal.Footer>
// </Modal>

//     </section>
//   );
// }

import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Form, Table, Badge } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { useNavigate } from "react-router-dom";
import api from "app/services/api";

export default function UserList() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  // 🔥 NEW STATES
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // ✅ FETCH USERS
  useEffect(() => {
    api.get("/api/users").then((res) => {
      const data = res.data.data || [];

      const formatted = data.map((item, i) => ({
        id: item.id,
        index: i + 1,
        name: `${item.first_name || ""} ${item.last_name || ""}`,
        username: item.username,
        role: item.role || "N/A",
        contact: item.contact_no || item.email || "N/A",
        is_active: item.is_active,
      }));

      setUsers(formatted);
    });
  }, []);

  // 🔍 SEARCH
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  // 📄 PAGINATION
  const totalRows = filteredUsers.length;
  const totalPages =
    rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  // 🔥 STATUS TOGGLE
  const handleToggleStatus = async (item) => {
    const newStatus = item.is_active === 1 ? 0 : 1;

    await api.put(`/api/users/${item.id}/status`, {
      is_active: newStatus,
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === item.id ? { ...u, is_active: newStatus } : u)),
    );
  };

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Users List", path: "/user/UserList" },
        ]}
      />

      <Card body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>User Table</Card.Title>

          {/* 🔍 SEARCH */}
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "250px", height: "36px" }}
          />
        </div>

        <Table bordered hover>
          <thead style={{ background: "#cfc7d9" }}>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((item, index) => (
              <tr key={item.id}>
                <td>{startIndex + index + 1}</td>
                <td>{item.name}</td>
                <td>{item.username}</td>

                <td>
                  <Badge bg="primary">{item.role}</Badge>
                </td>

                <td>{item.contact}</td>

                {/* STATUS */}
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Check
                      type="switch"
                      checked={item.is_active === 1}
                      onChange={() => handleToggleStatus(item)}
                    />
                    <span
                      style={{
                        color: item.is_active === 1 ? "green" : "red",
                      }}
                    >
                      {item.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>

                {/* ACTION */}
                <td>
                  <Button
                    style={{ background: "#663399", border: "none" }}
                    onClick={() => navigate(`/users/${item.id}/general`)}
                  >
                    <i className="i-Eye text-white"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* 🔥 PAGINATION */}
        <div className="d-flex justify-content-end align-items-center mt-3">
          <span className="me-2">Rows per page</span>

          <Form.Select
            value={rowsPerPage}
            onChange={(e) => {
              const val =
                e.target.value === "all"
                  ? filteredUsers.length
                  : Number(e.target.value);
              setRowsPerPage(val);
              setCurrentPage(1);
            }}
            style={{ width: "90px", marginRight: "15px" }}
          >
            <option value={5}>5</option>
            <option value={20}>20</option>
            <option value="all">All</option>
          </Form.Select>

          <span className="me-3">
            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)} of{" "}
            {totalRows}
          </span>

          {/* 🔥 BUTTONS FIX */}
          <Button
            style={{
              backgroundColor: "#7d5bbe",
              border: "none",
              marginRight: "5px",
              padding: "4px 10px",
            }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            ⏮
          </Button>

          <Button
            style={{
              backgroundColor: "#7d5bbe",
              border: "none",
              marginRight: "5px",
              padding: "4px 10px",
            }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ◀
          </Button>

          <Button
            style={{
              backgroundColor: "#7d5bbe",
              border: "none",
              marginRight: "5px",
              padding: "4px 10px",
            }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ▶
          </Button>

          <Button
            style={{
              backgroundColor: "#7d5bbe",
              border: "none",
              padding: "4px 10px",
            }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            ⏭
          </Button>
        </div>
      </Card>
    </section>
  );
}
