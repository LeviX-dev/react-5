import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";

const CARDS = [
  { icon: "i-Data-Download", subtitle: "Today's Upload", title: "21" },
  { icon: "i-Add-User", subtitle: "new users", title: "53" },
  { icon: "i-Money-2", subtitle: "total sales", title: "4031" },
  { icon: "i-Money-2", title: "4031" },
  { icon: "i-Gear", title: "4031" },
  { icon: "i-Bell", title: "4031" }
];

export default function ActivityCards() {
  return (
    <Col md={6}>
      <Row>
        {CARDS.map((card, index) => (
          <Col md={4} key={index}>
            <Card className="card-icon-big mb-4">
              <Card.Body className="text-center">
                <i className={card.icon} />
                <p className="text-muted mt-2 mb-0 text-capitalize">{card.subtitle}</p>
                <p className="lead mt-2 mb-0 text-capitalize">{card.title}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Col>
  );
}
