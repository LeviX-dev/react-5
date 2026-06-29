import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Dropdown,
  Table,
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "app/services/api";

export default function SearchInDataTable() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [remark, setRemark] = useState("");
  // Per-field validation errors
  const [desigError, setDesigError] = useState("");
  const [deptError, setDeptError] = useState("");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const tableColumn = ["No", "Designation", "Remark"];

    const tableRows = users.map((item, index) => [
      index + 1,
      item.designation,
      item.remark,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("Designation.pdf");
  };

  // FETCH DATA
  const fetchData = () => {
    api.get("/api/designations").then((res) => {
      console.log("Session User:", res.data.sessionUser);
     const designationData = res.data.designations
  .map((item) => ({
    id: item.id,
    designation: item.designation_name,
    department: item.department_name,
    department_id: item.department_id,   // ✅ add this
    remark: item.remark || "-",
  }))
  .sort((a, b) => b.id - a.id);

      setUsers(designationData);
    });
  };

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);


  const fetchDepartments = () => {
  api.get("/api/departments").then((res) => {
    setDepartments(res.data.departments); // ✅ FIX
  });
};

  // ADD
  const handleAdd = () => {
    // Rule: designation name is required
    if (!designation.trim()) { setDesigError("Designation name is required"); return; }
    // Rule: department selection is required
    if (!department) { setDeptError("Please select a department"); return; }
    setDesigError(""); setDeptError("");
    api
      .post("/api/designations/add", {
        designation_name: designation,
        company_id: 11,
        Designation_id: 16,
        department_id: department,
        remark: remark,
      })
      .then((res) => {
        const newDesignation = {
          id: res.data.id,
          index: users.length + 1,
          designation: designation,
          department:
  departments.find((d) => d.id == department)?.department_name || "-",
   department_id: department,
          remark: remark || "-",
        };

        // ADD AT TOP ✅
        setUsers([newDesignation, ...users]);

        setDesignation("");
        setRemark("");
        setShowModal(false);

        // SUCCESS MESSAGE ✅
        setSuccessMsg("Designation added successfully!");

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      });
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this designation?"))
      return;

    try {
      await api.delete(`/api/designations/delete/${id}`);

      // Remove from frontend
      const updated = users.filter((item) => item.id !== id);
      setUsers(updated);

      // Remove from selected rows if it was selected
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));

      setSuccessMsg("Designation deleted permanently!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // UPDATE
  const handleUpdate = () => {
    // Rule: designation name is required
    if (!designation.trim()) { setDesigError("Designation name is required"); return; }
    // Rule: department selection is required
    if (!department) { setDeptError("Please select a department"); return; }
    setDesigError(""); setDeptError("");
    api
      .put(`/api/designations/update/${editData.id}`, {
        designation_name: designation,
        company_id: 11,
        Designation_id: 16,
        department_id: department,
        remark: remark,
      })
      .then(() => {
        const updatedUsers = users.map((item) => {
          if (item.id === editData.id) {
            return {
              ...item,
              designation: designation,
                department:
    departments.find((d) => d.id == department)?.department_name,
  department_id: department,
              remark: remark,
            };
          }

          return item;
        });

        setUsers(updatedUsers);

        setDesignation("");
        setRemark("");
        setEditData(null);
        setShowModal(false);

        // SUCCESS MESSAGE ✅
        setSuccessMsg("Designation updated successfully!");

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      });
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one record to delete.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete selected designations?")
    )
      return;

    try {
      // Delete each selected row permanently in backend
      await Promise.all(
        selectedRows.map((id) => api.delete(`/api/designations/delete/${id}`)),
      );

      // Remove deleted rows from frontend state
      const updated = users.filter((item) => !selectedRows.includes(item.id));
      setUsers(updated);

      // Clear selection
      setSelectedRows([]);
      setShowCheckbox(false);

      setSuccessMsg("Selected designations deleted permanently!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Bulk delete error:", error);
    }
  };

  // SEARCH
  const filteredUsers = users.filter((item) =>
    item.designation.toLowerCase().includes(search.toLowerCase()),
  );

  // PAGINATION
  const totalRows = filteredUsers.length;

  const totalPages =
    rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedUsers = showAll
    ? filteredUsers
    : filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Organization", path: "/organization/Designation" },
          { name: "Designation" },
        ]}
      />

      {/* TOP BUTTONS */}

      <div className="mb-3">
        <Row>
          <Col lg={12}>
            <Card body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                  <Button
                    className="btn-icon d-flex align-items-center text-white border-0"
                    style={{ backgroundColor: "#663399" }}
                    onClick={() => {
                      setEditData(null);
                      setShowModal(true);
                    }}
                  >
                    <span className="ul-btn__icon">
                      <i className="i-Business-Man text-18"></i>
                    </span>

                    <span className="ul-btn__text ml-2">Add designation</span>
                  </Button>

                  <Button
                    className="btn-icon d-flex align-items-center text-white border-0 shadow-none"
                    style={{ backgroundColor: "#c4302b" }}
                    onClick={() => {
                      if (showCheckbox && selectedRows.length > 0) {
                        handleBulkDelete(); // ✅ DELETE when already selecting
                      } else {
                        setShowCheckbox(true); // ✅ SHOW checkbox first time
                      }
                    }}
                  >
                    <span className="ul-btn__icon">
                      <i className="i-Close-Window text-18"></i>
                    </span>
                    <span className="ul-btn__text ml-2">Bulk Delete</span>
                  </Button>
                </div>

                <div className="d-flex align-items-center border-0">
                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{
                      width: 36,
                      height: 36,
                      background: "#f44336",
                      border: "none",
                    }}
                  >
                    <i className="i-File-Horizontal-Text text-white"></i>
                  </Button>

                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{
                      width: 36,
                      height: 36,
                      background: "#ffc107",
                      border: "none",
                    }}
                  >
                    <i className="i-File-CSV text-white"></i>
                  </Button>

                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{
                      width: 36,
                      height: 36,
                      background: "#007bff",
                      border: "none",
                    }}
                  >
                    <i className="i-Billing text-white"></i>
                  </Button>

                <Dropdown align="end" drop="down">
                    <Dropdown.Toggle
                      className="btn-icon d-flex align-items-center justify-content-center"
                      style={{
                        width: 36,
                        height: 36,
                        background: "#663399",
                        border: "none",
                      }}
                    >
                      <i className="i-Eye text-white"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu style={{ backgroundColor: "#7d5bbe" }}>
                      <Dropdown.Item>Designation</Dropdown.Item>
                      <Dropdown.Item>Remark</Dropdown.Item>
                      <Dropdown.Item>Action</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* TABLE */}

      <Card body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Designation Details</Card.Title>

          {/* SEARCH RIGHT */}

          <div style={{ display: "flex", alignItems: "center" }}>
            {/* SEARCH INPUT */}
            <input
              type="text"
              placeholder="Search"
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

            {/* SEARCH ICON */}
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

            {/* GRID ICON */}
            <div
              style={{
                width: "0px",
                height: "38px",
                backgroundColor: "#6f42c1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="i-Grid-4 text-white"></i>
            </div>

            {/* DOWNLOAD ICON */}
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
                cursor: "pointer",
              }}
            >
              <i className="i-Download text-white"></i>
            </div>
          </div>
        </div>

        <Table bordered hover>
          <thead style={{ background: "#cfc7d9" }}>
            <tr>
              {showCheckbox && (
                <th style={{ backgroundColor: "#cfc7d9" }}>
                  <input
                    type="checkbox"
                    style={{ transform: "scale(1.4)", cursor: "pointer" }}
                    checked={
                      paginatedUsers.length > 0 &&
                      paginatedUsers.every((item) =>
                        selectedRows.includes(item.id),
                      )
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(paginatedUsers.map((item) => item.id)); // select all
                      } else {
                        setSelectedRows([]); // unselect all
                      }
                    }}
                  />
                </th>
              )}
              <th style={{ backgroundColor: "#cfc7d9" }}>No</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Designation</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Department</th>
              
              <th style={{ backgroundColor: "#cfc7d9" }}>Remark</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((item, index) => (
              <tr key={item.id}>
                {showCheckbox && (
                  <td>
                    <input
                      type="checkbox"
                      style={{ transform: "scale(1.4)", cursor: "pointer" }}
                      checked={selectedRows.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows((prev) => [...prev, item.id]); // add only this row
                        } else {
                          setSelectedRows((prev) =>
                            prev.filter((id) => id !== item.id),
                          ); // remove only this row
                        }
                      }}
                    />
                  </td>
                )}

                <td>{startIndex + index + 1}</td>
                
                
                <td>{item.designation}</td>
                
                <td>{item.department}</td>


                <td>{item.remark}</td>

                <td>
                  <div className="d-flex gap-2">
                    <Button
                      style={{
                        width: 32,
                        height: 32,
                        background: "#663399",
                        border: "none",
                      }}
                      onClick={() => {
                        setEditData(item);
                        setDesignation(item.designation);
                        setDepartment(item.department_id);
                        setRemark(item.remark === "-" ? "" : item.remark);

                        setShowModal(true);
                      }}
                    >
                      <i className="i-Edit text-white"></i>
                    </Button>

                    <Button
                      style={{
                        width: 28,
                        height: 28,
                        background: "#c4302b",
                        border: "none",
                      }}
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="i-Close-Window text-white"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* PAGINATION */}

        <div className="d-flex justify-content-end align-items-center mt-3">
          <span className="me-2">Rows per page</span>

          <Form.Select
            value={showAll ? "all" : rowsPerPage}
            onChange={(e) => {
              if (e.target.value === "all") {
                setShowAll(true);
                setRowsPerPage(filteredUsers.length);
              } else {
                setShowAll(false);
                setRowsPerPage(Number(e.target.value));
              }
              setCurrentPage(1);
            }}
            style={{ width: "90px", marginRight: "15px" }}
          >
            <option value={5}>5</option>
            <option value={20}>20</option>
            <option value="all">All</option>
          </Form.Select>

          <span className="me-3">
            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)}
            of {totalRows}
          </span>

          <Button
            style={{
              background: "#7d5bbe",
              border: "none",
              marginRight: "5px",
            }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            ⏮
          </Button>

          <Button
            style={{
              background: "#7d5bbe",
              border: "none",
              marginRight: "5px",
            }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ◀
          </Button>

          <Button
            style={{
              background: "#7d5bbe",
              border: "none",
              marginRight: "5px",
            }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ▶
          </Button>

          <Button
            style={{ background: "#7d5bbe", border: "none" }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            ⏭
          </Button>
        </div>
      </Card>

      {/* MODAL */}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editData ? "Edit Designation" : "Add Designation"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            
            <Row>
               <Col md={12} className="mb-3">
    <Form.Label>Department</Form.Label>
   <Form.Select
  value={department}
  onChange={(e) => { setDepartment(e.target.value); if (e.target.value) setDeptError(""); }}
  isInvalid={!!deptError}
>
  <option value="">Select Department</option>
  {departments.map((dept) => (
    <option key={dept.id} value={dept.id}>
      {dept.department_name}
    </option>
  ))}
</Form.Select>
<Form.Control.Feedback type="invalid">{deptError}</Form.Control.Feedback>
  </Col>
              <Col md={12} className="mb-3">
                <Form.Label>
                  Designation <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Unique value"
                  value={designation}
                  onChange={(e) => { setDesignation(e.target.value); if (e.target.value.trim()) setDesigError(""); }}
                  isInvalid={!!desigError}
                />
                <Form.Control.Feedback type="invalid">{desigError}</Form.Control.Feedback>
              </Col>

              <Col md={12}>
                <Form.Label>Remark</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={2}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            style={{
              background: "#663399",
              border: "none",
              padding: "8px 30px",
            }}
            onClick={editData ? handleUpdate : handleAdd}
          >
            {editData ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
