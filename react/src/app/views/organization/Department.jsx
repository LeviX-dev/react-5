import { useEffect, useMemo, useState } from "react";
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
  const [successMsg, setSuccessMsg] = useState("");

  const [department, setDepartment] = useState("");
  const [remark, setRemark] = useState("");
  // Per-field validation error
  const [deptError, setDeptError] = useState("");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const tableColumn = ["No", "Department", "Remark"];

    const tableRows = users.map((item, index) => [
      index + 1,
      item.department,
      item.remark,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("departments.pdf");
  };

  useEffect(() => {
    api
      .get("/api/departments", {
        withCredentials: true,
      })
      .then((res) => {
        console.log("Session User:", res.data.sessionUser);

        const departmentData = res.data.departments
          .map((item, ind) => ({
            id: item.id,
            index: ind + 1,
            department: item.department_name,
            remark: item.remark || "-",
          }))
          .reverse(); // 👈 IMPORTANT

        setUsers(departmentData);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleAddDepartment = () => {
    // Rule: department name is required
    if (!department.trim()) {
      setDeptError("Department name is required");
      return;
    }
    setDeptError("");
    api
      .post(
        "/api/departments",
        {
          department: department,
          remark: remark,
        },
        { withCredentials: true },
      )
      .then((res) => {
        const newDepartment = {
          id: res.data.id,
          index: users.length + 1,
          department: department,
          remark: remark,
        };

        setUsers([newDepartment, ...users]);

        setDepartment("");
        setRemark("");
        setShowModal(false);

        setSuccessMsg("Department added successfully!");

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      });
  };

  const handleDeleteDepartment = (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    api
      .delete(`/api/departments/${id}`, {
        withCredentials: true,
      })
      .then(() => {
        const updatedUsers = users.filter((item) => item.id !== id);
        setUsers(updatedUsers);

        setSuccessMsg("Department deleted successfully!");

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      });
  };

  const handleUpdateDepartment = () => {
    // Rule: department name is required
    if (!department.trim()) {
      setDeptError("Department name is required");
      return;
    }
    setDeptError("");
    api
      .put(
        `/api/departments/${editData.id}`,
        {
          department: department,
          remark: remark,
        },
        { withCredentials: true },
      )
      .then(() => {
        const updatedUsers = users.map((item) => {
          if (item.id === editData.id) {
            return {
              ...item,
              department: department,
              remark: remark,
            };
          }

          return item;
        });

        setUsers(updatedUsers);

        setDepartment("");
        setRemark("");
        setEditData(null);
        setShowModal(false);

        setSuccessMsg("Department updated successfully!");

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      });
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one department to delete.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete selected departments permanently?",
      )
    )
      return;

    try {
      // 🔴 Call correct backend API for each selected department
      await Promise.all(
        selectedRows.map((id) =>
          api.delete(`/api/departments/${id}`, {
            withCredentials: true,
          }),
        ),
      );

      // ✅ Remove deleted departments from frontend state
      const updatedUsers = users.filter(
        (item) => !selectedRows.includes(item.id),
      );
      setUsers(updatedUsers);

      // ✅ Clear selection
      setSelectedRows([]);
      setShowCheckbox(false);

      setSuccessMsg("Selected departments deleted permanently!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Bulk delete error:", error);
    }
  };

  // SEARCH FILTER
  const filteredUsers = users.filter((item) =>
    item.department.toLowerCase().includes(search.toLowerCase()),
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
          { name: "Organization", path: "/organization/Department" },
          { name: "Department" },
        ]}
      />

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
                      <i className="i-Conference text-18"></i>
                    </span>
                    <span className="ul-btn__text ml-2">Add department</span>
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

                {/* RIGHT SIDE ICONS */}

                <div className="d-flex align-items-center border-0">
                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#f44336",
                      border: "none",
                      borderRadius: "0",
                    }}
                  >
                    <i className="i-File-Horizontal-Text text-18 text-white"></i>
                  </Button>

                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#ffc107",
                      border: "none",
                      borderRadius: "0",
                    }}
                  >
                    <i className="i-File-CSV text-18 text-white"></i>
                  </Button>

                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#007bff",
                      border: "none",
                      borderRadius: "0",
                    }}
                  >
                    <i className="i-Billing text-18 text-white"></i>
                  </Button>

                  <Dropdown align="end">
                    <Dropdown.Toggle
                      className="btn-icon d-flex align-items-center justify-content-center"
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: "#663399",
                        border: "none",
                        borderRadius: 0,
                      }}
                    >
                      <i className="i-Eye text-18 text-white"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu style={{ backgroundColor: "#7d5bbe" }}>
                      <Dropdown.Item className="text-black">
                        Department
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Remark
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Action
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* TABLE CARD */}

      <Card body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Department Details</Card.Title>

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

        <Table bordered hover style={{ marginTop: "0" }}>
          <thead style={{ backgroundColor: "#cfc7d9" }}>
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

                <td>{item.department}</td>

                <td>{item.remark}</td>

                <td>
                  <div className="d-flex gap-2">
                    <Button
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#663399",
                        border: "none",
                      }}
                      onClick={() => {
                        setEditData(item);
                        setDepartment(item.department);
                        setRemark(item.remark === "-" ? "" : item.remark);
                        setShowModal(true);
                      }}
                    >
                      <i className="i-Edit text-white"></i>
                    </Button>

                    <Button
                      style={{
                        width: "28px",
                        height: "28px",
                        backgroundColor: "#c4302b",
                        border: "none",
                      }}
                      onClick={() => handleDeleteDepartment(item.id)}
                    >
                      <i className="i-Close-Window text-white"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)} of{" "}
            {totalRows}
          </span>

          {/* FIRST */}
          <Button
            style={{
              backgroundColor: "#7d5bbe",
              border: "none",
              marginRight: "5px",
            }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            ⏮
          </Button>

          {/* PREVIOUS */}
          <Button
            style={{
              backgroundColor: "#7d5bbe",
              border: "none",
              marginRight: "5px",
            }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ◀
          </Button>

          {/* NEXT */}
          <Button
            style={{
              backgroundColor: "#7d5bbe",
              border: "none",
              marginRight: "5px",
            }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ▶
          </Button>

          {/* LAST */}
          <Button
            style={{ backgroundColor: "#7d5bbe", border: "none" }}
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
            {editData ? "Edit Department" : "Add Department"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>
                  Department <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Unique Value"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    if (e.target.value.trim()) setDeptError("");
                  }}
                  isInvalid={!!deptError}
                />
                <Form.Control.Feedback type="invalid">{deptError}</Form.Control.Feedback>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Remark</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Enter remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0 justify-content-end">
          <Button
            style={{
              backgroundColor: "#663399",
              color: "#fff",
              border: "none",
              padding: "8px 30px",
            }}
            onClick={editData ? handleUpdateDepartment : handleAddDepartment}
          >
            {editData ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
