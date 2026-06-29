import Chart from "react-apexcharts";
import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

import { options1, options2, options3, options4 } from "./apexMixChartOptions";
import { options1 as candleStickOption } from "./apexCandleStickChartOptions";

export default function ApexMixChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Mix Chart" }
        ]}
      />

      <Row>
        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Line Column (Traffic Sources)</Card.Title>
            <Chart options={options1} series={options1.series} type={options1.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Grouped Bar</Card.Title>
            <Chart options={options2} series={options2.series} type={options2.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Multiple Y-Axis(XYZ - Stock Analysis (2009 - 2016))</Card.Title>
            <Chart options={options3} series={options3.series} type={options3.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Line & Area(Team A VS Team B)</Card.Title>
            <Chart options={options4} series={options4.series} type={options4.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Line Column Area</Card.Title>
            <Chart
              options={candleStickOption}
              series={candleStickOption.series}
              type={candleStickOption.chart.type}
            />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
