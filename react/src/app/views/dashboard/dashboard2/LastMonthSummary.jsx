import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import DoughnutChart from "app/views/charts/echarts/Doughnut";

const LAST_MONTH_SUMMARY = [
  { name: "Portable Speaker", value: "+ $1200", status: "primary" },
  { name: "Portable Headphone", value: "In Stock", status: "success" },
  { name: "Speaker", value: "Out of Stock", status: "danger" },
  { name: "Watch", value: "Low Stock", status: "warning" }
];

export default function LastMonthSummary() {
  return (
    <Col lg={6}>
      <Card className="card-body mb-4">
        <Card.Title>Last Month Summary</Card.Title>

        <Row>
          <Col lg={6}>
            <Table>
              <thead className="table-dark">
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>

              <tbody>
                {LAST_MONTH_SUMMARY.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td className={`text-right text-${item.status}`}>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>

          <Col lg={6}>
            <DoughnutChart height="200px" />
          </Col>
        </Row>
      </Card>
    </Col>
  );
}
