import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, Card } from "react-bootstrap";

const splitTime = (value) => {
  if (!value) return ["", ""];
  return value.split(" To ");
};

export default function OfficeShiftForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  const [company, setCompany] = useState("");
  const [shift, setShift] = useState("");

  const [days, setDays] = useState({
    Monday: { in: "", out: "" },
    Tuesday: { in: "", out: "" },
    Wednesday: { in: "", out: "" },
    Thursday: { in: "", out: "" },
    Friday: { in: "", out: "" },
    Saturday: { in: "", out: "" },
    Sunday: { in: "", out: "" }
  });

  useEffect(() => {
    if (editData) {
      setCompany(editData.Company || "");
      setShift(editData.Shift || "");

      const updatedDays = {};
      Object.keys(days).forEach((day) => {
        const [inTime, outTime] = splitTime(editData[day]);
        updatedDays[day] = { in: inTime || "", out: outTime || "" };
      });

      setDays(updatedDays);
    }
  }, [editData]);

  const handleTimeChange = (day, type, value) => {
    setDays((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSubmit = () => {
    const payload = {
      Company: company,
      Shift: shift,
      ...Object.fromEntries(
        Object.entries(days).map(([day, time]) => [
          day,
          time.in && time.out ? `${time.in} To ${time.out}` : ""
        ])
      )
    };

    console.log("Submitting payload:", payload);
    navigate(-1);
  };

  return (
    <section>
      <Card body>
        <h4 className="mb-4">
          {editData ? "Edit Office Shift" : "Add Office Shift"}
        </h4>

        {/* Company & Shift */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Company *</Form.Label>
            <Form.Select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">Select Company</option>
              <option value="HR1">HR1</option>
              <option value="Aarya Trans Solutions pune">
                Aarya Trans Solutions pune
              </option>
            </Form.Select>
          </Col>

          <Col md={6}>
            <Form.Label>Shift *</Form.Label>
            <Form.Control
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              placeholder="Enter Shift"
            />
          </Col>
        </Row>

        {/* Days Time */}
        {Object.keys(days).map((day) => (
          <Row key={day} className="mb-3 align-items-center">
            <Col md={3}>
              <Form.Label>{day}</Form.Label>
            </Col>

            <Col md={4}>
              <Form.Control
                type="time"
                value={days[day].in}
                onChange={(e) =>
                  handleTimeChange(day, "in", e.target.value)
                }
              />
            </Col>

            <Col md={4}>
              <Form.Control
                type="time"
                value={days[day].out}
                onChange={(e) =>
                  handleTimeChange(day, "out", e.target.value)
                }
              />
            </Col>
          </Row>
        ))}

        {/* Submit */}
        <div className="text-center mt-4">
          <Button
            style={{
              backgroundColor: "#ffc107",
              border: "none",
              width: "300px"
            }}
            onClick={handleSubmit}
          >
            {editData ? "Update" : "Save"}
          </Button>
        </div>
      </Card>
    </section>
  );
}
