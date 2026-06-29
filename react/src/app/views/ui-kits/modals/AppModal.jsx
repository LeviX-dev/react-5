import { Card, Col, Row } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import BasicModal from "./BasicModal";
import ScrollableModal from "./ScrollableModal";

export default function AppModal() {
  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Modals" }]} />

      <Row className="mb-4">
        <Col md={6}>
          <Card body className="mb-4">
            <Card.Title>Basic Modal</Card.Title>
            <BasicModal />
          </Card>
        </Col>

        <Col md={6}>
          <Card body className="mb-4">
            <Card.Title>Vertically Centered Modal</Card.Title>
            <BasicModal centered={true} name="Launch centered modal" />
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card body className="mb-4">
            <Card.Title>Optional sizes</Card.Title>
            <div className="d-flex flex-wrap flex-row gap-2">
              <div>
                <BasicModal size="sm" name="Launch small modal" />
              </div>

              <div>
                <BasicModal size="lg" name="Launch large modal" />
              </div>

              <div>
                <BasicModal size="xl" name="Launch extra large modal" />
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6}>
          <Card body className="mb-4">
            <Card.Title>Scrollable Modal</Card.Title>
            <ScrollableModal />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
