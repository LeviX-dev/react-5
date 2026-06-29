import { Button, Popover, OverlayTrigger, Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

const popover = (props) => (
  <Popover id="popover-basic" {...props}>
    <Popover.Header as="h3">Popover right</Popover.Header>
    <Popover.Body>
      And here's some <strong>amazing</strong> content. It's very engaging. right?
    </Popover.Body>
  </Popover>
);

export default function AppPopover() {
  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Popover" }]} />

      <Row>
        <Col xs={12}>
          <Card body className="mb-4">
            <Card.Title>Example</Card.Title>

            <OverlayTrigger trigger="click" placement="right" overlay={popover}>
              <Button className="text-white" variant="danger">
                Click to toggle popover
              </Button>
            </OverlayTrigger>
          </Card>
        </Col>

        <Col xs={12}>
          <Card body className="mb-4">
            <Card.Title>Four Directions</Card.Title>
            <Card.Text>Four options are available: top, right, bottom, and left aligned.</Card.Text>

            {["top", "right", "bottom", "left", "auto"].map((dir) => (
              <OverlayTrigger key={dir} trigger="click" placement={dir} overlay={popover}>
                <Button className="me-2">Popover on {dir}</Button>
              </OverlayTrigger>
            ))}
          </Card>
        </Col>

        <Col xs={12}>
          <Card body className="mb-4">
            <Card.Title>Hover with Auto Dismiss</Card.Title>

            <OverlayTrigger
              trigger="hover"
              placement="right"
              overlay={popover}
              delay={{ show: 250, hide: 400 }}>
              <Button className="text-white" variant="danger">
                Dismissible popover
              </Button>
            </OverlayTrigger>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
