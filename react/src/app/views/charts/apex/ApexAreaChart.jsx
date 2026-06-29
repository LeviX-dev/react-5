import Chart from "react-apexcharts";
import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

import {
  bAOptions1,
  bAOptions2,
  bAOptions3,
  bAOptions4,
  bAOptions5,
  bAOptions6
} from "./apexAreaChartOptions";

export default function ApexAreaChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Area Chart" }
        ]}
      />
      <Row>
        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Basic Area chart(Fundamental Analysis of Stocks)</Card.Title>
            <Chart options={bAOptions1} series={bAOptions1.series} type={bAOptions1.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Spline Area</Card.Title>
            <Chart options={bAOptions2} series={bAOptions2.series} type={bAOptions2.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Datetime X-axis</Card.Title>
            <Chart options={bAOptions3} series={bAOptions3.series} type={bAOptions3.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Area with Negative Values</Card.Title>
            <Chart options={bAOptions4} series={bAOptions4.series} type={bAOptions4.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Stacked Area Chart</Card.Title>
            <Chart options={bAOptions5} series={bAOptions5.series} type={bAOptions5.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Missing / Null values Area Chart(Network Monitoring)</Card.Title>
            <Chart options={bAOptions6} series={bAOptions6.series} type={bAOptions6.chart.type} />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
