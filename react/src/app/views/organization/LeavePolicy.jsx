import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

export default function LeaveDashboard() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [leaveRows, setLeaveRows] = useState([
    { type: "Sick Leave", days: "", isPaid: true },
  ]);

  /* ================= FETCH DATA ================= */
  const fetchPolicies = async () => {
    try {
      const res = await api.get("/api/leave-policy/list");

      // FIX: safe handling (backend may return array or {data})
      setPolicies(res.data.data || res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...leaveRows];
    updated[index][field] = value;
    setLeaveRows(updated);
  };

  const addRow = () => {
    setLeaveRows([...leaveRows, { type: "", days: "", isPaid: true }]);
  };

  const removeRow = (index) => {
    setLeaveRows((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        leaves: leaveRows,
      };

      if (editData) {
        await api.put(
          `/api/leave-policy/update/${editData.id}`,
          payload
        );
      } else {
        await api.post("/api/leave-policy/create", payload);
      }

      await fetchPolicies();

      setShowModal(false);
      setEditData(null);
      setFormData({ title: "", description: "" });
      setLeaveRows([{ type: "Sick Leave", days: "", isPaid: true }]);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditData(item);

    setFormData({
      title: item.title,
      description: item.description,
    });

    setLeaveRows(item.leaves || [{ type: "", days: "" }]);
    setShowModal(true);
  };

/* ================= DELETE ================= */
const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this leave policy?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/api/leave-policy/delete/${id}`);

    fetchPolicies();

    window.alert("Leave policy deleted successfully.");
  } catch (err) {
    console.error(err);

    window.alert("Failed to delete leave policy.");
  }
};

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Leave Management" },
        ]}
      />

      {/* HEADER */}
      <Row className="mb-3">
        <Col>
          <Card body>
            <Button
              style={{ backgroundColor: "#663399", border: "none" }}
              onClick={() => {
                setEditData(null);
                setFormData({ title: "", description: "" });
                setLeaveRows([{ type: "Sick Leave", days: "" }]);
                setShowModal(true);
              }}
            >
              Add Leave Policy
            </Button>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Card body>
        <Card.Title>Leave Policies</Card.Title>

        <Table bordered>
          <thead style={{ backgroundColor: "#cfc7d9" }}>
            <tr>
              <th style={{ backgroundColor: "#cfc7d9" }}>No</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Title</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Description</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Leaves</th>
               <th style={{ backgroundColor: "#cfc7d9" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {policies.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No Data
                </td>
              </tr>
            ) : (
              policies.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>{item.title}</td>
                  <td>{item.description}</td>

                  <td>
                    {item.leaves?.map((l, i) => (
                      <div key={i}>
                        {l.type} - {l.days} days
                      </div>
                    ))}
                  </td>

                 <td>
  <div className="d-flex gap-2">
    <Button
      style={{
        width: "32px",
        height: "32px",
        backgroundColor: "#663399",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
      onClick={() => handleEdit(item)}
    >
      <i className="i-Edit text-white"></i>
    </Button>

    <Button
      style={{
        width: "32px",
        height: "32px",
        backgroundColor: "#c4302b",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
      onClick={() => handleDelete(item.id)}
    >
      <i className="i-Close-Window text-white"></i>
    </Button>
  </div>
</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* MODAL */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editData ? "Edit Policy" : "Add Leave Policy"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <h6>Leave Components</h6>

          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Days</th>
                <th>Paid</th>
                <th>Add</th>
              </tr>
            </thead>

            <tbody>
              {leaveRows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control
                      value={row.type}
                      onChange={(e) => handleRowChange(index, "type", e.target.value)}
                    />
                  </td>

                  <td>
                    <Form.Control
                      type="number"
                      value={row.days}
                      onChange={(e) => handleRowChange(index, "days", e.target.value)}
                    />
                  </td>

                  <td style={{ verticalAlign: "middle" }}>
                    <Form.Check
                      type="switch"
                      id={`isPaid-switch-${index}`}
                      checked={row.isPaid === undefined ? true : row.isPaid}
                      onChange={(e) => handleRowChange(index, "isPaid", e.target.checked)}
                      label={row.isPaid === undefined ? "Paid" : row.isPaid ? "Paid" : "Unpaid"}
                    />
                  </td>

                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeRow(index)}
                      disabled={leaveRows.length === 1}
                      style={{ marginRight: "6px" }}
                    >
                      ✕
                    </Button>

                    {index === leaveRows.length - 1 && (
                      <Button
                        onClick={addRow}
                        style={{ backgroundColor: "#663399", border: "none" }}
                      >
                        +
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button
            style={{ backgroundColor: "#663399", border: "none" }}
            onClick={handleSave}
          >
            {editData ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}