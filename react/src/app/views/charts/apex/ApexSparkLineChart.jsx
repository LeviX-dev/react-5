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
  options8,
  options9,
  options10,
  options11
} from "./apexSparkLineOptions";

export default function ApexSparkLineChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Spark Line Chart" }
        ]}
      />

      <Row>
        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options1} series={options1.series} type={options1.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options2} series={options2.series} type={options2.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options3} series={options3.series} type={options3.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options4} series={options4.series} type={options4.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options5} series={options5.series} type={options5.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options6} series={options6.series} type={options6.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options7} series={options7.series} type={options7.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options8} series={options8.series} type={options8.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options9} series={options9.series} type={options9.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options10} series={options10.series} type={options10.chart.type} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body className="h-100">
            <Chart options={options11} series={options11.series} type={options11.chart.type} />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
