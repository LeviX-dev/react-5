import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import LineChart3 from "app/views/charts/echarts/LineChart3";

export default function LastDaysLead() {
  return (
    <Col xs={12}>
      <Card className="mb-4">
        <Card.Title as="h3" className="mb-0 p-4">
          Last 20 Days Attendance Trend
        </Card.Title>
        <Card.Body>
          <LineChart3 height="360px" />
        </Card.Body>
      </Card>
    </Col>
  );
}