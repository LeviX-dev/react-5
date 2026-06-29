import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import LineChart4 from "app/views/charts/echarts/LineChart4";

export default function Sales() {
  return (
    <Col lg={6}>
      <Card className="mb-4">
        <Card.Body className="p-0">
          <Card.Title className="mb-0 p-3">Sales</Card.Title>
          <LineChart4 height="270px" />
        </Card.Body>
      </Card>
    </Col>
  );
}
