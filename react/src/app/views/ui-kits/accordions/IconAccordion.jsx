import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";

export default function IconAccordion() {
  const iconList = ["i-Big-Data", "i-Data-Settings", "i-Library"];

  return (
    <Card>
      <Card.Body>
        <Card.Title>With Icons</Card.Title>

        <Accordion>
          {iconList.map((icon, index) => (
            <Accordion.Item key={icon} icon={icon} eventKey={index}>
              <Accordion.Header as="div">
                <div className="card-title mb-0 text-primary">
                  {icon ? <i className={`${icon} me-2 text-15`} /> : null}
                  Accordion asd Item
                </div>
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
