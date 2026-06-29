import clsx from "clsx";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "app/services/api";

const PHOTO_BASE = process.env.REACT_APP_UPLOADS_URL || "https://react5.myospaz.in/uploads/employees";

export default function UserList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api
      .get("/api/employees/recent", { params: { limit: 8 } })
      .then(({ data }) => setEmployees(data.data || []))
      .catch((err) => {
        console.error("Recent employees error:", err);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const avatar = (emp) =>
    emp.photo
      ? `${PHOTO_BASE}/${emp.photo}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=4361ee&color=fff&size=40`;

  // is_active: 1 = active, 0 = inactive
  const statusLabel = (is_active) => (is_active ? "Active" : "Inactive");
  const statusClass = (is_active) => (is_active ? "bg-success"  : "bg-danger");

  return (
    <Row>
      <Col xs={12}>
        <Card className="mb-4">
          <Card.Header className="d-flex align-items-center justify-content-between border-0 mb-0">
            <Card.Title as="h3" className="m-0">Recently Added Employees</Card.Title>
            <Link to="/employees" className="text-primary text-small">View All</Link>
          </Card.Header>

          {loading ? (
            <div className="p-3">
              <div className="placeholder-glow d-flex flex-column gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="placeholder col-12" style={{ height: 36, borderRadius: 6 }} />
                ))}
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="i-Administrator" style={{ fontSize: 40 }} />
              <p className="mt-2 mb-0">No employees found</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  {["#", "Avatar", "Name", "Designation", "Department", "Status"].map((h) => (
                    <th key={h} className="py-3 text-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={emp.id}>
                    <td className="py-3 text-muted">{idx + 1}</td>
                    <td className="py-3">
                      <img
                        src={avatar(emp)}
                        alt={emp.name}
                        className="rounded-circle"
                        style={{ width: 36, height: 36, objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=4361ee&color=fff&size=40`;
                        }}
                      />
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold">{emp.name}</div>
                      <div className="text-muted text-small">{emp.email}</div>
                    </td>
                    <td className="py-3 text-muted">{emp.designation_name || "—"}</td>
                    <td className="py-3 text-muted">{emp.department_name  || "—"}</td>
                    <td className="py-3">
                      <span className={clsx("badge", statusClass(emp.is_active))}>
                        {statusLabel(emp.is_active)}
                      </span>
                    </td>
                    {/* <td className="py-3 text-muted">{emp.last_login_date ? new Date(emp.last_login_date).toLocaleString() : "—"}</td>
                    <td className="py-3 text-muted">{emp.last_login_ip || "—"}</td> */}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </Col>
    </Row>
  );
}