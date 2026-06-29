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
} from "./apexDoughnutChartOptions";

export default function ApexDoughnutChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Doughnut Chart" }
        ]}
      />

      <Row>
        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Simple Pie</Card.Title>
            <Chart options={options1} series={options1.series} type={options1.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Simple Donut</Card.Title>
            <Chart options={options2} series={options2.series} type={options2.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Monochrome Pie(Number of leads)</Card.Title>
            <Chart options={options3} series={options3.series} type={options3.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Gradient Donut</Card.Title>
            <Chart options={options4} series={options4.series} type={options4.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Donut with Pattern(Favorite Movie Type)</Card.Title>
            <Chart options={options5} series={options5.series} type={options5.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Pie with Image</Card.Title>
            <Chart options={options6} series={options6.series} type={options6.chart.type} />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
