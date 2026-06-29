import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { RBTable } from "@pallassystems/react-bootstrap-table";
import { Row, Col, Card, Button, Badge, Modal, Form } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function SearchInDataTable() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);

  // Columns for Meetings table
  const columns = useMemo(
    () => [
      { accessorKey: "index", header: "No" },
      { accessorKey: "Company", header: "Company", searchable: true },
      { accessorKey: "Employee", header: "Employee", searchable: true },
      { accessorKey: "MeetingTitle", header: "Meeting Title", searchable: true },
      { accessorKey: "MeetingDate", header: "Meeting Date", searchable: true },
      { accessorKey: "MeetingTime", header: "Meeting Time", searchable: true },
      { accessorKey: "Status", header: "Status", searchable: true },

      {
        accessorKey: "action",
        header: "Action",
        Cell: ({ row }) => {
          const item = row?.original || {};
          return (
            <div className="d-flex align-items-center gap-2">
              {/* Edit Button */}
              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', backgroundColor: '#663399', border: 'none' }}
                onClick={() => {
                  navigate("/timesheet/office-shift-form", {
                    state: { editData: item }
                  });
                }}
              >
                <i className="i-Edit text-white"></i>
              </Button>

              {/* Delete Button */}
              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#c4302b',
                  border: 'none',
                  borderRadius: '4px'
                }}
                onClick={() => alert("Deleting row: " + item.Company)}
              >
                <i className="i-Close-Window text-white"></i>
              </Button>
            </div>
          );
        }
      }
    ],
    []
  );

  useEffect(() => {
    // Meetings data (same as screenshot)
    const meetingsData = [
      {
        id: 1,
        Company: "HR1",
        Employee: "",
        MeetingTitle: "Project Vision",
        MeetingDate: "01-04-2021",
        MeetingTime: "03:20PM",
        Status: "pending",
      },
      {
        id: 2,
        Company: "HR1",
        Employee: "",
        MeetingTitle: "Test Meeting",
        MeetingDate: "06-01-2023",
        MeetingTime: "02:00PM",
        Status: "pending",
      },
      {
        id: 3,
        Company: "HR1",
        Employee: "",
        MeetingTitle: "Test Meeting",
        MeetingDate: "20-01-2023",
        MeetingTime: "02:00PM",
        Status: "pending",
      },
      {
        id: 4,
        Company: "HR1",
        Employee: "",
        MeetingTitle: "Meeting 1Title",
        MeetingDate: "21-02-2023",
        MeetingTime: "12:00AM",
        Status: "completed",
      },
      {
        id: 5,
        Company: "Aarya Trans Solutions pune",
        Employee: "Hrushikesh Kankrale",
        MeetingTitle: "Training",
        MeetingDate: "31-07-2025",
        MeetingTime: "02:45PM",
        Status: "ongoing",
      },
    ];

    // Map data for table
    const mappedData = meetingsData.map((item, ind) => ({
      id: item.id,
      index: ind + 1,
      Company: item.Company,
      Employee: item.Employee,
      MeetingTitle: item.MeetingTitle,
      MeetingDate: item.MeetingDate,
      MeetingTime: item.MeetingTime,
      Status: item.Status,
      action: null,
    }));

    setUsers(mappedData);
  }, []);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "User", path: "/user/UserList" },
          { name: "Users List" }
        ]}
      />

      <div className="d-flex align-items-center gap-2">
        <Button
          className="btn-icon m-1 d-flex align-items-center text-white border-0"
          style={{ backgroundColor: "#663399" }}
          onClick={() => setShowAddMeetingModal(true)}
        >
          <span className="ul-btn__icon me-1 fw-bold" style={{ fontSize: "20px" }}>
            +
          </span>
          <span className="ul-btn__text ml-2">Add Meeting</span>
        </Button>

        <Button
          className="btn-icon m-1 d-flex align-items-center text-white border-0 shadow-none"
          style={{ backgroundColor: "#c4302b" }}
        >
          <span className="ul-btn__icon">
            <i className="i-Close-Window text-28"></i>
          </span>
          <span className="ul-btn__text ml-2">Bulk Delete</span>
        </Button>
      </div>

      <Card body className="mt-4">
        <Card.Title>Search In Table</Card.Title>
        {users.length > 0 ? (
          <div className="table-responsive">
            <RBTable data={users} varient="primary" columns={columns} />
          </div>
        ) : (
          <div className="text-center p-4">Loading data...</div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Shift</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Company</Form.Label>
                <Form.Control type="text" defaultValue={editData?.Company} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Shift</Form.Label>
                <Form.Control type="text" defaultValue={editData?.Shift} />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0">
          <Button
            style={{
              backgroundColor: "#663399",
              border: "none",
              padding: "8px 60px",
            }}
            onClick={() => setShowModal(false)}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Meeting Modal */}
      <Modal
        show={showAddMeetingModal}
        onHide={() => setShowAddMeetingModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6} className="mb-3">
                <Form.Label>
                  Company <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select defaultValue="">
                  <option value="" disabled>
                    Select Company...
                  </option>
                  <option>HR1</option>
                  <option>HR2</option>
                  <option>Aarya Trans Solutions Pune</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Employee <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select defaultValue="">
                  <option value="" disabled>
                    Select Employee...
                  </option>
                  <option>Employee 1</option>
                  <option>Employee 2</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6} className="mb-3">
                <Form.Label>Meeting Title</Form.Label>
                <Form.Control type="text" placeholder="Meeting Title" />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Meeting Date</Form.Label>
                <Form.Control type="date" />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6} className="mb-3">
                <Form.Label>Meeting Time</Form.Label>
                <Form.Control type="time" />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select defaultValue="">
                  <option value="" disabled>
                    Select Status...
                  </option>
                  <option>Pending</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12} className="mb-3">
                <Form.Label>Meeting Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Meeting Note"
                />
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Check
                  type="checkbox"
                  label="Notification"
                  id="meeting-notification"
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 p-0">
          <Button
            style={{
              backgroundColor: "#ffbf00",
              color: "#000",
              border: "none",
              borderRadius: 0,
              width: "100%",
              padding: "12px 0",
              fontWeight: "bold",
            }}
            onClick={() => setShowAddMeetingModal(false)}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}