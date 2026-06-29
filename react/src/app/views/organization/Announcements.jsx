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
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [message, setMessage] = useState("");
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    summary: true,
    description: true,
    publishedFor: true,
    startDate: true,
    endDate: true,
    action: true,
  });

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    startDate: "",
    endDate: "",
    description: "",
    // company: "",
    department: "",
    notify: true,
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
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // FETCH DATA
  useEffect(() => {
    api
      .get("/api/announcements")
      .then((res) => {
        const tableData = res.data.announcements.map((item, ind) => ({
          id: item.id,
          index: ind + 1,
          title: item.title,
          summary: item.summary,
          description: item.description,
          publishedFor: item.publishedFor || "All Department",
          company: item.company || "N/A",
          startDate: item.startDate,
          endDate: item.endDate,
          addedBy: item.addedBy || "admin",
          notify: item.notify ?? true,
        }));
        setUsers(tableData);
      })
      .catch((err) => console.log(err));
  }, []);

  // ADD/EDIT SUBMIT
  const handleSubmit = () => {
    if (!formData.title) {
      alert("Title is required");
      return;
    }

    const payload = {
      title: formData.title,
      summary: formData.summary,
      description: formData.description,
      // company: formData.company,
      publishedFor: formData.department,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notify: formData.notify,
    };

    if (editData) {
      api.put(`/api/announcements/${editData.id}`, payload).then(() => {
        setUsers(
          users.map((u) => (u.id === editData.id ? { ...u, ...payload } : u)),
        );
        setShowModal(false);
        setMessage("Announcement updated successfully!");
      });
    } else {
      api.post("/api/announcements", payload).then((res) => {
        const newItem = {
          id: res.data.id,
          index: users.length + 1,
          ...payload,
          addedBy: "admin",
        };
        setUsers([newItem, ...users]); // TOP INSERT
        setMessage("Announcement added successfully!");
        setShowModal(false);
        setFormData({
          title: "",
          summary: "",
          startDate: "",
          endDate: "",
          description: "",
          company: "",
          department: "",
          notify: true,
        });
      });
    }
  };

  // DELETE SINGLE
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;
    api.delete(`/api/announcements/${id}`).then(() => {
      setUsers(users.filter((u) => u.id !== id));
      setMessage("Announcement deleted successfully!");
    });
  };

  // BULK DELETE
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      alert("Select at least one row");
      return;
    }
    if (!window.confirm("Delete selected announcements?")) return;
    Promise.all(
      selectedRows.map((id) => api.delete(`/api/announcements/${id}`)),
    ).then(() => {
      setUsers(users.filter((u) => !selectedRows.includes(u.id)));
      setSelectedRows([]);
      setShowCheckbox(false);
      setMessage("Selected announcements deleted successfully!");
    });
  };

  // SEARCH & PAGINATION
  const filteredUsers = users.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );
  const totalRows = filteredUsers.length;
  const totalPages =
    rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = showAll
    ? filteredUsers
    : filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Organization", path: "/organization/Announcements" },
          { name: "Announcements" },
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
                    className="btn-icon text-white border-0"
                    style={{ backgroundColor: "#663399" }}
                    onClick={() => {
                      setEditData(null);
                      setFormData({
                        title: "",
                        summary: "",
                        startDate: "",
                        endDate: "",
                        description: "",
                        company: "",
                        department: "",
                        notify: true,
                      });
                      setShowModal(true);
                    }}
                  >
                    <i className="i-Add text-18"></i> Add Announcement
                  </Button>

                  <Button
                    className="btn-icon text-white border-0"
                    style={{ backgroundColor: "#c4302b" }}
                    onClick={() =>
                      showCheckbox && selectedRows.length > 0
                        ? handleBulkDelete()
                        : setShowCheckbox(true)
                    }
                  >
                    <i className="i-Close-Window text-18"></i> Bulk Delete
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
                      <Dropdown.Item
                        onClick={() => toggleColumn("title")}
                        style={{
                          color: visibleColumns.title ? "black" : "#ccc",
                        }}
                      >
                        Title
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => toggleColumn("summary")}
                        style={{
                          color: visibleColumns.summary ? "black" : "#ccc",
                        }}
                      >
                        Summary
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => toggleColumn("description")}
                        style={{
                          color: visibleColumns.description ? "black" : "#ccc",
                        }}
                      >
                        Description
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => toggleColumn("publishedFor")}
                        style={{
                          color: visibleColumns.publishedFor ? "black" : "#ccc",
                        }}
                      >
                        Published For
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => toggleColumn("startDate")}
                        style={{
                          color: visibleColumns.startDate ? "black" : "#ccc",
                        }}
                      >
                        Start Date
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => toggleColumn("endDate")}
                        style={{
                          color: visibleColumns.endDate ? "black" : "#ccc",
                        }}
                      >
                        End Date
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => toggleColumn("action")}
                        style={{
                          color: visibleColumns.action ? "black" : "#ccc",
                        }}
                      >
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
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Announcement</Card.Title>

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
          <thead style={{ backgroundColor: "#cfc7d9" }}>
            <tr>
              {showCheckbox && (
                <th>
                  <input
                    type="checkbox"
                    checked={
                      paginatedUsers.length > 0 &&
                      paginatedUsers.every((u) => selectedRows.includes(u.id))
                    }
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedRows(paginatedUsers.map((u) => u.id))
                        : setSelectedRows([])
                    }
                  />
                </th>
              )}
              <th style={{ backgroundColor: "#cfc7d9" }}>No</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Title</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Summary</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Description</th>
              {/* <th style={{ backgroundColor: "#cfc7d9" }}>Company</th> */}
              <th style={{ backgroundColor: "#cfc7d9" }}>Published For</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Start Date</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>End Date</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((item, i) => (
              <tr key={item.id}>
                {showCheckbox && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={(e) =>
                        e.target.checked
                          ? setSelectedRows((prev) => [...prev, item.id])
                          : setSelectedRows((prev) =>
                              prev.filter((id) => id !== item.id),
                            )
                      }
                    />
                  </td>
                )}
                <td>{startIndex + i + 1}</td>
                <td>{item.title}</td>
                <td>{item.summary}</td>
                <td>{item.description}</td>
                {/* ❌ REMOVE THIS LINE */}
                {/* <td>{item.company}</td> */}
                <td>{item.publishedFor}</td>
                <td>{item.startDate}</td>
                <td>{item.endDate}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      style={{ background: "#2ecc71", border: "none" }}
                      onClick={() => {
                        setViewData(item);
                        setShowViewModal(true);
                      }}
                    >
                      <i className="i-Eye text-white"></i>
                    </Button>

                    <Button
                      style={{ background: "#663399", border: "none" }}
                      onClick={() => {
                        setEditData(item);
                        setFormData({ ...item, department: item.publishedFor });
                        setShowModal(true);
                      }}
                    >
                      <i className="i-Edit text-white"></i>
                    </Button>

                    <Button
                      style={{
                        background: "#c4302b",
                        border: "none",
                        borderRadius: "4px",
                      }}
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="i-Close-Window"></i>
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
            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)} of{" "}
            {totalRows}
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

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editData ? "Edit Announcement" : "Add Announcement"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="should be unique"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Summary</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Col>
              {/* <Col md={6} className="mb-3">
                <Form.Label>Company</Form.Label>
                <Form.Select value={formData.company} onChange={e => setFormData({...formData,company:e.target.value})}>
                  <option value="">Select Company...</option>
                  <option value="HR1">HR1</option>
                  <option value="HR2">HR2</option>
                </Form.Select>
              </Col> */}
              <Col md={6} className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                >
                  <option value="">Select Department...</option>
                  <option value="All Department">All Department</option>
                  <option value="Operations">Operations</option>
                </Form.Select>
              </Col>
              <Col md={6} className="d-flex align-items-center mt-4">
                <Form.Check
                  type="checkbox"
                  label="Notify"
                  checked={formData.notify}
                  onChange={(e) =>
                    setFormData({ ...formData, notify: e.target.checked })
                  }
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{
              background: "#663399",
              border: "none",
              color: "#fff",
              padding: "8px 40px",
              fontWeight: "bold",
            }}
            onClick={handleSubmit}
          >
            {editData ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Announcement Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Title</th>
                <td>{viewData?.title}</td>
              </tr>
              <tr>
                <th>Summary</th>
                <td>{viewData?.summary}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td>{viewData?.description}</td>
              </tr>
              <tr>
                <th>Company</th>
                <td>{viewData?.company}</td>
              </tr>
              <tr>
                <th>Published For</th>
                <td>{viewData?.publishedFor}</td>
              </tr>
              <tr>
                <th>Added By</th>
                <td>{viewData?.addedBy || "admin"}</td>
              </tr>
              <tr>
                <th>Start Date</th>
                <td>{viewData?.startDate}</td>
              </tr>
              <tr>
                <th>End Date</th>
                <td>{viewData?.endDate}</td>
              </tr>
              <tr>
                <th>Notify</th>
                <td>{viewData?.notify ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowViewModal(false)}
            style={{ background: "#663399", color: "#fff" }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
