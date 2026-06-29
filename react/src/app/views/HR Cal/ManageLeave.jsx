import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RBTable } from "@pallassystems/react-bootstrap-table";
import { Row, Col, Card, Button, Badge, Modal, Form } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock";

const formatDisplayDate = (value) => {
  if (!value) return "N/A";

  const rawValue = String(value).trim();
  const dateOnly = rawValue.includes("T") ? rawValue.split("T")[0] : rawValue;

  let parsedDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split("-").map(Number);
    parsedDate = new Date(year, month - 1, day);
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateOnly)) {
    const [day, month, year] = dateOnly.split("-").map(Number);
    parsedDate = new Date(year, month - 1, day);
  } else {
    parsedDate = new Date(dateOnly);
  }

  if (Number.isNaN(parsedDate.getTime())) return dateOnly;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SearchInDataTable() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // employee list
  const [leaves, setLeaves] = useState([]); // table data
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false); // view/edit
  const [showHolidayModal, setShowHolidayModal] = useState(false); // add leave
  const [editData, setEditData] = useState({});

  // Add Leave form
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "",
    company: "",
    department: "",
    employee: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    description: "",
    remarks: "",
    status: "",
    notification: false,
  });

  // Columns for RBTable
  const columns = useMemo(
    () => [
      { accessorKey: "index", header: "No" },
      { accessorKey: "leaveType", header: "Leave Type", searchable: true },
      { accessorKey: "employee", header: "Employee", searchable: true },
      { accessorKey: "department", header: "Department", searchable: true },
      { accessorKey: "duration", header: "Duration", searchable: true },
      { accessorKey: "appliedDate", header: "Applied Date", searchable: true },
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
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#20c997",
                  border: "none",
                }}
                onClick={() => {
                  setEditData(item);
                  setShowModal(true);
                }}
              >
                <i className="i-Eye text-white"></i>
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Fetch users and leave data
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/user/all")
      .then(({ data }) => {
        const employeeList = data.map((item, ind) => ({
          id: item.id || ind + 1,
          User: item.user || item.name,
          Department: item.department || "N/A",
        }));
        setUsers(employeeList);

        const leaveList = data.map((item, ind) => ({
          id: item.id || ind + 1,
          index: ind + 1,
          leaveType: item.leaveType || "Others",
          employee: item.user || item.name,
          department: item.department || "N/A",
          duration:
            item.startDate && item.endDate
              ? `${formatDisplayDate(item.startDate)} To ${formatDisplayDate(item.endDate)} (Total ${item.totalDays || 1} Days)`
              : "N/A",
          appliedDate: formatDisplayDate(item.appliedDate),
          status: item.status || "pending",
          action: null,
        }));
        setLeaves(leaveList);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  // Calculate total days when start/end date changes
  useEffect(() => {
    if (leaveForm.startDate && leaveForm.endDate) {
      const start = new Date(leaveForm.startDate);
      const end = new Date(leaveForm.endDate);
      const diffTime = end - start;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setLeaveForm((prev) => ({ ...prev, totalDays: diffDays > 0 ? diffDays : 0 }));
    }
  }, [leaveForm.startDate, leaveForm.endDate]);

  const handleLeaveChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLeaveForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

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

      {/* Leave Table */}
      <Card body className="mt-4">
        <Card.Title>Leave Applications</Card.Title>
        {loading ? (
          <div className="text-center p-4">Loading data...</div>
        ) : (
          <div className="table-responsive">
            <RBTable data={leaves} varient="primary" columns={columns} />
          </div>
        )}
      </Card>

      {/* View/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>View Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Leave Type</Form.Label>
                <Form.Control type="text" defaultValue={editData?.leaveType} readOnly />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Employee</Form.Label>
                <Form.Control type="text" defaultValue={editData?.employee} readOnly />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Control type="text" defaultValue={editData?.department} readOnly />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Duration</Form.Label>
                <Form.Control type="text" defaultValue={editData?.duration} readOnly />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Applied Date</Form.Label>
                <Form.Control type="text" defaultValue={editData?.appliedDate || "N/A"} readOnly />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0">
          <Button
            style={{ backgroundColor: "#663399", border: "none", padding: "8px 60px" }}
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Leave Modal */}
      <Modal show={showHolidayModal} onHide={() => setShowHolidayModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Leave Type *</Form.Label>
                <Form.Select name="leaveType" value={leaveForm.leaveType} onChange={handleLeaveChange}>
                  <option value="">Leave Type</option>
                  <option value="Casual">Casual</option>
                  <option value="Medical">Medical</option>
                  <option value="Others">Others</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Company *</Form.Label>
                <Form.Select name="company" value={leaveForm.company} onChange={handleLeaveChange}>
                  <option value="">Select Company...</option>
                  <option value="Company A">Company A</option>
                  <option value="Company B">Company B</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Department *</Form.Label>
                <Form.Select name="department" value={leaveForm.department} onChange={handleLeaveChange}>
                  <option value="">Select Department...</option>
                  <option value="HR">HR</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Operations">Operations</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Employee *</Form.Label>
                <Form.Select name="employee" value={leaveForm.employee} onChange={handleLeaveChange}>
                  <option value="">Select Employee...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.User}>
                      {user.User}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Start Date *</Form.Label>
                <Form.Control type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveChange} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>End Date *</Form.Label>
                <Form.Control type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveChange} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Total Days</Form.Label>
                <Form.Control type="text" name="totalDays" value={leaveForm.totalDays} readOnly />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={2} name="description" value={leaveForm.description} onChange={handleLeaveChange} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control as="textarea" rows={2} name="remarks" value={leaveForm.remarks} onChange={handleLeaveChange} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={leaveForm.status} onChange={handleLeaveChange}>
                  <option value="">Select Status...</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Col>
              <Col md={12} className="mb-3">
                <Form.Check type="checkbox" label="Notification" name="notification" checked={leaveForm.notification} onChange={handleLeaveChange} />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0">
          <Button style={{ backgroundColor: "#ffc107", border: "none", padding: "8px 60px" }} onClick={() => setShowHolidayModal(false)}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
} 