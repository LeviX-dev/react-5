import Chart from "react-apexcharts";
import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

import {
  options1,
  options2,
  options3,
  options4,
  options5,
  options6,
  options7,
  options8
} from "./apexLineChartOptions";

export default function ApexLineChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Line Chart" }
        ]}
      />

      <Row>
        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Basic line chart(Product Trends by Month)</Card.Title>
            <Chart options={options1} series={options1.series} type={options1.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Line with data Label(Average High & Low Temperature)</Card.Title>
            <Chart options={options2} series={options2.series} type={options2.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Zoomable timeseries chart(Stock Price Movement)</Card.Title>
            <Chart options={options3} series={options3.series} type={options3.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Gradient Line Chart(Social Media)</Card.Title>
            <Chart options={options4} series={options4.series} type={options4.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Real time Line chart(Dynamic Updating Chart)</Card.Title>
            <Chart options={options5} series={options5.series} type={options5.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Dashed Line Chart(Page Statistics)</Card.Title>
            <Chart options={options6} series={options6.series} type={options6.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Brush Line Chart</Card.Title>
            <Chart options={options7} series={options7.series} type={options7.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Dashed Line Chart</Card.Title>
            <Chart options={options8} series={options8.series} type={options8.chart.type} />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
