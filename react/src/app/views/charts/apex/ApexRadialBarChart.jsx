import Chart from "react-apexcharts";
import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import {
  options1,
  options2,
  options3,
  options4,
  options5,
  options6
} from "./apexRadialBarChartOptions";

export default function ApexRadialBarChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Radial Bar Chart" }
        ]}
      />

      <Row>
        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Simple Radial Bar</Card.Title>
            <Chart options={options1} series={options1.series} type={options1.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Multiple Radial Bar</Card.Title>
            <Chart options={options2} series={options2.series} type={options2.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Custom Angle Circle Chart</Card.Title>
            <Chart options={options3} series={options3.series} type={options3.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Gradient Radial Bar</Card.Title>
            <Chart options={options4} series={options4.series} type={options4.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Radialbars with Image</Card.Title>
            <Chart options={options5} series={options5.series} type={options5.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Stroked Angular Gauge</Card.Title>
            <Chart options={options6} series={options6.series} type={options6.chart.type} />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
