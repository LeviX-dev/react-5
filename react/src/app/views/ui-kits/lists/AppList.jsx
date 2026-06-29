import { Link } from "react-router-dom";
import { Tab, Nav, Row, Col, Card, ListGroup } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppList() {
  const randomText = `Cupidatat quis ad sint excepteur laborum in esse qui. Et
  excepteur consectetur ex nisi eu do cillum ad laborum.
  Mollit et eu officia dolore sunt Lorem culpa qui commodo
  velit ex amet id ex. Officia anim incididunt laboris
  deserunt anim aute dolor incididunt veniam aute dolore
  do exercitation. Dolor nisi culpa ex ad irure in elit eu
  dolore. Ad laboris ipsum reprehenderit irure non commodo
  excepteur consectetur ex nisi eu do cillum ad laborum.
  Mollit et eu officia dolore sunt Lorem culpa qui commodo
  velit ex amet id ex. Officia anim incididunt laboris
  deserunt anim aute dolor incididunt veniam aute dolore
  do exercitation. Dolor nisi culpa ex ad irure in elit eu
  dolore. Ad laboris ipsum reprehenderit irure non commodo
  enim culpa commodo veniam incididunt veniam ad.`;

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Lists" }]} />

      <Row className="mb-4">
        <Col md={6}>
          <p>
            List groups are a flexible and powerful component for displaying a series of content.
            Modify and extend them to support just about any content within.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">Basic example</Card.Title>
            <Card.Text>
              The most basic list group is an unordered list with list items and the proper classes.
            </Card.Text>

            <ListGroup>
              <ListGroup.Item>Cras justo odio</ListGroup.Item>
              <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
              <ListGroup.Item>Morbi leo risus</ListGroup.Item>
              <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
              <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">Basic example with Active items</Card.Title>
            <Card.Text>
              Add .active to a .list-group-item to indicate the current active selection.
            </Card.Text>

            <ListGroup>
              <ListGroup.Item active>Cras justo odio</ListGroup.Item>
              <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
              <ListGroup.Item>Morbi leo risus</ListGroup.Item>
              <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
              <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">Basic example with Disabled items</Card.Title>
            <Card.Text>Add .disabled to a .list-group-item to make it appear disabled</Card.Text>
            <ListGroup>
              <ListGroup.Item disabled>Cras justo odio</ListGroup.Item>
              <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
              <ListGroup.Item>Morbi leo risus</ListGroup.Item>
              <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
              <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">Links</Card.Title>
            <Card.Text>
              Use <code>'anchor tag'</code> to create actionable list group items with hover,
              disabled, and active states by adding .list-group-item-action{" "}
              <span className="text-warning">
                Be sure to not use the standard .btn classes here.
              </span>
            </Card.Text>

            <ListGroup>
              <ListGroup.Item action active>
                Cras justo odio
              </ListGroup.Item>
              <ListGroup.Item action>Dapibus ac facilisis in</ListGroup.Item>
              <ListGroup.Item action>Morbi leo risus</ListGroup.Item>
              <ListGroup.Item action>Porta ac consectetur ac</ListGroup.Item>
              <ListGroup.Item action>Vestibulum at eros</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">Flush</Card.Title>
            <Card.Text>
              Add .list-group-flush to remove some borders and rounded corners to render list group
              items edge-to-edge in a parent container
            </Card.Text>

            <ListGroup variant="flush">
              <ListGroup.Item>Cras justo odio</ListGroup.Item>
              <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
              <ListGroup.Item>Morbi leo risus</ListGroup.Item>
              <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
              <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">Contextual classes</Card.Title>
            <Card.Text>
              Use contextual classes to style list items with a stateful background and color
            </Card.Text>
            <ListGroup>
              <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
              <ListGroup.Item variant="primary">A simple primary list group item</ListGroup.Item>
              <ListGroup.Item variant="secondary">
                A simple secondary list group item
              </ListGroup.Item>
              <ListGroup.Item variant="success">A simple success list group item</ListGroup.Item>
              <ListGroup.Item variant="danger">A simple danger list group item</ListGroup.Item>
              <ListGroup.Item variant="warning">A simple warning list group item</ListGroup.Item>
              <ListGroup.Item variant="info">A simple info list group item</ListGroup.Item>
              <ListGroup.Item variant="light">A simple light list group item</ListGroup.Item>
              <ListGroup.Item variant="dark">A simple dark list group item</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">Contextual Action</Card.Title>
            <Card.Text>
              Contextual classes also work with .list-group-item-action. Note the addition of the
              hover styles here not present in the previous example. Also supported is the .active
              state; apply it to indicate an active selection on a contextual list group item.
            </Card.Text>

            <ListGroup>
              <ListGroup.Item action as={Link} to="/">
                Dapibus ac facilisis in
              </ListGroup.Item>

              <ListGroup.Item action as={Link} to="/" variant="primary">
                A simple primary list group item
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/" variant="secondary">
                A simple secondary list group item
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/" variant="success">
                A simple success list group item
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/" variant="danger">
                A simple danger list group item
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/" variant="danger">
                A simple warning list group item
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/" variant="info">
                A simple info list group item
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/" variant="light">
                A simple light list group item
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/" variant="dark">
                A simple dark list group item
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">List With Badges</Card.Title>
            <Card.Text>
              Add .list-group-flush to remove some borders and rounded corners to render list group
              items edge-to-edge in a parent container
            </Card.Text>

            <ListGroup as="ol">
              <ListGroup.Item as="li" className="d-flex justify-content-between align-items-center">
                Cras justo odio
                <span className="badge bg-primary badge-pill">4</span>
              </ListGroup.Item>
              <ListGroup.Item as="li" className="d-flex justify-content-between align-items-center">
                Dapibus ac facilisis in
                <span className="badge bg-info badge-pill">2</span>
              </ListGroup.Item>
              <ListGroup.Item as="li" className="d-flex justify-content-between align-items-center">
                Morbi leo risus
                <span className="badge bg-success badge-pill">1</span>
              </ListGroup.Item>
              <ListGroup.Item as="li" className="d-flex justify-content-between align-items-center">
                Morbi leo risus
                <span className="badge bg-warning badge-pill">1</span>
              </ListGroup.Item>
              <ListGroup.Item as="li" className="d-flex justify-content-between align-items-center">
                Morbi leo risus
                <span className="badge bg-danger badge-pill">1</span>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">Custom content</Card.Title>
            <Card.Text>
              Add nearly any HTML within, even for linked list groups like the one below, with the
              help of flexbox utilities.
            </Card.Text>

            <ListGroup>
              <ListGroup.Item action active className="flex-column align-items-start">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1 text-white">List group item heading</h5>
                  <small>3 days ago</small>
                </div>

                <p className="mb-1">
                  Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                  varius blandit.
                </p>

                <small className="text-white">Donec id elit non mi porta.</small>
              </ListGroup.Item>
              <ListGroup.Item action className="flex-column align-items-start">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">List group item heading</h5>
                  <small className="text-muted">3 days ago</small>
                </div>

                <p className="mb-1">
                  Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                  varius blandit.
                </p>

                <small className="text-muted">Donec id elit non mi porta.</small>
              </ListGroup.Item>
              <ListGroup.Item action className="flex-column align-items-start">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">List group item heading</h5>
                  <small className="text-muted">3 days ago</small>
                </div>

                <p className="mb-1">
                  Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                  varius blandit.
                </p>

                <small className="text-muted">Donec id elit non mi porta.</small>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={8}>
          <Card body className="text-left p-1">
            <Card.Title className="mb-2">List With JavaScript behavior</Card.Title>
            <Card.Text>Use the tab from react-bootstrap</Card.Text>

            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <Row className="no-gutter">
                <Col xl={2} lg={3} md={4}>
                  <Nav variant="pills" className="d-flex flex-column cursor-pointer">
                    <Nav.Item>
                      <Nav.Link eventKey="first">Home</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="second">Profile</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="third">Message</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="fourth">Contact</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col md={8}>
                  <Tab.Content className="p-0">
                    <Tab.Pane eventKey="first">{randomText.slice(0, 1000)}</Tab.Pane>
                    <Tab.Pane eventKey="second">{randomText.slice(0, 500)}</Tab.Pane>
                    <Tab.Pane eventKey="third">{randomText.slice(0, 750)}</Tab.Pane>
                    <Tab.Pane eventKey="fourth">{randomText.slice(0, 850)}</Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
