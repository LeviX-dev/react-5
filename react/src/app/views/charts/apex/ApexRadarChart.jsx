import Chart from "react-apexcharts";
import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { options1, options2, options3 } from "./apexRadarChartOptions";

export default function ApexRadarChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Radar Chart" }
        ]}
      />

      <Row>
        <Col lg={6} md={6} sm={12} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Basic Radar Chart</Card.Title>
            <Chart options={options1} series={options1.series} type={options1.chart.type} />
          </Card>
        </Col>

        <Col lg={6} md={6} sm={12} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Radar – Multiple Series</Card.Title>
            <Chart options={options2} series={options2.series} type={options2.chart.type} />
          </Card>
        </Col>

        <Col lg={6} md={6} sm={12} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Radar with Polygon-fill</Card.Title>
            <Chart options={options3} series={options3.series} type={options3.chart.type} />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
