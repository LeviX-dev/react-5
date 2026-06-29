import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

import RadarChart from "./RadarChart";
import StackedPolarBar from "./StackedPolarBar";
import CircularProgressBar from "./CircularProgressBar";
import VictoryAreaAnimation from "./VictoryAreaAnimation";
import AlternativeEventsChart from "./AlternativeEvents";
import CustomTooltipLableChart from "./CustomTooltipLabelChart";

export default function AppVictoryChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[{ name: "Charts", path: "/charts" }, { name: "Victory Charts" }]}
      />

      <Row>
        <Col xl={4} md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Circular Progress Bar</Card.Title>
            <CircularProgressBar />
          </Card>
        </Col>

        <Col xl={4} md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Stacked Polar Bar</Card.Title>
            <StackedPolarBar />
          </Card>
        </Col>

        <Col xl={4} md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Victory Radar Chart</Card.Title>
            <RadarChart />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Area Animation Chart</Card.Title>
            <VictoryAreaAnimation />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Alternative Events Chart</Card.Title>
            <AlternativeEventsChart />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Custom Tooltip Label</Card.Title>
            <CustomTooltipLableChart />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
