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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

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
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSavePolicy = async () => {
    try {
      if (editData) {
        // ✅ UPDATE API
        await api.put(`/api/policies/update/${editData.id}`, formData);
      } else {
        // ✅ ADD API
        await api.post("/api/policies/add", formData);
      }

      // Reload data
      const res = await api.get("/api/policies");

      const policyData = res.data.data
        .map((item, ind) => ({
          id: item.id,
          index: ind + 1,
          title: item.title,
          description: item.description,
        }))
        .reverse();

      setUsers(policyData);

      setFormData({ title: "", description: "" });
      setEditData(null);
      setShowModal(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  useEffect(() => {
    api.get("/api/policies").then((res) => {
      const policyData = res.data.data
        .map((item, ind) => ({
          id: item.id,
          index: ind + 1,
          title: item.title,
          description: item.description,
        }))
        .reverse();

      setUsers(policyData);
    });
  }, []);

 const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this policy?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/api/policies/delete/${id}`);

    // Update frontend after backend success
    const updated = users.filter((item) => item.id !== id);
    setUsers(updated);
  } catch (error) {
    console.error("Delete error:", error);
  }
};

const handleBulkDelete = async () => {
  if (selectedRows.length === 0) {
    return window.alert("Please select at least one record.");
  }

  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${selectedRows.length} selected records?`
  );

  if (!confirmDelete) return;

  try {
    // 🔴 Call delete API for each selected id
    await Promise.all(
      selectedRows.map((id) =>
        api.delete(`/api/policies/delete/${id}`)
      )
    );

    // ✅ Remove from frontend
    const updated = users.filter(
      (item) => !selectedRows.includes(item.id)
    );

    setUsers(updated);

    // ✅ Clear selection
    setSelectedRows([]);
    setShowCheckbox(false);

    window.alert("Selected records deleted successfully.");
  } catch (error) {
    console.error("Bulk delete error:", error);
    window.alert("Failed to delete selected records.");
  }
};
  // SEARCH
  const filteredUsers = users.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
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
          { name: "Organization", path: "/organization/company-policy" },
          { name: "company policy" },
        ]}
      />

      {/* TOP BAR (UNCHANGED) */}
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
                    Add Policy
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
                    Bulk Delete
                  </Button>
                </div>

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
                        Title
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

      {/* TABLE */}
      <Card body>
        {/* HEADER + SEARCH (FIXED SAME AS ABOVE) */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Policy Details</Card.Title>

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

            {/* DOWNLOAD */}
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

        {/* TABLE */}
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
                        setSelectedRows(paginatedUsers.map((item) => item.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </th>
              )}

              <th style={{ backgroundColor: "#cfc7d9" }}>No</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Title</th>
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
                          setSelectedRows((prev) => [...prev, item.id]);
                        } else {
                          setSelectedRows((prev) =>
                            prev.filter((id) => id !== item.id),
                          );
                        }
                      }}
                    />
                  </td>
                )}

                <td>{startIndex + index + 1}</td>
                <td>{item.title}</td>
                <td>{item.description}</td>

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
                        setFormData({
                          title: item.title,
                          description: item.description,
                        });
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

        {/* PAGINATION (MATCHED EXACTLY) */}
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

          {/* PREV */}
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
      {/* MODAL (UNCHANGED) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit Policy" : "Add Policy"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleSavePolicy}>
            {editData ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
