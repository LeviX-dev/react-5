import { Card, Col, Row } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

import StepSlider from "./StepSlider";
import MarkSlider from "./MarkSlider";
import RangeSlider from "./RangeSlider";
import BasicSlider from "./BasicSlider";
import MinMaxSlider from "./MinMaxSlider";
import VerticalSlider from "./VerticalSlider";
import MultiRangeSlider from "./MultiRangeSlider";
import MultiStyledSlider from "./MultiStyledSlider";

export default function AppSlider() {
  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Sliders" }]} />

      <Row>
        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Basic Slider</Card.Title>
            <BasicSlider />
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Range Slider</Card.Title>
            <RangeSlider />
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Step Slider</Card.Title>
            <StepSlider />
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Mark Slider with Fixed Values</Card.Title>
            <MarkSlider />
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Slider with Minimum and Maximum</Card.Title>
            <MinMaxSlider />
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Multi Range Slider</Card.Title>
            <MultiRangeSlider />
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Multi Range Slider with Style</Card.Title>
            <MultiStyledSlider />
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Vertical Slider</Card.Title>
            <VerticalSlider />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
