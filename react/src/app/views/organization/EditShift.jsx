import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, Card } from "react-bootstrap";
import axios from "axios";
import api from "app/services/api";

const formatTimeForInput = (time) => {
  if (!time) return "";

  time = time.replace(".", ":");

  const match = time.match(/(\d{1,2}:\d{2})/);
  if (match) return match[1];

  return "";
};

const convertTo24Hour = (time) => {
  if (!time) return "";

  const [hourMin, modifier] =
    time.match(/(\d{1,2}:\d{2})(AM|PM)/i)?.slice(1) || [];
  if (!hourMin) return time; // already correct

  let [hours, minutes] = hourMin.split(":");

  if (modifier.toUpperCase() === "PM" && hours !== "12") {
    hours = String(Number(hours) + 12);
  }
  if (modifier.toUpperCase() === "AM" && hours === "12") {
    hours = "00";
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
};

const splitTime = (value) => {
  if (!value) return ["", ""];

  const [inTime, outTime] = value.split(" To ");

  return [convertTo24Hour(inTime), convertTo24Hour(outTime)];
};

export default function OfficeShiftForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  // const [company, setCompany] = useState("");
  const DEFAULT_COMPANY_ID = "1"; // 👈 your fixed company

  const [company, setCompany] = useState(DEFAULT_COMPANY_ID);
  const [shift, setShift] = useState("");

  const [days, setDays] = useState({
    Monday: { in: "", out: "" },
    Tuesday: { in: "", out: "" },
    Wednesday: { in: "", out: "" },
    Thursday: { in: "", out: "" },
    Friday: { in: "", out: "" },
    Saturday: { in: "", out: "" },
    Sunday: { in: "", out: "" },
  });

  useEffect(() => {
    if (editData) {
      setCompany(DEFAULT_COMPANY_ID);
      setShift(editData.Shift || "");

      const parse = (val) => {
        if (!val || !val.includes("To")) return { in: "", out: "" };

        const [inTime, outTime] = val.split(" To ");

        return {
          in: formatTimeForInput(inTime),
          out: formatTimeForInput(outTime),
        };
      };

      setDays({
        Monday: parse(editData.Monday),
        Tuesday: parse(editData.Tuesday),
        Wednesday: parse(editData.Wednesday),
        Thursday: parse(editData.Thursday),
        Friday: parse(editData.Friday),
        Saturday: parse(editData.Saturday),
        Sunday: parse(editData.Sunday),
      });
    }
  }, [editData]);

  const handleTimeChange = (day, type, value) => {
    setDays((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    // ✅ VALIDATION HERE
    if (!company || !shift) {
      alert("Company and Shift are required");
      return;
    }

    for (const [day, time] of Object.entries(days)) {
      if (time.in) {
        const [h, m] = time.in.split(":").map(Number);
        if (h > 24 || m > 60) {
          alert(`Invalid 'In' time for ${day} (${time.in}). Hours <= 24, Minutes <= 60.`);
          return;
        }
      }
      if (time.out) {
        const [h, m] = time.out.split(":").map(Number);
        if (h > 24 || m > 60) {
          alert(`Invalid 'Out' time for ${day} (${time.out}). Hours <= 24, Minutes <= 60.`);
          return;
        }
      }
    }

    const payload = {
      company_id: company,
      shift_name: shift,

      ...Object.fromEntries(
        Object.entries(days).flatMap(([day, time]) => [
          [`${day.toLowerCase()}_in`, time.in || null],
          [`${day.toLowerCase()}_out`, time.out || null],
        ]),
      ),
    };

    console.log("Final Payload:", payload);

    try {
      if (editData) {
        await api.put(`/api/office-shifts/${editData.id}`, payload);
        alert("Updated successfully");
      } else {
        await api.post("/api/office-shifts", payload);
        alert("Created successfully");
      }

      navigate("/organization/OfficeShift");
    } catch (error) {
      console.error("Error:", error);
      alert("Operation failed");
    }
  };
  return (
    <section>
      <Card body>
        <h4 className="mb-4">
          {editData ? "Edit Office Shift" : "Add Office Shift"}
        </h4>

        {/* Company & Shift */}
        <Row className="mb-3">
          {/* <Col md={6}>
            <Form.Label>Company *</Form.Label>
            <Form.Select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">Select Company</option>
           <option value="1">HR1</option>
<option value="2">Aarya Trans Solutions Pune</option>
            </Form.Select>
          </Col> */}

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
                onChange={(e) => handleTimeChange(day, "in", e.target.value)}
              />
            </Col>

            <Col md={4}>
              <Form.Control
                type="time"
                value={days[day].out}
                onChange={(e) => handleTimeChange(day, "out", e.target.value)}
              />
            </Col>
          </Row>
        ))}

        {/* Submit */}
        <div className="text-center mt-4">
          <Button
            style={{
              backgroundColor: "#663399",
              border: "none",
              width: "300px",
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
