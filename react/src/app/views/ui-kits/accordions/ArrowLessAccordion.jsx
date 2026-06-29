import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";

export default function ArrowLessAccordion() {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Without Arrow Icon</Card.Title>

        <Accordion>
          {[1, 2, 3].map((item, index) => (
            <Accordion.Item key={index} eventKey={item}>
              <Accordion.Header as="div" className="hide-arrow">
                <h6 className="card-title mb-0 text-primary">Accordion asd Item #{item}</h6>
              </Accordion.Header>

              <Accordion.Body>
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry
                richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor
                brunch.
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Body>
    </Card>
  );
}
