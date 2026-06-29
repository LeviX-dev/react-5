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
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import api from "app/services/api";

export default function SearchInDataTable() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "No",
      "Shift",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const tableRows = users.map((item, index) => [
      index + 1,
      item.Shift,
      item.Monday,
      item.Tuesday,
      item.Wednesday,
      item.Thursday,
      item.Friday,
      item.Saturday,
      item.Sunday,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("departments.pdf");
  };

  const [visibleColumns, setVisibleColumns] = useState({
    shift: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
    action: true,
  });

useEffect(() => {
  api
    .get("/api/office-shifts")
    .then((res) => {
      console.log("Session User:", res.data);

      const officeShift = res.data.data.map((item, ind) => ({
        id: item.id,
        index: ind + 1,
        Shift: item.Shift, // <-- also fix this
        Monday: item.Monday === " To " ? 'Off' : item.Monday, 
        Tuesday: item.Tuesday === " To " ? 'Off' : item.Tuesday,
        Wednesday:item.Wednesday === " To " ? 'Off' : item.Wednesday ,
        Thursday: item.Thursday === " To " ? 'Off' : item.Thursday,
        Friday: item.Friday === " To " ? 'Off' : item.Friday,
        Saturday: item.Saturday === " To " ? 'Off' : item.Saturday,
        Sunday: item.Sunday === " To " ? 'Off' : item.Sunday,
      }));

      console.log("Transformed Office Shift Data:", officeShift);

      setUsers(officeShift);
    })
    .catch((err) => console.error(err));
}, []);

  // 🔍 SEARCH
  const filteredUsers = users.filter((item) =>
    item.Shift.toLowerCase().includes(search.toLowerCase()),
  );

  // 📄 PAGINATION
  const totalRows = filteredUsers.length;
  const totalPages =
    rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedUsers = showAll
    ? filteredUsers
    : filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  const handleSingleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this record?")) return;

    try {
      await api.delete(`/api/office-shifts/${id}`);

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one record");
      return;
    }

    if (!window.confirm("Are you sure to delete selected records?")) return;

    try {
      // OPTION 1: If backend supports bulk delete
      await api.post("/api/office-shifts/bulk-delete", {
        ids: selectedRows,
      });

      // OPTION 2 (safer): delete one by one
      // await Promise.all(
      //   selectedRows.map((id) =>
      //     api.delete(`/api/office-shifts/${id}`)
      //   )
      // );

      // update UI
      setUsers((prev) => prev.filter((u) => !selectedRows.includes(u.id)));

      setSelectedRows([]);
      setShowCheckbox(false);

      alert("Selected records deleted successfully");
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Bulk delete failed");
    }
  };

  const toggleColumn = (col) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "User", path: "/organization/OfficeShift" },
          { name: "Office Shift" },
        ]}
      />

      {/* 🔴 DO NOT CHANGE FIRST CONTAINER */}
      <Card body className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Button
              className="btn-icon m-1 d-flex align-items-center text-white border-0"
              style={{ backgroundColor: "#663399" }}
              onClick={() => navigate("/organization/ManageShift")}
            >
              <i className="i-Checked-User text-18 me-2"></i>
              Manage Office Shift
            </Button>

            <Button
              className="btn-icon d-flex align-items-center text-white border-0 shadow-none"
              style={{ backgroundColor: "#c4302b" }}
              onClick={() => {
                if (showCheckbox && selectedRows.length > 0) {
                  handleBulkDelete(); // ✅ DELETE when already selecting
                } else {
                  setShowCheckbox(true); // ✅ SHOW checkbox first time
                }
              }}
            >
              <span className="ul-btn__icon">
                <i className="i-Close-Window text-18"></i>
              </span>
              <span className="ul-btn__text ml-2">Bulk Delete</span>
            </Button>
          </div>

          {/* RIGHT SIDE ICONS */}

          <div className="d-flex align-items-center border-0">
            <Button
              className="btn-icon d-flex align-items-center justify-content-center me-1"
              style={{
                width: 36,
                height: 36,
                backgroundColor: "#f44336",
                border: "none",
                borderRadius: "0",
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
                borderRadius: "0",
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
                borderRadius: "0",
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
                <Dropdown.Item onClick={() => toggleColumn("shift")}>
                  Shift
                </Dropdown.Item>

                <Dropdown.Item onClick={() => toggleColumn("monday")}>
                  Monday
                </Dropdown.Item>

                <Dropdown.Item onClick={() => toggleColumn("tuesday")}>
                  Tuesday
                </Dropdown.Item>

                <Dropdown.Item onClick={() => toggleColumn("wednesday")}>
                  Wednesday
                </Dropdown.Item>

                <Dropdown.Item onClick={() => toggleColumn("thursday")}>
                  Thursday
                </Dropdown.Item>

                <Dropdown.Item onClick={() => toggleColumn("friday")}>
                  Friday
                </Dropdown.Item>

                <Dropdown.Item onClick={() => toggleColumn("saturday")}>
                  Saturday
                </Dropdown.Item>

                <Dropdown.Item onClick={() => toggleColumn("sunday")}>
                  Sunday
                </Dropdown.Item>

                <Dropdown.Item onClick={() => toggleColumn("action")}>
                  Action
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Card>

      <Card body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Office Shift Details</Card.Title>

          {/* SEARCH RIGHT */}

          <div style={{ display: "flex", alignItems: "center" }}>
            {/* SEARCH INPUT */}
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

            {/* SEARCH ICON */}
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

            {/* GRID ICON */}
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

            {/* DOWNLOAD ICON */}
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

        <Table bordered hover style={{ marginTop: "0" }}>
          <thead style={{ backgroundColor: "#cfc7d9" }}>
            <tr>
              {showCheckbox && (
                <th>
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
                        setSelectedRows(paginatedUsers.map((item) => item.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </th>
              )}

              <th style={{ backgroundColor: "#cfc7d9" }}>No</th>
              {/* <th style={{ backgroundColor: "#cfc7d9" }}>NoCompany</th> */}
              {visibleColumns.shift && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Shift</th>
              )}
              {visibleColumns.monday && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Monday</th>
              )}
              {visibleColumns.tuesday && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Tuesday</th>
              )}
              {visibleColumns.wednesday && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Wednesday</th>
              )}
              {visibleColumns.thursday && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Thursday</th>
              )}
              {visibleColumns.friday && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Friday</th>
              )}
              {visibleColumns.saturday && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Saturday</th>
              )}
              {visibleColumns.sunday && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Sunday</th>
              )}
              {visibleColumns.action && (
                <th style={{ backgroundColor: "#cfc7d9" }}>Action</th>
              )}
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
                          setSelectedRows((prev) =>
                            prev.filter((id) => id !== item.id),
                          );
                        }
                      }}
                    />
                  </td>
                )}

                <td>{startIndex + index + 1}</td>
                {/* <td>{item.Company}</td> */}
                {visibleColumns.shift && <td>{item.Shift}</td>}
                {visibleColumns.monday && <td>{item.Monday}</td>}
                {visibleColumns.tuesday && <td>{item.Tuesday}</td>}
                {visibleColumns.wednesday && <td>{item.Wednesday}</td>}
                {visibleColumns.thursday && <td>{item.Thursday}</td>}
                {visibleColumns.friday && <td>{item.Friday}</td>}
                {visibleColumns.friday && <td>{item.Saturday}</td>}
                {visibleColumns.sunday && <td>{item.Sunday}</td>}

                <td>
                  <div className="d-flex gap-2">
                    {/* EDIT */}
                    <Button
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#663399",
                        border: "none",
                      }}
                      onClick={() =>
                        navigate("/organization/editshift", {
                          state: { editData: item },
                        })
                      }
                    >
                      <i className="i-Edit text-white"></i>
                    </Button>

                    {/* DELETE */}
                    <Button
                      style={{
                        width: "28px",
                        height: "28px",
                        backgroundColor: "#c4302b",
                        border: "none",
                      }}
                      onClick={() => handleSingleDelete(item.id)}
                    >
                      <i className="i-Close-Window text-white"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)} of{" "}
            {totalRows}
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
      </Card>
    </section>
  );
}
