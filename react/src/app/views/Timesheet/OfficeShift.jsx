import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { RBTable } from "@pallassystems/react-bootstrap-table";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Dropdown,
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function SearchInDataTable() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showHolidayModal, setShowHolidayModal] = useState(false);

  // Columns for Office Shift table
  const columns = useMemo(
    () => [
      { accessorKey: "index", header: "No" },
      { accessorKey: "Company", header: "Company", searchable: true },
      { accessorKey: "Shift", header: "Shift", searchable: true },
      { accessorKey: "Monday", header: "Monday", searchable: true },
      { accessorKey: "Tuesday", header: "Tuesday", searchable: true },
      { accessorKey: "Wednesday", header: "Wednesday", searchable: true },
      { accessorKey: "Thursday", header: "Thursday", searchable: true },
      { accessorKey: "Friday", header: "Friday", searchable: true },
      { accessorKey: "Saturday", header: "Saturday", searchable: true },
      { accessorKey: "Sunday", header: "Sunday", searchable: true },
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
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#663399",
                  border: "none",
                }}
                onClick={() => {
                  navigate("/timesheet/office-shift-form", {
                    state: { editData: item },
                  });
                }}
              >
                <i className="i-Edit text-white"></i>
              </Button>

              {/* Delete Button */}
              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#c4302b",
                  border: "none",
                  borderRadius: "4px",
                }}
                onClick={() => alert("Deleting row: " + item.Company)}
              >
                <i className="i-Close-Window text-white"></i>
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    // Office Shift data
    const officeShiftData = [
      {
        id: 1,
        Company: "HR1",
        Shift: "MidDay",
        Monday: "12:00PM To 09:00PM",
        Tuesday: "12:00PM To 09:00PM",
        Wednesday: "08:00AM To 07:59AM",
        Thursday: "12:00PM To 09:00PM",
        Friday: "12:00PM To 09:00PM",
        Saturday: "04:00PM To 09:00PM",
        Sunday: "",
        status: "Active",
      },
    ];

    // Map data for table
    const mappedData = officeShiftData.map((item, ind) => ({
      id: item.id,
      index: ind + 1,
      Company: item.Company,
      Shift: item.Shift,
      Monday: item.Monday,
      Tuesday: item.Tuesday,
      Wednesday: item.Wednesday,
      Thursday: item.Thursday,
      Friday: item.Friday,
      Saturday: item.Saturday,
      Sunday: item.Sunday,
      status: item.status,
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
          { name: "Users List" },
        ]}
      />

      {/* Top Buttons with Right Icons */}
      <div className="mb-3">
        <Row>
          <Col lg={12}>
            <Card body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Button
                    className="btn-icon m-1 d-flex align-items-center text-white border-0"
                    style={{ backgroundColor: "#663399" }}
                    onClick={() => navigate("/timesheet/office-shift1")}
                  >
                    <span
                      className="ul-btn__icon me-1 fw-bold"
                      style={{ fontSize: "20px" }}
                    >
                      +
                    </span>
                    <span className="ul-btn__text ml-2">
                      Manage Office Shift
                    </span>
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

                {/* Right Icons */}
                <div className="d-flex align-items-center border-0">
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
                        Company
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Shift
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Monday
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Tuesday
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Wednesday
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Thursday
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Friday
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Saturday
                      </Dropdown.Item>
                      <Dropdown.Item className="text-black">
                        Sunday
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
    </section>
  );
}
