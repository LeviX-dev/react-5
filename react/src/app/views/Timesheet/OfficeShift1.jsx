import { Row, Col, Card, Button, Form } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function OfficeShiftCreate() {
  return (
    <section>
      {/* Breadcrumb */}
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Timesheets" },
          { name: "Add Office Shift" }
        ]}
      />

      {/* Form Card */}
      <Card body>
        <p className="text-muted mb-4">
          The field labels marked with * are required input fields.
        </p>

        <Form>
          {/* Company & Shift */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Label>Company *</Form.Label>
              <Form.Select>
                <option>Select Company...</option>
                <option>HR1</option>
                <option>Aarya Trans Solutions Pune</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Shift *</Form.Label>
              <Form.Control placeholder="shift name" />
            </Col>
          </Row>

          {/* Monday */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Monday</Form.Label>
              <Form.Control placeholder="In Time" />
            </Col>
            <Col md={6}>
              <Form.Label>&nbsp;</Form.Label>
              <Form.Control placeholder="Out Time" />
            </Col>
          </Row>

          {/* Tuesday */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Tuesday</Form.Label>
              <Form.Control placeholder="In Time" />
            </Col>
            <Col md={6}>
              <Form.Label>&nbsp;</Form.Label>
              <Form.Control placeholder="Out Time" />
            </Col>
          </Row>

          {/* Wednesday */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Wednesday</Form.Label>
              <Form.Control placeholder="In Time" />
            </Col>
            <Col md={6}>
              <Form.Label>&nbsp;</Form.Label>
              <Form.Control placeholder="Out Time" />
            </Col>
          </Row>

          {/* Thursday */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Thursday</Form.Label>
              <Form.Control placeholder="In Time" />
            </Col>
            <Col md={6}>
              <Form.Label>&nbsp;</Form.Label>
              <Form.Control placeholder="Out Time" />
            </Col>
          </Row>

          {/* Friday */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Friday</Form.Label>
              <Form.Control placeholder="In Time" />
            </Col>
            <Col md={6}>
              <Form.Label>&nbsp;</Form.Label>
              <Form.Control placeholder="Out Time" />
            </Col>
          </Row>

          {/* Saturday */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Saturday</Form.Label>
              <Form.Control placeholder="In Time" />
            </Col>
            <Col md={6}>
              <Form.Label>&nbsp;</Form.Label>
              <Form.Control placeholder="Out Time" />
            </Col>
          </Row>

          {/* Sunday */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Label>Sunday</Form.Label>
              <Form.Control placeholder="In Time" />
            </Col>
            <Col md={6}>
              <Form.Label>&nbsp;</Form.Label>
              <Form.Control placeholder="Out Time" />
            </Col>
          </Row>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              style={{
                backgroundColor: "#f7b500",
                border: "none",
                padding: "10px 90px"
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
