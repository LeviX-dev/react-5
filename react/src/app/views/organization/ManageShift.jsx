import { Row, Col, Card, Button, Form } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "app/services/api";

export default function OfficeShiftCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company_id: "",
    shift_name: "",
    monday_in: "",
    monday_out: "",
    tuesday_in: "",
    tuesday_out: "",
    wednesday_in: "",
    wednesday_out: "",
    thursday_in: "",
    thursday_out: "",
    friday_in: "",
    friday_out: "",
    saturday_in: "",
    saturday_out: "",
    sunday_in: "",
    sunday_out: "",
  });

  // ✅ weekoff state
  const [weekOff, setWeekOff] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const toggleWeekOff = (day) => {
    setWeekOff((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));

    // clear time when weekoff
    setFormData((prev) => ({
      ...prev,
      [`${day}_in`]: "",
      [`${day}_out`]: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      shift_name: formData.shift_name,

      monday_in: weekOff.monday ? null : formData.monday_in,
      monday_out: weekOff.monday ? null : formData.monday_out,

      tuesday_in: weekOff.tuesday ? null : formData.tuesday_in,
      tuesday_out: weekOff.tuesday ? null : formData.tuesday_out,

      wednesday_in: weekOff.wednesday ? null : formData.wednesday_in,
      wednesday_out: weekOff.wednesday ? null : formData.wednesday_out,

      thursday_in: weekOff.thursday ? null : formData.thursday_in,
      thursday_out: weekOff.thursday ? null : formData.thursday_out,

      friday_in: weekOff.friday ? null : formData.friday_in,
      friday_out: weekOff.friday ? null : formData.friday_out,

      saturday_in: weekOff.saturday ? null : formData.saturday_in,
      saturday_out: weekOff.saturday ? null : formData.saturday_out,

      sunday_in: weekOff.sunday ? null : formData.sunday_in,
      sunday_out: weekOff.sunday ? null : formData.sunday_out,
    };

    try {
      await api.post("/api/office-shifts", payload);

      alert("Data Added Successfully ✅");

      navigate("/organization/OfficeShift");
    } catch (err) {
      console.error(err);
      alert("Error saving data ❌");
    }
  };

  const renderDay = (label, day) => (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Label>
          {label}
          <span
            onClick={() => toggleWeekOff(day)}
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: weekOff[day] ? "red" : "#ccc",
              marginLeft: 10,
              cursor: "pointer",
            }}
          />
        </Form.Label>

        <Form.Control
          type="time" // 🔥 FIX
          name={`${day}_in`}
          disabled={weekOff[day]}
          value={weekOff[day] ? "" : formData[`${day}_in`] || ""}
          onChange={handleChange}
        />
      </Col>

      <Col md={6}>
        <Form.Label>&nbsp;</Form.Label>

        <Form.Control
          type="time" // 🔥 FIX
          name={`${day}_out`}
          disabled={weekOff[day]}
          value={weekOff[day] ? "" : formData[`${day}_out`] || ""}
          onChange={handleChange}
        />
      </Col>
    </Row>
  );

  const renderShift = (inTime, outTime, isWeekOff) => {
    // show weekoff only when user selected weekoff
    if (isWeekOff) {
      return <span style={{ color: "red", fontWeight: 500 }}>Weekoff</span>;
    }

    // if no time and no weekoff → show nothing
    if (!inTime && !outTime) {
      return "";
    }

    // show shift
    return `${inTime} - ${outTime}`;
  };

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Timesheets" },
          { name: "Add Office Shift" },
        ]}
      />

      <Card body>
        <div className="d-flex justify-content-end mb-3 pe-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>

        <p className="text-muted mb-4">
          The field labels marked with * are required input fields.
        </p>

        <Form onSubmit={handleSubmit}>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Label>Company *</Form.Label>
              <Form.Control value="Your Company" disabled />
            </Col>

            <Col md={6}>
              <Form.Label>Shift *</Form.Label>
              <Form.Control
                name="shift_name"
                placeholder="shift name"
                onChange={handleChange}
              />
            </Col>
          </Row>

          {renderDay("Monday", "monday")}
          {renderDay("Tuesday", "tuesday")}
          {renderDay("Wednesday", "wednesday")}
          {renderDay("Thursday", "thursday")}
          {renderDay("Friday", "friday")}
          {renderDay("Saturday", "saturday")}
          {renderDay("Sunday", "sunday")}

          <div className="text-center">
            <Button
              type="submit"
              style={{
                backgroundColor: "#663399",
                border: "none",
                padding: "10px 90px",
              }}
            >
              Add
            </Button>
          </div>
        </Form>
      </Card>
    </section>
  );
}
