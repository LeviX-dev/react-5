import ReactEcharts from "echarts-for-react";
import { Row, Col, Card } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

import {
  echartBarOption,
  echartPieOption,
  echartBasicLineOption,
  echartMultilineOption,
  echartBasicBarOption,
  echartMultipleBarOption,
  echartMultipleBar2Option,
  echartZoomBarOption,
  echartBasicDoughnutOption,
  echartBasicAreaOption,
  echartStackedAreaOption,
  echartStackedPieOption,
  echartSolidAreaOption,
  echartBasicPie,
  echartBubbleOption
} from "./echartOptions";

export default function AppEchart() {
  return (
    <div className="m-sm-30">
      <Breadcrumb routeSegments={[{ name: "Charts", path: "/charts" }, { name: "Echarts" }]} />

      <Row>
        <Col md={8} xs={12} className="mb-4">
          <Card body>
            <Card.Title>This Year Sales</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartBarOption} />
          </Card>
        </Col>

        <Col md={4} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Sales by Countries</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartPieOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Basic Line</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartBasicLineOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Multi Line</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartMultilineOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Basic Bar chart</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartBasicBarOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Multiple Bar chart</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartMultipleBarOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Multiple Bar chart 2</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartMultipleBar2Option} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Zoom Bar</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartZoomBarOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Basic Doughnut</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartBasicDoughnutOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Basic Area Chart</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartBasicAreaOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Stacked Area Chart</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartStackedAreaOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Stacked Area Chart with Pointer</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartStackedPieOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Solid Area</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartSolidAreaOption} />
          </Card>
        </Col>

        <Col lg={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Basic Pie Chart</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartBasicPie} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Stacked Pie Chart</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartStackedPieOption} />
          </Card>
        </Col>

        <Col md={6} xs={12} className="mb-4">
          <Card body>
            <Card.Title>Bubble Chart</Card.Title>
            <ReactEcharts style={{ height: "280px" }} option={echartBubbleOption} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
