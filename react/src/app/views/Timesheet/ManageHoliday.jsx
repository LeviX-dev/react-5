import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

export default function SearchInDataTable() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showAll, setShowAll] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const currentYear = new Date().getFullYear();
const handleDownloadPDF = () => {
  const doc = new jsPDF();

  const tableColumn = ["No", "Event Name", "Date", "Description"];

  const tableRows = filteredData.map((item, index) => [
    index + 1,
    item.eventName,
    item.startDate,
    item.description,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
  });

  doc.save("holidays.pdf");
};

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    setLoading(true);

    api
      .get(`/api/calendar?year=${currentYear}`)
      .then((res) => {
        let formatted = [];

        Object.keys(res.data).forEach((date) => {
          res.data[date].forEach((ev) => {
            if (ev.isHolidayMarked) {
              const monthIndex = new Date(date).getMonth();

              formatted.push({
                id: ev.id,
                eventName: ev.name,
                description: ev.description || "-",
                startDate: date,
                published: ev.isHolidayMarked,
                month: monthIndex,
              });
            }
          });
        });

        setLeaves(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentYear]);


  const filteredData = leaves
    .filter((item) => item.month === selectedMonth)
    .filter((item) =>
      item.eventName.toLowerCase().includes(search.toLowerCase()),
    );

  const totalRows = filteredData.length;
  const totalPages =
    rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedData = showAll
    ? filteredData
    : filteredData.slice(startIndex, startIndex + rowsPerPage);

const handleUpdate = () => {
  const payload = {
    title: editData.eventName,
    description: editData.description,
    event_date: editData.startDate
  };

  api
    .put(`/api/calendar/${editData.id}`, payload)
    .then(() => {
      const updated = leaves.map((item) =>
        item.id === editData.id ? { ...item, ...editData } : item
      );

      setLeaves(updated);
      setShowModal(false);
      setIsEditing(false);
      setEditData({});
    })
    .catch((err) => console.error(err));
};
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    api
      .delete(`/api/calendar/${id}`)
      .then(() => {
        const updated = leaves.filter((item) => item.id !== id);
        setLeaves(updated);
      })
      .catch((err) => console.error(err));
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

   
      <Card body className="mb-3">
        <div className="d-flex flex-wrap gap-2">
          {months.map((m, index) => (
            <Button
              key={index}
              onClick={() => {
                setSelectedMonth(index);
                setCurrentPage(1);
              }}
              style={{
                backgroundColor:
                  selectedMonth === index ? "#663399" : "#e0d7f3",
                color: selectedMonth === index ? "#fff" : "#000",
                border: "none",
              }}
            >
              {m}
            </Button>
          ))}
        </div>
      </Card>

      {/* ================= TABLE ================= */}
      <Card body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Holidays Details</Card.Title>


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

        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          <>
            <Table bordered hover>
              <thead style={{ backgroundColor: "#cfc7d9" }}>
                <tr>
                 <th style={{ backgroundColor: "#cfc7d9" }}>No</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Event Name</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Published</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Date</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Description</th>
                  <th style={{ backgroundColor: "#cfc7d9" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{item.eventName}</td>
                      <td>
                        <Badge bg="success">published</Badge>
                      </td>
                      <td>{item.startDate}</td>
                      <td>{item.description}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
  style={{ width: 32, height: 32, backgroundColor: "#20c997", border: "none" }}
  onClick={() => {
    setEditData(item);
    setIsEditing(false); 
    setShowModal(true);
  }}
>
  <i className="i-Eye text-white"></i>
</Button>

                          <Button
                            style={{
                              width: 32,
                              height: 32,
                              backgroundColor: "#6f42c1",
                              border: "none",
                            }}
                            onClick={() => {
                              setEditData(item);
                              setIsEditing(true);
                              setShowModal(true);
                            }}
                          >
                            <i className="i-Pen-2 text-white"></i>
                          </Button>

                          <Button
                            style={{
                              width: 32,
                              height: 32,
                              backgroundColor: "#dc3545",
                              border: "none",
                            }}
                            onClick={() => handleDelete(item.id)}
                          >
                            <i className="i-Close-Window text-white"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No holidays in this month
                    </td>
                  </tr>
                )}
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
                    setRowsPerPage(filteredData.length);
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)}{" "}
                of {totalRows}
              </span>

              {/* FIRST */}
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

              {/* PREVIOUS */}
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

              {/* NEXT */}
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

              {/* LAST */}
              <Button
                style={{ backgroundColor: "#7d5bbe", border: "none" }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                ⏭
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
  {isEditing ? "Edit Event" : "View Event"}
</Modal.Title>
        </Modal.Header>

        <Modal.Body>
           <Form>

    {/* EVENT NAME */}
    <Form.Group className="mb-2">
      <Form.Label>Event Name</Form.Label>
      <Form.Control
        type="text"
        disabled={!isEditing}
        value={editData.eventName || ""}
        onChange={(e) =>
          setEditData({ ...editData, eventName: e.target.value })
        }
      />
    </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={editData.startDate || ""}
                onChange={(e) =>
                  setEditData({ ...editData, startDate: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={editData.description || ""}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>

          {isEditing && (
            <Button
              onClick={handleUpdate}
              style={{ backgroundColor: "#6f42c1", border: "none" }}
            >
              Update
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </section>
  );
}
