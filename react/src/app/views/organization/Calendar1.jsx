import React, { useState, useEffect } from "react";
import { Card, Button, Form, Modal } from "react-bootstrap";


import api from "app/services/api";

const AttendanceCalendar = () => {
  const [currentYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showModal, setShowModal] = useState(false);

  const [events, setEvents] = useState({});
  const [selectedEvents, setSelectedEvents] = useState([]);

  const [formDate, setFormDate] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("holiday");
  const [formIcon, setFormIcon] = useState("🎉");

  const [isHolidayMarked, setIsHolidayMarked] = useState(false);
  const [isEventMarked, setIsEventMarked] = useState(false);

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

  // ✅ ONLY STYLE CHANGE HERE
  const getStatusStyle = () => {
    return {
      bg: "#FFFFFF",
      color: "#000000",
      border: "#000000",
    };
  };

  const handleDateClick = (date) => {
    setFormDate(date);

    const dayEvents = events[date] || [];
    setSelectedEvents(dayEvents);

    // ✅ auto check if already holiday
    const hasHoliday = dayEvents.some((ev) => ev.isHolidayMarked === true);
    setIsHolidayMarked(hasHoliday);

    // ✅ auto check if already event
    const hasEvent = dayEvents.some((ev) => ev.isEventMarked === true);
    setIsEventMarked(hasEvent);

    setShowModal(true);
  };

  const handleAddEvent = async () => {
    if (!formDate) return;

    try {
      // ✅ If events already exist → UPDATE them (MULTIPLE SUPPORT)
      if (selectedEvents.length > 0) {
        await Promise.all(
          selectedEvents.map((ev) =>
            api.put("/api/calendar/mark-holiday", {
              id: ev.id,
              isHolidayMarked: isHolidayMarked,
            }),
          ),
        );
        // ✅ Mark as event if enabled
        if (isEventMarked) {
          await Promise.all(
            selectedEvents.map((ev) =>
              api.put("/api/calendar/mark-event", {
                id: ev.id,
                isEventMarked: isEventMarked,
              }),
            ),
          );
        }
      }
      // ✅ New event
      else {
        if (!formName) return;

        await api.post("/api/calendar", {
          title: formName,
          description: formDescription,
          event_date: formDate,
          type: formType,
          icon: formIcon,
          isHolidayMarked: isHolidayMarked,
          isEventMarked: isEventMarked,
        });
      }

      // ✅ REFRESH DATA
      const res = await api.get(
        `/api/calendar?year=${currentYear}`,
      );

      setEvents(res.data);
      setSelectedEvents(res.data[formDate] || []);

      // RESET
      setFormName("");
      setFormDescription("");
      setIsHolidayMarked(false);
      setIsEventMarked(false);
      setFormDate("");

      setShowModal(false);
    } catch (err) {
      console.log(err);
    }
  };
  const handleDeleteEvent = async (id) => {
    try {
      await api.delete(`/api/calendar/${id}`);

      const res = await api.get(
        `/api/calendar?year=${currentYear}`,
      );
      setEvents(res.data);
      setSelectedEvents(res.data[formDate] || []);
    } catch (err) {
      console.log(err);
    }
  };

  const generateDays = () => {
    const firstDay = new Date(currentYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: "", empty: true, data: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const data = events[dateStr] || [];

      // ✅ CHECK HOLIDAY
      const isHoliday = data.some((ev) => ev.isHolidayMarked === true);

      // ✅ CHECK EVENT
      const isEvent = data.some((ev) => ev.isEventMarked === true);

      days.push({ day: d, date: dateStr, data, isHoliday, isEvent });
    }

    return days;
  };

  useEffect(() => {
    api
      .get(`/api/calendar?year=${currentYear}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.log(err));
  }, [currentYear]);

  const handlePrev = () => {
    setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNext = () => {
    setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
  };

  return (
    <div
      style={{
        backgroundColor: "#F4F7F9",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <Card
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          borderRadius: "20px",
          border: "none",
          boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
        }}
      >
        <Card.Body style={{ padding: "30px" }}>
          <div
            className="d-flex align-items-center gap-2"
            style={{ justifyContent: "flex-start", marginBottom: "20px" }}
          >
            <Button
              onClick={handleToday}
              style={{
                backgroundColor: "#f1f3f5",
                border: "none",
                color: "#333",
                fontWeight: "500",
                padding: "6px 14px",
                borderRadius: "6px",
              }}
            >
              Today
            </Button>

            <Button
              onClick={handlePrev}
              style={{
                backgroundColor: "#f1f3f5",
                border: "none",
                color: "#333",
                fontWeight: "500",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              {"<"}
            </Button>

            <h5 style={{ margin: 0, fontWeight: "600", color: "#333" }}>
              {months[selectedMonth]}
            </h5>

            <Button
              onClick={handleNext}
              style={{
                backgroundColor: "#f1f3f5",
                border: "none",
                color: "#333",
                fontWeight: "500",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              {">"}
            </Button>

            <h5
              style={{
                margin: 0,
                fontWeight: "700",
                marginLeft: "10px",
                color: "#333",
              }}
            >
              {currentYear}
            </h5>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w, i) => (
              <div
                key={i}
                style={{ fontSize: "15px", fontWeight: "600", color: "#666" }}
              >
                {w}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "1px",
              backgroundColor: "#F0F0F0",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {generateDays().map((item, i) => {
              // ✅ ADD THIS LINE to debug
              console.log("Events for the day:", item.data);

              return (
                <div
                  key={i}
                  onClick={() => !item.empty && handleDateClick(item.date)}
                  style={{
                    minHeight: "130px",
                    backgroundColor:
                      item.isHoliday || (formDate === item.date && isHolidayMarked)
                        ? "#ff4d4f"
                        : item.isEvent || (formDate === item.date && isEventMarked)
                        ? "#52c41a"
                        : "#FFF",
                    border: item.isHoliday
                      ? "2px solid #ff0000"
                      : item.isEvent
                      ? "2px solid #52c41a"
                      : "1px solid #eee",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: item.empty ? "default" : "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: item.empty
                        ? "#EEE"
                        : item.isHoliday ||
                            (formDate === item.date && isHolidayMarked)
                          ? "#fff"
                          : item.isEvent ||
                              (formDate === item.date && isEventMarked)
                          ? "#fff"
                          : "#000",
                    }}
                  >
                    {item.day}
                  </div>

                  <div className="d-flex flex-column gap-1 mt-2 w-100">
                    {item.data.map((ev, j) => {
                      const style = getStatusStyle();
                      return (
                        <div
                          key={j}
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                            border: `1px solid ${style.border}`,
                            borderRadius: "10px",
                            padding: "5px 8px",
                            fontSize: "15px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            justifyContent: "center",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <div>
                              {ev.icon} {ev.name}
                            </div>
                            {ev.description && (
                              <div
                                style={{
                                  fontSize: "13px",
                                  color:
                                    item.isHoliday ||
                                    (formDate === item.date && isHolidayMarked)
                                      ? "#fff"
                                      : "#555",
                                }}
                              >
                                {ev.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Event</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Mark as Holiday"
              checked={isHolidayMarked}
              onChange={(e) => setIsHolidayMarked(e.target.checked)}
              className="mb-2"
            />

            <Form.Check
              type="checkbox"
              label="Mark as Event"
              checked={isEventMarked}
              onChange={(e) => setIsEventMarked(e.target.checked)}
            />
          </Form>

          <hr />

          <h6>Events on this date:</h6>

          {selectedEvents.length === 0 && <p>No events</p>}

          {selectedEvents.map((ev, i) => (
            <div
              key={i}
              style={{
                marginBottom: "8px",
                padding: "8px",
                border: "1px solid #eee",
                borderRadius: "8px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div>
                  {ev.icon} {ev.name}
                </div>

                {ev.description && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#444",
                      marginTop: "4px",
                      whiteSpace: "normal",
                      overflowWrap: "break-word",
                    }}
                  >
                    {ev.description}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => handleDeleteEvent(ev.id)}
                style={{
                  marginTop: "5px",
                  backgroundColor: "#dc3545",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#b02a37")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
              >
                Delete
              </Button>
            </div>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            style={{ background: "#663399", color: "#fff", border: "none" }}
            onClick={handleAddEvent}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AttendanceCalendar;
