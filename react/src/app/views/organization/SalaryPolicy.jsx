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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "app/services/api";

export default function SearchInDataTable() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [titleError, setTitleError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [earningRows, setEarningRows] = useState([
    { component: "Basic", type: "percentage", value: "", checked: true },
  ]);
  const [deductionRows, setDeductionRows] = useState([
    { component: "PF", type: "percentage", value: "", checked: true },
  ]);
  const [contributionRows, setContributionRows] = useState([
    { component: "PF Employer", type: "percentage", value: "", basedOn: "Basic", checked: true },
  ]);

  // ── helpers ────────────────────────────────────────────────────────────────

  /** Safely maps the standard { data: { data: [...] } } shape */
  const mapPolicies = (res) =>
    (res?.data?.data || []).map((item, ind) => ({
      id: item.id,
      index: ind + 1,
      title: item.title,
      description: item.description,
    }));

  const refreshList = async () => {
    const res = await api.get("/api/salary-policies");
    setUsers(mapPolicies(res));
  };

  // ── initial load ───────────────────────────────────────────────────────────

  useEffect(() => {
    refreshList();
  }, []);

  // ── form ───────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── earnings ───────────────────────────────────────────────────────────────

  const handleAddRow = () =>
    setEarningRows([...earningRows, { component: "", type: "percentage", value: "", checked: true }]);

  const handleEarningChange = (index, field, value) => {
    const updated = [...earningRows];
    updated[index][field] = value;
    setEarningRows(updated);
  };

  // ── deductions ─────────────────────────────────────────────────────────────

  const handleAddDeductionRow = () =>
    setDeductionRows([...deductionRows, { component: "", type: "percentage", value: "", checked: true }]);

  const handleDeductionChange = (index, field, value) => {
    const updated = [...deductionRows];
    updated[index][field] = value;
    setDeductionRows(updated);
  };

  // ── contributions ──────────────────────────────────────────────────────────

  const handleAddContributionRow = () =>
    setContributionRows([
      ...contributionRows,
      { component: "", type: "percentage", value: "", basedOn: "Basic", checked: true },
    ]);

  const handleContributionChange = (index, field, value) => {
    const updated = [...contributionRows];
    updated[index][field] = value;
    setContributionRows(updated);
  };

  // ── save policy (Add / Edit via small modal) ───────────────────────────────

  const handleSaveSalaryPolicy = async () => {
    if (!formData.title.trim()) {
      setTitleError("Policy title is required");
      return;
    }
    setTitleError("");

    try {
      if (editData) {
        await api.put(`/api/salary-policies/update/${editData.id}`, {
          title: formData.title,
          description: formData.description,
          company_id: 11,
          earnings: earningRows,
          deductions: deductionRows,
          contributions: contributionRows,
        });
      } else {
        await api.post(`/api/salary-policies/add`, {
          title: formData.title,
          description: formData.description,
          company_id: 11,
          earnings: earningRows,
          deductions: deductionRows,
          contributions: contributionRows,
        });
      }

      await refreshList();
      setShowModal(false);
      setFormData({ title: "", description: "" });
      setEditData(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ── save salary (Edit via large modal) ────────────────────────────────────

  const handleSaveSalary = async () => {
    try {
      if (editData) {
        await api.put(`/api/salary-policies/update/${editData.id}`, {
          ...formData,
          earnings: earningRows,
          deductions: deductionRows,
          contributions: contributionRows,
        });
      }
      await refreshList();
      setShowSalaryModal(false);
      setEditData(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this salary policy?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/api/salary-policies/delete/${id}`);

    setUsers((prev) => prev.filter((item) => item.id !== id));
  } catch (error) {
    console.error("Delete error:", error);
  }
};

const handleBulkDelete = async () => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${selectedRows.length} selected records?`
  );

  if (!confirmDelete) return;

  try {
    await Promise.all(
      selectedRows.map((id) =>
        api.delete(`/api/salary-policies/delete/${id}`)
      )
    );

    setUsers((prev) =>
      prev.filter((item) => !selectedRows.includes(item.id))
    );

    setSelectedRows([]);
    setShowCheckbox(false);
  } catch (error) {
    console.error("Bulk delete error:", error);
  }
};

  // ── PDF ────────────────────────────────────────────────────────────────────

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["No", "Title", "Description"]],
      body: users.map((item, index) => [index + 1, item.title, item.description]),
    });
    doc.save("salary-policies.pdf");
  };

  // ── derived data ───────────────────────────────────────────────────────────

  const filteredUsers = users.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRows = filteredUsers.length;
  const totalPages = rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = showAll
    ? filteredUsers
    : filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Organization", path: "/organization/company-policy" },
          { name: "company policy" },
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
                      setFormData({ title: "", description: "" });
                      setTitleError("");
                      setShowModal(true);
                    }}
                  >
                    Add Salary Policy
                  </Button>
                  <Button
                    className="btn-icon d-flex align-items-center text-white border-0 shadow-none"
                    style={{ backgroundColor: "#c4302b" }}
                    onClick={() => {
                      if (showCheckbox && selectedRows.length > 0) {
                        handleBulkDelete();
                      } else {
                        setShowCheckbox(true);
                      }
                    }}
                  >
                    Bulk Delete
                  </Button>
                </div>

                <div className="d-flex align-items-center border-0">
                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{ width: 36, height: 36, backgroundColor: "#f44336", border: "none", borderRadius: 0 }}
                  >
                    <i className="i-File-Horizontal-Text text-18 text-white"></i>
                  </Button>
                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{ width: 36, height: 36, backgroundColor: "#ffc107", border: "none", borderRadius: 0 }}
                  >
                    <i className="i-File-CSV text-18 text-white"></i>
                  </Button>
                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{ width: 36, height: 36, backgroundColor: "#007bff", border: "none", borderRadius: 0 }}
                  >
                    <i className="i-Billing text-18 text-white"></i>
                  </Button>
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      className="btn-icon d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36, backgroundColor: "#663399", border: "none", borderRadius: 0 }}
                    >
                      <i className="i-Eye text-18 text-white"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ backgroundColor: "#7d5bbe" }}>
                      <Dropdown.Item className="text-black">Title</Dropdown.Item>
                      <Dropdown.Item className="text-black">Remark</Dropdown.Item>
                      <Dropdown.Item className="text-black">Action</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* TABLE CARD */}
      <Card body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Policy Details</Card.Title>
          <div style={{ display: "flex", alignItems: "center" }}>
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

        <Table bordered hover style={{ marginTop: 0 }}>
          <thead style={{ backgroundColor: "#cfc7d9" }}>
            <tr>
              {showCheckbox && (
                <th style={{ backgroundColor: "#cfc7d9" }}>
                  <input
                    type="checkbox"
                    style={{ transform: "scale(1.4)", cursor: "pointer" }}
                    checked={
                      paginatedUsers.length > 0 &&
                      paginatedUsers.every((item) => selectedRows.includes(item.id))
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
                          setSelectedRows((prev) => prev.filter((id) => id !== item.id));
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
                      style={{ width: "32px", height: "32px", backgroundColor: "#663399", border: "none" }}
                      onClick={async () => {
                        setEditData(item);
                        setFormData({ title: item.title, description: item.description });
                        try {
                          const [earn, ded, con] = await Promise.all([
                            api.get(`/api/salary-policies/${item.id}/earnings`),
                            api.get(`/api/salary-policies/${item.id}/deductions`),
                            api.get(`/api/salary-policies/${item.id}/contributions`),
                          ]);

                          // ✅ Safe fallback for each sub-list
                          const earnData = earn?.data?.data || [];
                          const dedData = ded?.data?.data || [];
                          const conData = con?.data?.data || [];

                          setEarningRows(
                            earnData.length
                              ? earnData
                              : [{ component: "Basic", type: "percentage", value: "" }]
                          );
                          setDeductionRows(
                            dedData.length
                              ? dedData
                              : [{ component: "PF", type: "percentage", value: "" }]
                          );
                          setContributionRows(
                            conData.length
                              ? conData
                              : [{ component: "PF Employer", type: "percentage", value: "", basedOn: "Basic" }]
                          );
                          setShowSalaryModal(true);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      <i className="i-Edit text-white"></i>
                    </Button>
                    <Button
                      style={{ width: "28px", height: "28px", backgroundColor: "#c4302b", border: "none" }}
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
            {startIndex + 1}–{Math.min(startIndex + rowsPerPage, totalRows)} of {totalRows}
          </span>
          <Button
            style={{ backgroundColor: "#7d5bbe", border: "none", marginRight: "5px" }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >⏮</Button>
          <Button
            style={{ backgroundColor: "#7d5bbe", border: "none", marginRight: "5px" }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >◀</Button>
          <Button
            style={{ backgroundColor: "#7d5bbe", border: "none", marginRight: "5px" }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >▶</Button>
          <Button
            style={{ backgroundColor: "#7d5bbe", border: "none" }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >⏭</Button>
        </div>
      </Card>

      {/* ADD / EDIT POLICY MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit Policy" : "Add Policy"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value.trim()) setTitleError("");
                }}
                isInvalid={!!titleError}
              />
              <Form.Control.Feedback type="invalid">{titleError}</Form.Control.Feedback>
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
          <Button onClick={handleSaveSalaryPolicy}>
            {editData ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT SALARY MODAL */}
      <Modal show={showSalaryModal} onHide={() => setShowSalaryModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Salary</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>

          <h6 className="mb-3">Policy Details</h6>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control name="title" value={formData.title} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} />
          </Form.Group>

          {/* EARNINGS */}
          <h6 className="mb-3">Earnings</h6>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Component</th>
                <th>Type</th>
                <th>Value</th>
                <th>Add</th>
              </tr>
            </thead>
            <tbody>
              {earningRows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control value={row.component} onChange={(e) => handleEarningChange(index, "component", e.target.value)} />
                  </td>
                  <td>
                    <Form.Select value={row.type} onChange={(e) => handleEarningChange(index, "type", e.target.value)}>
                      <option value="percentage">percentage</option>
                      <option value="amount">amount</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control type="number" placeholder={row.type === "percentage" ? "%" : "₹"} value={row.value} onChange={(e) => handleEarningChange(index, "value", e.target.value)} />
                  </td>
                  <td>
                    {index === earningRows.length - 1 && (
                      <Button onClick={handleAddRow} style={{ backgroundColor: "#663399", border: "none" }}>+</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* DEDUCTIONS */}
          <h6 className="mt-4 mb-3">Deductions</h6>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Component</th>
                <th>Type</th>
                <th>Value</th>
                <th>Add</th>
              </tr>
            </thead>
            <tbody>
              {deductionRows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control value={row.component} onChange={(e) => handleDeductionChange(index, "component", e.target.value)} />
                  </td>
                  <td>
                    <Form.Select value={row.type} onChange={(e) => handleDeductionChange(index, "type", e.target.value)}>
                      <option value="percentage">percentage</option>
                      <option value="amount">amount</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control type="number" placeholder={row.type === "percentage" ? "%" : "₹"} value={row.value} onChange={(e) => handleDeductionChange(index, "value", e.target.value)} />
                  </td>
                  <td>
                    {index === deductionRows.length - 1 && (
                      <Button onClick={handleAddDeductionRow} style={{ backgroundColor: "#663399", border: "none" }}>+</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* CONTRIBUTIONS */}
          <h6 className="mt-4 mb-3">Contribution</h6>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Component</th>
                <th>Based On</th>
                <th>Type</th>
                <th>Value</th>
                <th>Add</th>
              </tr>
            </thead>
            <tbody>
              {contributionRows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control value={row.component} onChange={(e) => handleContributionChange(index, "component", e.target.value)} />
                  </td>
                  <td>
                    <Form.Select value={row.basedOn} onChange={(e) => handleContributionChange(index, "basedOn", e.target.value)}>
                      <option value="Basic">Basic</option>
                      <option value="Gross">Gross</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Select value={row.type} onChange={(e) => handleContributionChange(index, "type", e.target.value)}>
                      <option value="percentage">percentage</option>
                      <option value="amount">amount</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control type="number" placeholder={row.type === "percentage" ? "%" : "₹"} value={row.value} onChange={(e) => handleContributionChange(index, "value", e.target.value)} />
                  </td>
                  <td>
                    {index === contributionRows.length - 1 && (
                      <Button onClick={handleAddContributionRow} style={{ backgroundColor: "#663399", border: "none" }}>+</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </Modal.Body>
        <Modal.Footer>
          <Button style={{ backgroundColor: "#663399", border: "none" }} onClick={handleSaveSalary}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}