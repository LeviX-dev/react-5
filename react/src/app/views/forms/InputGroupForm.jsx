import { Card, Col, FormControl, InputGroup, Row } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function InputGroupForm() {
  return (
    <div>
      <Breadcrumb
        routeSegments={[{ name: "Forms", path: "/forms" }, { name: "Input Group Form" }]}
      />

      <Row>
        <Col md={6}>
          <Card body className="mb-4">
            <Card.Title>Basic Example</Card.Title>

            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
              <FormControl type="text" placeholder="Username" />
            </InputGroup>

            <InputGroup className="mb-3">
              <FormControl type="text" placeholder="Recipient's username" />
              <InputGroup.Text id="basic-addon1">@example.com</InputGroup.Text>
            </InputGroup>

            <label htmlFor="basic-url">Your vanity URL</label>

            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">https://example.com/users/</InputGroup.Text>
              <FormControl type="text" className="form-control" id="basic-url" />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text>$</InputGroup.Text>
              <FormControl type="text" className="form-control" />
              <InputGroup.Text>.00</InputGroup.Text>
            </InputGroup>

            <InputGroup>
              <InputGroup.Text>With textarea</InputGroup.Text>
              <textarea className="form-control" aria-label="With textarea" />
            </InputGroup>
          </Card>
        </Col>

        <Col md={6}>
          <Card body>
            <Card.Title>File inputs</Card.Title>

            <InputGroup className="mb-3">
              {/* <InputGroup.Text htmlFor="inputGroupFile01">Upload</InputGroup.Text> */}
              <FormControl type="file" id="inputGroupFile01" />
            </InputGroup>

            <InputGroup className="mb-3">
              <FormControl type="file" id="inputGroupFile02" />
              <InputGroup.Text htmlFor="inputGroupFile02">Upload</InputGroup.Text>
            </InputGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
