import Breadcrumb from "app/components/Breadcrumb";
import { Row, Col, Tab, Tabs, Nav, Card } from "react-bootstrap";

const customTabHeader = (title, icon) => (
  <div className="d-flex align-items-center">
    <span className="me-2">
      <i className={icon} />
    </span>
    <span>{title}</span>
  </div>
);

export default function AppTab() {
  const randomText =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Tabs" }]} />

      <div className="mb-4">
        <Row>
          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Basic Tabs</Card.Title>

              <Tabs defaultActiveKey="home" id="uncontrolled-tab-example">
                <Tab eventKey="home" title="Home">
                  {randomText.slice(0, 500)}
                </Tab>
                <Tab eventKey="profile" title="Profile">
                  {randomText.slice(0, 400)}
                </Tab>
                <Tab eventKey="contact" title="Contact">
                  {randomText.slice(0, 450)}
                </Tab>
                <Tab eventKey="disabled" title="Disabled" disabled>
                  {randomText.slice(0, 480)}
                </Tab>
              </Tabs>
            </Card>
          </Col>

          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Tabs with Icon</Card.Title>

              <Tabs defaultActiveKey="home" id="uncontrolled-tab-example">
                <Tab eventKey="home" title={customTabHeader("Home", "i-Atom")}>
                  {randomText.slice(0, 500)}
                </Tab>
                <Tab eventKey="profile" title={customTabHeader("Profile", "i-Shutter")}>
                  {randomText.slice(0, 400)}
                </Tab>
                <Tab eventKey="contact" title={customTabHeader("Contact", "i-Boy")}>
                  {randomText.slice(0, 450)}
                </Tab>
                <Tab eventKey="disabled" title={customTabHeader("Disabled", "i-Close")} disabled>
                  {randomText.slice(0, 480)}
                </Tab>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-4">
        <Row>
          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Pill Tabs</Card.Title>

              <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                <Nav variant="pills" className="px-2">
                  <Nav.Item className="mr-2">
                    <Nav.Link eventKey="first">Home</Nav.Link>
                  </Nav.Item>

                  <Nav.Item className="mr-2">
                    <Nav.Link eventKey="second">Profile</Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link eventKey="third">Contact</Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link eventKey="fourth" disabled>
                      Disabled
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="first">{randomText.slice(0, 500)}</Tab.Pane>
                  <Tab.Pane eventKey="second">{randomText.slice(0, 450)}</Tab.Pane>
                  <Tab.Pane eventKey="third">{randomText.slice(0, 480)}</Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card>
          </Col>

          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Adjusted Pills</Card.Title>

              <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                <Nav variant="pills" className="d-flex px-2">
                  <Nav.Item className="mr-2 flex-grow-1 text-center">
                    <Nav.Link eventKey="first">Home</Nav.Link>
                  </Nav.Item>

                  <Nav.Item className="mr-2 flex-grow-1 text-center">
                    <Nav.Link eventKey="second">Profile</Nav.Link>
                  </Nav.Item>

                  <Nav.Item className="flex-grow-1 text-center">
                    <Nav.Link eventKey="third">Contact</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="first">{randomText.slice(0, 500)}</Tab.Pane>
                  <Tab.Pane eventKey="second">{randomText.slice(0, 450)}</Tab.Pane>
                  <Tab.Pane eventKey="third">{randomText.slice(0, 480)}</Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-4">
        <Row>
          <Col sm={6} xs={12} className="mb-4">
            <Card body>
              <Card.Title>Vertical tab</Card.Title>

              <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                <div className="row">
                  <div className="col-md-4">
                    <Nav variant="pills" className="d-flex flex-column">
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
                  </div>

                  <div className="col-md-8">
                    <Tab.Content className="p-0">
                      <Tab.Pane eventKey="first">{randomText.slice(0, 500)}</Tab.Pane>
                      <Tab.Pane eventKey="second">{randomText.slice(0, 400)}</Tab.Pane>
                      <Tab.Pane eventKey="third">{randomText.slice(0, 450)}</Tab.Pane>
                      <Tab.Pane eventKey="fourth">{randomText.slice(0, 480)}</Tab.Pane>
                    </Tab.Content>
                  </div>
                </div>
              </Tab.Container>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
