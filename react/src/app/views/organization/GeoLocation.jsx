import { useEffect, useState, useCallback } from "react";
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
import api from "app/services/api";

export default function SearchInDataTable() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  // Validation errors
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      const res = await api.get(`/api/geo-locations`);

      console.log("Fetched geo locations:", res.data);

      const list = Array.isArray(res.data) ? res.data : res.data.data;

      setUsers(
        list
          .map((item, ind) => ({
            id: item.id ?? item.value, // ✅ FIX (important)
            index: ind + 1,
            name: item.label,
            latitude: item.latitude,
            longitude: item.longitude,
            radius: item.radius,
          }))
          .reverse(),
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!name?.toString().trim()) errs.name = "Location is required";
    if (!latitude?.toString().trim()) errs.latitude = "Latitude is required";
    if (!longitude?.toString().trim()) errs.longitude = "Longitude is required";
    if (!radius?.toString().trim()) {
      errs.radius = "Radius is required";
    } else {
      const radiusNum = parseFloat(radius);
      if (isNaN(radiusNum) || radiusNum < 50 || radiusNum > 5000) {
        errs.radius = "Radius must be between 50 and 5000 metres";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      await api.post(`/api/add/geo-locations`, {
        // ✅ FIXED ROUTE
        name,
        latitude,
        longitude,
        radius: parseFloat(radius) || 100,
      });

      setName("");
      setLatitude("");
      setLongitude("");
      setRadius("");
      setShowModal(false);

      setSuccessMsg("Geo location added successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };
  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      await api.put(`/api/geo-locations/${editData.id}`, {
        name,
        latitude,
        longitude,
        radius: parseFloat(radius) || 100,
      });

      setName("");
      setLatitude("");
      setLongitude("");
      setRadius("");
      setEditData(null);
      setShowModal(false);

      setSuccessMsg("Geo location updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = useCallback(async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;

    try {
      await api.delete(`/api/geo-locations/delete/${item.id}`); // ✅ FIXED

      setSuccessMsg("Geo location deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }, []);

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one location to delete.");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete ${selectedRows.length} selected location(s) permanently?`,
    );

    if (!confirmDelete) return;

    try {
      await api.post(`/api/geo-locations/bulk-delete`, {
        ids: selectedRows,
      });

      setSelectedRows([]);
      setShowCheckbox(false);

      setSuccessMsg("Selected geo locations deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // ── search + pagination ────────────────────────────────
  const filteredUsers = users.filter((item) =>
    (item.name || "").toLowerCase().includes((search || "").toLowerCase()),
  );

  const totalRows = filteredUsers.length;
  const totalPages =
    rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const isAllSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((item) => selectedRows.includes(item.id));

  const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Organization", path: "/organization/location" },
          { name: "Geo Location" },
        ]}
      />

      {/* TOP ACTION BAR */}
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
                      setName("");
                      setLatitude("");
                      setLongitude("");
                      setRadius("");
                      setErrors({});
                      setShowModal(true);
                    }}
                  >
                    <span className="ul-btn__icon">
                      <i className="i-Map-Marker text-18"></i>
                    </span>
                    <span className="ul-btn__text ml-2">Add Geo Location</span>
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
                    <span className="ul-btn__icon">
                      <i className="i-Close-Window text-18"></i>
                    </span>
                    <span className="ul-btn__text ml-2">Bulk Delete</span>
                  </Button>
                </div>

                <div className="d-flex align-items-center">
                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#f44336",
                      border: "none",
                      borderRadius: 0,
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
                      borderRadius: 0,
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
                      borderRadius: 0,
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
                        Location
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Latitude
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Longitude
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

      {/* SUCCESS MESSAGE */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* TABLE CARD */}
      <Card body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Geo Location Details</Card.Title>

          {/* SEARCH */}
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
                        // ✅ select ALL rows
                        setSelectedRows((prev) => [
                          ...new Set([
                            ...prev,
                            ...paginatedUsers.map((item) => item.id),
                          ]),
                        ]);
                      } else {
                        // ✅ clear all
                        setSelectedRows([]);
                      }
                    }}
                  />
                </th>
              )}

              <th style={{ backgroundColor: "#cfc7d9" }}>No</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Location</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Latitude</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Longitude</th>
              <th style={{ backgroundColor: "#cfc7d9" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((item, index) => (
              <tr key={item.id ?? index}>
                {showCheckbox && (
                  <td>
                    {/* ✅ ROW CHECKBOX (SINGLE SELECT 🔥) */}
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
                <td>{item.name}</td>
                <td>{item.latitude}</td>
                <td>{item.longitude}</td>

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
                        setName(item.name);
                        setLatitude(item.latitude);
                        setLongitude(item.longitude);
                        setRadius(item.radius || 100);
                        setErrors({});
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
                      onClick={() => handleDelete(item)}
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
            value={rowsPerPage}
            onChange={(e) => {
              const value =
                e.target.value === "all"
                  ? filteredUsers.length
                  : Number(e.target.value);
              setRowsPerPage(value);
              setCurrentPage(1);
            }}
            style={{ width: "90px", marginRight: "15px" }}
          >
            <option value={5}>5</option>
            <option value={20}>20</option>
            <option value="all">All</option>
          </Form.Select>

          <span className="me-3">
            {startIndex + 1}–{Math.min(startIndex + rowsPerPage, totalRows)} of{" "}
            {totalRows}
          </span>

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
          <Button
            style={{ backgroundColor: "#7d5bbe", border: "none" }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            ⏭
          </Button>
        </div>
      </Card>

      {/* ADD / EDIT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editData ? "Edit Geo Location" : "Add Geo Location"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>
                  Location <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Location Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Latitude <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="18.750314"
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, latitude: "" }));
                  }}
                  isInvalid={!!errors.latitude}
                />
                <Form.Control.Feedback type="invalid">{errors.latitude}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Longitude <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="73.617798"
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, longitude: "" }));
                  }}
                  isInvalid={!!errors.longitude}
                />
                <Form.Control.Feedback type="invalid">{errors.longitude}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Radius (metres) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="100"
                  min="50"
                  max="5000"
                  value={radius}
                  onChange={(e) => {
                    setRadius(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, radius: "" }));
                  }}
                  isInvalid={!!errors.radius}
                />
                <Form.Text className="text-muted">
                  Recommended: 100m for office buildings.
                </Form.Text>
                <Form.Control.Feedback type="invalid">{errors.radius}</Form.Control.Feedback>
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
              fontWeight: "bold",
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
