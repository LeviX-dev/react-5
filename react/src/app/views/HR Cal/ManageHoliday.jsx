import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RBTable } from "@pallassystems/react-bootstrap-table";
import { Row, Col, Card, Button, Badge, Modal, Form } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock";

export default function SearchInDataTable() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editData, setEditData] = useState({});

  const [holidayForm, setHolidayForm] = useState({
    eventName: "",
    company: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  /* =========================
     TABLE COLUMNS
     ========================= */
  const columns = useMemo(
    () => [
      { accessorKey: "eventName", header: "Event Name" },
      {
        accessorKey: "published",
        header: "Published",
        Cell: ({ value }) =>
          value ? <Badge bg="success">published</Badge> : "-",
      },
      { accessorKey: "company", header: "Company" },
      { accessorKey: "startDate", header: "Start Date" },
      { accessorKey: "endDate", header: "End Date" },
      {
        accessorKey: "action",
        header: "Action",
        Cell: ({ row }) => {
          const item = row?.original || {};
          return (
            <div className="d-flex align-items-center gap-2">
              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#20c997",
                  border: "none",
                  borderRadius: "4px",
                }}
                onClick={() => {
                  setEditData(item);
                  setShowModal(true);
                }}
              >
                <i className="i-Eye text-white"></i>
              </Button>

              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#6f42c1",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                <i className="i-Pen-2 text-white"></i>
              </Button>

              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#dc3545",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                <i className="i-Close-Window text-white"></i>
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  /* =========================
     FETCH DATA (MOCK)
     ========================= */
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/user/all")
      .then(({ data }) => {
        setUsers(data);
        const eventList = data.map((_, index) => ({
          id: index + 1,
          eventName: "Diwali",
          published: true,
          company: "Myospaz Software Technologies",
          startDate: "18-10-2025",
          endDate: "26-10-2025",
        }));
        setLeaves(eventList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "User", path: "/user/UserList" },
          { name: "Users List" },
        ]}
      />

      {/* ================= TOP BUTTONS ================= */}
       <div className="mb-3">
        <Row>
          <Col lg={12}>
            <Card body>
              <div className="d-flex justify-content-between align-items-center">
                {/* Left Buttons */}
                <div className="d-flex">
                  <Button
                    className="btn-icon m-1 d-flex align-items-center text-white border-0"
                    style={{ backgroundColor: "#663399" }}
                    onClick={() => setShowHolidayModal(true)}
                  >
                    <span className="ul-btn__icon me-1 fw-bold" style={{ fontSize: "20px" }}>
                      +
                    </span>
                    <span className="ul-btn__text ml-2">Add Leave</span>
                  </Button>

                  <Button
                    className="btn-icon m-1 d-flex align-items-center text-white border-0 shadow-none"
                    style={{ backgroundColor: "#c4302b" }}
                  >
                    <span className="ul-btn__icon">
                      <i className="i-Close-Window text-18"></i>
                    </span>
                    <span className="ul-btn__text ml-2">Bulk Delete</span>
                  </Button>
                </div>

                {/* Right Icons */}
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
                  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{ width: 36, height: 36, backgroundColor: "#663399", border: "none", borderRadius: 0 }}
                  >
                    <i className="i-Eye text-18 text-white"></i>
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      {/* ================= TABLE ================= */}
      <Card body>
        <Card.Title>Events</Card.Title>
        {loading ? (
          <div className="text-center p-4">Loading data...</div>
        ) : (
          <div className="table-responsive">
            <RBTable data={leaves} varient="primary" columns={columns} />
          </div>
        )}
      </Card>

      {/* ================= VIEW MODAL ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>View Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Event:</strong> {editData.eventName}</p>
          <p><strong>Company:</strong> {editData.company}</p>
          <p><strong>Start Date:</strong> {editData.startDate}</p>
          <p><strong>End Date:</strong> {editData.endDate}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* ================= ADD HOLIDAY MODAL (ADDED ONLY) ================= */}
      <Modal
        show={showHolidayModal}
        onHide={() => setShowHolidayModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Holiday</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Event Name *</Form.Label>
                <Form.Control placeholder="Event Name" />
              </Col>

              <Col md={6}>
                <Form.Label>Company</Form.Label>
                <Form.Select>
                  <option>Select Company...</option>
                  <option>Myospaz Software Technologies</option>
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={4} />
              </Col>

              <Col md={6}>
                <Form.Label>Start Date</Form.Label>
                <Form.Control type="date" />
              </Col>

              <Col md={6}>
                <Form.Label>End Date</Form.Label>
                <Form.Control type="date" />
              </Col>

              <Col md={6}>
                <Form.Label>Status *</Form.Label>
                <Form.Select>
                  <option>status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </Form.Select>
              </Col>
            </Row>

            <div className="text-center mt-4">
              <Button
                style={{
                  backgroundColor: "#ffc107",
                  border: "none",
                  padding: "8px 30px",
                  fontWeight: 600,
                }}
              >
                Add
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </section>
  );
}

/* ================= ICON BUTTON STYLE ================= */
const iconBtn = (bg) => ({
  width: 36,
  height: 36,
  backgroundColor: bg,
  border: "none",
  borderRadius: 0,
  marginRight: 6,
});
