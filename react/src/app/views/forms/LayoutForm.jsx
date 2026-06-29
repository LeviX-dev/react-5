import {
  Col,
  Row,
  Form,
  Card,
  Stack,
  Dropdown,
  FormLabel,
  FormGroup,
  FormControl
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function LayoutForm() {
  return (
    <section>
      <Breadcrumb routeSegments={[{ name: "Forms", path: "/forms" }, { name: "Layout Form" }]} />

      <Row>
        <Col lg={6} xs={12}>
          <h4>Horizontal Layout</h4>
          <p>A form control layout using row to create horizontal alignment.</p>

          <Card body className="mb-5">
            <Row>
              <Col md={5}>
                <FormControl type="text" placeholder="Enter your username" />
              </Col>

              <Col md={5} className="mt-3 mt-md-0">
                <FormControl type="password" placeholder="Enter your password" />
              </Col>

              <Col md={2} className="mt-3 mt-md-0">
                <button className="btn btn-primary w-100">Sign In</button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <div className="border-top mb-5" />

      <Row>
        <Col lg={6} xs={12}>
          <h4>Verticle Layout</h4>
          <p>A form control layout using flex to create verticle alignment.</p>

          <Card body className="mb-5">
            <Stack gap={3}>
              <FormGroup controlId="username">
                <FormLabel>Username</FormLabel>
                <FormControl size="lg" type="text" placeholder="Enter your username" />
              </FormGroup>

              <FormGroup controlId="password">
                <FormLabel>Password</FormLabel>
                <FormControl size="lg" type="password" placeholder="Enter your password" />
              </FormGroup>

              <button className="btn btn-primary pd-x-20">Sign In</button>
            </Stack>
          </Card>
        </Col>
      </Row>

      <div className="border-top mb-5" />

      <Row>
        <Col md={6}>
          <h4>Left Label Alignment</h4>
          <p>A form control layout using row with left label alignment.</p>

          <Card body className="mb-5">
            <form>
              <Stack gap={4}>
                <FormGroup controlId="email">
                  <Row>
                    <Col sm={2}>
                      <FormLabel>Email</FormLabel>
                    </Col>

                    <Col sm={10}>
                      <FormControl type="email" placeholder="Email" />
                    </Col>
                  </Row>
                </FormGroup>

                <FormGroup controlId="password">
                  <Row>
                    <Col sm={2}>
                      <FormLabel>Password</FormLabel>
                    </Col>

                    <Col sm={10}>
                      <FormControl type="email" placeholder="Email" />
                    </Col>
                  </Row>
                </FormGroup>

                <FormGroup>
                  <Row>
                    <Col sm={2}>
                      <FormLabel>Radios</FormLabel>
                    </Col>

                    <Col sm={10}>
                      <Form.Check type="radio" label="First radio" />
                      <Form.Check type="radio" label="Second radio" />
                      <Form.Check disabled type="radio" label="Disabled radio" />
                    </Col>
                  </Row>
                </FormGroup>

                <FormGroup>
                  <Row>
                    <Col sm={2}>
                      <FormLabel>Checkbox</FormLabel>
                    </Col>

                    <Col sm={10}>
                      <Form.Check type="checkbox" label="Example" />
                      <Form.Check disabled type="checkbox" label="Disabled checkbox" />
                    </Col>
                  </Row>
                </FormGroup>

                <div>
                  <button type="submit" className="btn btn-primary">
                    Sign in
                  </button>
                </div>
              </Stack>
            </form>
          </Card>
        </Col>
      </Row>

      <div className="border-top mb-5" />

      <Row>
        <Col md={6}>
          <h4>Form Inside Dropdown</h4>
          <p>A form group layout inside dropdown</p>

          <div className="btn-group">
            <Dropdown style={{ width: 400 }}>
              <Dropdown.Toggle>Download File</Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu bg-transparent shadow-none p-0 m-0">
                <Card body>
                  <Card.Title className="mb-1">Please Sign In First</Card.Title>
                  <p>Lorem ipsum dolor sit amet.</p>

                  <Stack gap={3}>
                    <FormGroup>
                      <FormControl type="text" placeholder="Enter your username" />
                    </FormGroup>

                    <FormGroup>
                      <FormControl type="password" placeholder="Enter your password" />
                    </FormGroup>

                    <button className="btn btn-primary pd-x-20">Sign In</button>
                  </Stack>
                </Card>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>
    </section>
  );
}
