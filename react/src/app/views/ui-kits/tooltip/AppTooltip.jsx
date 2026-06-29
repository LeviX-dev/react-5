import { OverlayTrigger, Tooltip, Button, Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppTooltip() {
  const variantList = ["primary", "success", "info", "warning"];

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Tooltip" }]} />

      <Row className="mb-4">
        <Col xs={12} className="mb-4">
          <Card body>
            <Card.Title>Basic Tooltips</Card.Title>
            <Card.Text className="pt-0 mt-0">
              Hover over the buttons below to see the four tooltips directions: top, right, bottom,
              and left.
            </Card.Text>

            <Row>
              {["top", "right", "bottom", "left"].map((placement, i) => (
                <Col md={3} key={placement}>
                  <OverlayTrigger
                    placement={placement}
                    overlay={
                      <Tooltip id={`tooltip-${placement}`}>
                        Tooltip on <strong>{placement}</strong>.
                      </Tooltip>
                    }>
                    <Button variant={variantList[i]}>Tooltip on {placement}</Button>
                  </OverlayTrigger>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12} className="mb-4">
          <Card body>
            <Card.Title>Tooltips Trigger</Card.Title>
            <Card.Text className="pt-0 mt-0">Click to show tooltip</Card.Text>

            <Row>
              {["top", "right", "bottom", "left"].map((placement, i) => (
                <Col md={3} key={placement}>
                  <OverlayTrigger
                    trigger="click"
                    placement={placement}
                    overlay={
                      <Tooltip id={`tooltip-${placement}`}>
                        Tooltip on <strong>{placement}</strong>.
                      </Tooltip>
                    }>
                    <Button variant={variantList[i]}>Tooltip on {placement}</Button>
                  </OverlayTrigger>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12} className="mb-4">
          <Card body>
            <Card.Title>Tooltip Options</Card.Title>

            <Row>
              {["top", "right", "bottom", "left"].map((placement, i) => (
                <Col md={3} key={placement}>
                  <OverlayTrigger
                    placement={placement}
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip id={`tooltip-${placement}`}>
                        Tooltip on <strong>{placement}</strong>.
                      </Tooltip>
                    }>
                    <Button variant={variantList[i]}>Tooltip on {placement}</Button>
                  </OverlayTrigger>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
