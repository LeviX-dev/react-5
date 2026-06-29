import Chart from "react-apexcharts";
import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

import { options1, options2 } from "./apexBubbleChartOptions";

export default function ApexBubbleChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Bubble" }
        ]}
      />

      <Row>
        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Simple Bubble</Card.Title>
            <Chart options={options1} series={options1.series} type={options1.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>3D Bubble Chart</Card.Title>
            <Chart options={options2} series={options2.series} type={options2.chart.type} />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
