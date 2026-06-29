import Chart from "react-apexcharts";
import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { options1, options2, options3, options4, options5, options6 } from "./apexBarChartOptions";

export default function ApexBarChart() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Charts", path: "/charts" },
          { name: "Apex", path: "/apex" },
          { name: "Bar Chart" }
        ]}
      />

      <Row>
        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Basic Bar Chart</Card.Title>
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
            <Card.Title>Stacked Bars(Fiction Books Sales)</Card.Title>
            <Chart options={options3} series={options3.series} type={options3.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Bar with Negative Values(Mauritius population pyramid 2011)</Card.Title>
            <Chart options={options4} series={options4.series} type={options4.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Custom DataLabels Bar</Card.Title>
            <Chart options={options5} series={options5.series} type={options5.chart.type} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Patterned Bar(Compare Sales Strategy)</Card.Title>
            <Chart options={options6} series={options6.series} type={options6.chart.type} />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
