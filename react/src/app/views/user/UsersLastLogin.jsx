import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Dropdown,
  Form,
  Table,
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";
import { useNavigate } from "react-router-dom";

const formatDisplayDateTime = (value) => {
  if (!value) return "N/A";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return String(value);

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UsersLastLogin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  // 🔍 SEARCH + PAGINATION STATES
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ✅ FETCH DATA
  useEffect(() => {
    api
      .get("/api/users/last-login")
      .then((res) => {
        const data = res.data.data || [];


        const PHOTO_BASE =  "http://localhost:3000";
        const formatted = data.map((item, i) => {
          let image = "/assets/images/faces/1.jpg";
          if (item.photo) {
            image = `${PHOTO_BASE}/${item.photo}`;
          } else if (item.username) {
            image = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username)}&background=4361ee&color=fff&size=40`;
          }
          return {
            id: item.id,
            index: i + 1,
            image,
            username: item.username || "N/A",
            lastLoginDate: formatDisplayDateTime(item.last_login_date),
            lastLoginIp: item.last_login_ip || "N/A",
            is_active: Number(item.is_active),
          };
        });

        setUsers(formatted);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // 🔍 SEARCH FILTER
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  // 📄 PAGINATION
  const totalRows = filteredUsers.length;
  const totalPages =
    rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  // 🔥 STATUS TOGGLE
  const handleToggleStatus = async (item) => {
    const newStatus = item.is_active === 1 ? 0 : 1;

    try {
      await api.put(`/api/users/${item.id}/status`, {
        is_active: newStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === item.id ? { ...u, is_active: newStatus } : u,
        ),
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "User", path: "/user/UsersLastlogin" },
          { name: "Users Last Login" },
        ]}
      />

      {/* 🔥 TOP ACTION BAR */}
      <div className="mb-3">
        <Row>
          <Col lg={12}>
            <Card body>
              <div className="d-flex justify-content-end align-items-center">
                <div className="d-flex align-items-center">
                  <Button
                    className="me-1"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#f44336",
                      border: "none",
                    }}
                  >
                    <i className="i-File-Horizontal-Text text-white"></i>
                  </Button>

                  <Button
                    className="me-1"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#ffc107",
                      border: "none",
                    }}
                  >
                    <i className="i-File-CSV text-white"></i>
                  </Button>

                  <Button
                    className="me-1"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#007bff",
                      border: "none",
                    }}
                  >
                    <i className="i-Billing text-white"></i>
                  </Button>

                  <Dropdown align="end">
                    <Dropdown.Toggle
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: "#663399",
                        border: "none",
                      }}
                    >
                      <i className="i-Eye text-white"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item>Username</Dropdown.Item>
                      <Dropdown.Item>Last Login</Dropdown.Item>
                      <Dropdown.Item>Status</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 🔥 TABLE */}

      <Card body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="mb-0">Users Last Login</Card.Title>

          {/* 🔍 SEARCH (NOW ABOVE TABLE) */}
          <input
            type="text"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "250px", height: "36px" }}
          />
        </div>

        <Table bordered hover>
          <thead style={{ background: "#cfc7d9" }}>
            <tr>
              <th>No</th>
              <th>Image</th>
              <th>Username</th>
              <th>Last Login Date</th>
              <th>Last Login IP</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((item, index) => (
              <tr key={item.id}>
                <td>{startIndex + index + 1}</td>

                <td>
                  <img
                    src={item.image}
                    alt="user"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "4px",
                    }}
                  />
                </td>

                <td>{item.username}</td>
                <td>{item.lastLoginDate}</td>
                <td>{item.lastLoginIp}</td>

                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Check
                      type="switch"
                      checked={item.is_active === 1}
                      onChange={() => handleToggleStatus(item)}
                    />

                    <Badge bg={item.is_active === 1 ? "success" : "danger"}>
                      {item.is_active === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* 🔥 PAGINATION */}
        <div className="d-flex justify-content-end align-items-center mt-3">
          <span className="me-2">Rows per page</span>

          <Form.Select
            value={rowsPerPage}
            onChange={(e) => {
              const val =
                e.target.value === "all"
                  ? filteredUsers.length
                  : Number(e.target.value);
              setRowsPerPage(val);
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
            style={{
              backgroundColor: "#7d5bbe",
              border: "none",
            }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            ⏭
          </Button>
        </div>
      </Card>
    </section>
  );
}
