import Breadcrumb from "app/components/Breadcrumb";
import {
  ProgressBar,
  Tabs,
  Tab,
  Row,
  Col,
  Card,
  Button,
  FormGroup,
  FormLabel,
  FormControl,
  FormText,
  FormCheck
} from "react-bootstrap";

export default function CardWidget() {
  const randomText =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "Widgets", path: "/widgets" }, { name: "Card" }]} />

      <Row>
        <Col lg={4} className="mt-3">
          <Card>
            <Card.Img src="/assets/images/products/iphone-1.jpg" alt="First slide" />

            <Card.Body>
              <Card.Title className="mb-2">Gull Admin</Card.Title>
              <Card.Text className="text-mute">By Frontend developer</Card.Text>
              <Button>Download</Button>

              <Button variant="outline-success" className="float-end">
                Preview
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mt-3">
          <Card body>
            <Card.Img
              className="d-block w-100 rounded"
              src="/assets/images/products/headphone-1.jpg"
              alt="Second slide"
            />

            <Card.Title className="mt-4 mb-1">Gull Admin</Card.Title>
            <Card.Text className="text-mute">By Frontend developer</Card.Text>

            <div className="ul-widget-card__info">
              <span>
                <p>$ 4785.78</p>
                <p className="text-mute">Income</p>
              </span>

              <span>
                <p>4/11/2019</p>
                <p className="text-mute m-0">Deadline</p>
              </span>
            </div>
          </Card>
        </Col>

        <Col lg={4} className="mt-3">
          <Card body>
            <Card.Img
              className="d-block w-100 rounded"
              src="/assets/images/products/iphone-1.jpg"
              alt="First slide"
            />

            <Card.Title className="mt-4 mb-2">Gull Admin</Card.Title>

            <div className="ul-widget-card__progress-rate">
              <span>$675</span>
              <span className="">$10000</span>
            </div>

            <ProgressBar className="mb-3" now={30} />

            <Button>Download</Button>

            <Button variant="outline-success" className="float-end">
              Preview
            </Button>
          </Card>
        </Col>

        <Col lg={4} className="mt-3">
          <Card body>
            <div className="user-profile mb-4">
              <div className="ul-widget-card__user-info">
                <img
                  className="profile-picture avatar-lg mb-2"
                  src="/assets/images/faces/1.jpg"
                  alt=""
                />
                <p className="m-0 text-24">Timothy Carlson</p>
                <p className="text-muted m-0">Digital Marketer</p>
              </div>
            </div>

            <div className="ul-widget-card--line mt-2">
              <Button>Download</Button>

              <Button variant="outline-success" className="float-end">
                Preview
              </Button>
            </div>

            <div className="ul-widget-card__rate-icon">
              <span className="d-flex align-items-center gap-1">
                <i className="i-Add-UserStar text-warning" />
                5.0
              </span>

              <span>78 Projects</span>
            </div>
          </Card>
        </Col>

        <Col lg={4} className="mt-3">
          <Card body>
            <div className="ul-widget-card__title-info text-center mb-3">
              <p className="m-0 text-24">Jon Snow</p>
              <p className="text-muted m-0">UI/UX</p>
            </div>

            <div className="user-profile mb-4">
              <div className="ul-widget-card__user-info">
                <img
                  className="profile-picture avatar-lg mb-2"
                  src="/assets/images/faces/5.jpg"
                  alt=""
                />
              </div>
            </div>

            <div className="ul-widget-card__full-status mb-3">
              <div className="ul-widget-card__status1">
                <span>797</span>
                <span className="text-mute">Uploads</span>
              </div>
              <div className="ul-widget-card__status1">
                <span>90k</span>
                <span className="text-mute">following</span>
              </div>
              <div className="ul-widget-card__status1">
                <span>2.5M</span>
                <span className="text-mute">followers</span>
              </div>
            </div>

            <div className="mt-2">
              <Button className="w-100 m-1">Follow</Button>
            </div>
          </Card>
        </Col>

        <Col lg={4} className="mt-3">
          <Card body>
            <div className="user-profile mb-4">
              <div className="ul-widget-card__user-info">
                <img
                  className="profile-picture avatar-lg mb-2"
                  src="/assets/images/faces/2.jpg"
                  alt=""
                />
                <p className="m-0 text-24">Wolverine</p>
                <p className="text-muted m-0">Mutant</p>
              </div>
            </div>

            <div className="ul-widget-card__progress-rate">
              <span>700 Points</span>
              <span>1000</span>
            </div>

            <ProgressBar className="mb-3" now={70} />

            <div className="mt-4">
              <Button>Follow</Button>
              <Button variant="outline-success" className="float-end">
                Message
              </Button>
            </div>
          </Card>
        </Col>

        <Col md={4} className="mt-3">
          <Card className="bg-dark text-white o-hidden mb-4">
            <Card.Img src="/assets/images/photo-long-1.jpg" alt="Card" />

            <div className="card-img-overlay">
              <div className="text-center pt-4">
                <h5 className="card-title mb-2 text-white">Card title</h5>
                <div className="separator border-top mb-2" />
                <p className="text-small font-italic">Last updated 3 mins ago</p>
              </div>

              <div className="p-1 text-left card-footer font-weight-light d-flex">
                <span className="me-3 d-flex align-items-center gap-1">
                  <i className="i-Speach-Bubble-6" />
                  <span className="line-height-1">12</span>
                </span>

                <span className="d-flex align-items-center gap-2">
                  <i className="i-Calendar-4" />
                  <span className="line-height-1">03.12.2018</span>
                </span>
              </div>
            </div>
          </Card>
        </Col>

        <Col md={4} className="mt-3">
          <Card className="bg-dark text-white o-hidden mb-4">
            <Card.Img src="/assets/images/photo-long-2.jpg" alt="Card" />

            <div className="card-img-overlay">
              <div className="text-center pt-4">
                <h5 className="card-title mb-2 text-white">Sunny</h5>
                <div className="separator border-top mb-2"></div>
                <h3 className="text-white">Korea</h3>
              </div>

              <div className="ul-widget-card__cloud card-icon-bg">
                <div className="ul-widget-card__head">
                  <i className="i-Cloud-Sun" />
                  <h1 className="m-0">
                    32 <sup>o</sup>
                  </h1>
                </div>

                <div className="ul-widget-card__body">
                  <div className="ul-widget-card__weather-info">
                    <span>Precipitation</span>
                    <span>6%</span>
                  </div>

                  <div className="ul-widget-card__weather-info">
                    <span>Humidity</span>
                    <span>64%</span>
                  </div>

                  <div className="ul-widget-card__weather-info">
                    <span>Wind</span>
                    <span>6 km/h</span>
                  </div>
                </div>
              </div>

              <div className="p-1 text-left card-footer font-weight-light d-flex">
                <span className="d-flex align-items-center gap-2">
                  <i className="i-Calendar-4" />
                  <span className="line-height-1">03.12.2018</span>
                </span>
              </div>
            </div>
          </Card>
        </Col>

        <Col md={4} className="mt-3">
          <Card className="bg-dark text-white o-hidden mb-4">
            <Card.Img src="/assets/images/photo-long-2.jpg" alt="Card" />

            <div className="card-img-overlay">
              <div className="text-center pt-4">
                <h5 className="card-title mb-2 text-white">Card title</h5>
                <div className="separator border-top mb-2" />
                <p className="text-small font-italic">Last updated 3 mins ago</p>
              </div>

              <div className="p-1 text-left card-footer font-weight-light d-flex gap-3">
                <span className="mr-3 d-flex align-items-center gap-1">
                  <i className="i-Speach-Bubble-6" />
                  <span className="line-height-1">12</span>
                </span>

                <span className="d-flex align-items-center gap-1">
                  <i className="i-Calendar-4" />
                  <span className="line-height-1">03.12.2018</span>
                </span>
              </div>
            </div>
          </Card>
        </Col>

        <Col lg={4} className="mt-3">
          <Card body>
            <Card.Title className="mb-0">Gull Admin</Card.Title>
            <Card.Text>By Frontend developer</Card.Text>

            <Card.Img
              className="d-block w-100 rounded"
              src="/assets/images/products/headphone-1.jpg"
              alt="Second slide"
            />

            <div className="ul-widget-card__rate-icon --version-2">
              <div className="d-flex align-items-center gap-1">
                <i className="i-Like text-success" />
                <span className="line-height-1">576</span>
              </div>

              <div className="d-flex align-items-center gap-1">
                <i className="i-Speach-Bubble-3 text-primary" />
                <span className="line-height-1">350</span>
              </div>

              <div className="d-flex align-items-center gap-1">
                <i className="i-Heart1 text-danger" />
                <span className="line-height-1">255</span>
              </div>
            </div>
          </Card>
        </Col>

        <div className="col-lg-8 col-xl-8 mt-3">
          <Card body>
            <Card.Title>Timeline</Card.Title>

            <div className="ul-widget-s6__items ul-widget-card__position">
              <div className="ul-widget-card__item">
                <span className="ul-widget-s6__badge ul-widget-card__dot">
                  <p className="badge-dot-primary ul-widget6__dot ul-widget-card__dot-xl">
                    <i className="i-Add text-white" />
                  </p>
                </span>

                <div className="ul-widget-card__info-v2">
                  <span className="t-font-boldest">Add File</span>
                  <span className="t-font-bold">
                    It is a long established fact that a reader will be distracted.
                  </span>
                  <small className="text-mute">3 Days Ago</small>
                </div>
              </div>
            </div>

            <div className="ul-widget-s6__items ul-widget-card__position">
              <div className="ul-widget-card__item">
                <span className="ul-widget-s6__badge ul-widget-card__dot">
                  <p className="badge-dot-success ul-widget6__dot ul-widget-card__dot-xl">
                    <i className="i-Like-2 text-white" />
                  </p>
                </span>

                <div className="ul-widget-card__info-v2">
                  <span className="t-font-boldest">File Completed</span>
                  <span className="t-font-bold">
                    It is a long established fact that a reader will be distracted.
                  </span>
                  <small className="text-mute">3 Days Ago</small>
                </div>
              </div>
            </div>

            <div className="ul-widget-s6__items ul-widget-card__position">
              <div className="ul-widget-card__item">
                <span className="ul-widget-s6__badge ul-widget-card__dot">
                  <p className="badge-dot-danger ul-widget6__dot ul-widget-card__dot-xl">
                    <i className="i-Delete-File text-white" />
                  </p>
                </span>

                <div className="ul-widget-card__info-v2">
                  <span className="t-font-boldest">Delete File</span>
                  <span className="t-font-bold">
                    It is a long established fact that a reader will be distracted.
                  </span>
                  <small className="text-mute">3 Days Ago</small>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Col lg={6} className="mt-3">
          <Card body>
            <Card.Title>Contact Form</Card.Title>

            <form>
              <FormGroup className="mb-3">
                <FormLabel htmlFor="exampleInputEmail1">Email address</FormLabel>
                <FormControl
                  type="email"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                />
                <FormText className="text-muted">
                  We'll never share your email with anyone else.
                </FormText>
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel htmlFor="exampleInputPassword1">Password</FormLabel>
                <FormControl type="password" id="exampleInputPassword1" placeholder="Password" />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel htmlFor="exampleFormControlTextarea1">Example textarea</FormLabel>
                <FormControl as="textarea" id="exampleFormControlTextarea1" rows="3" />
              </FormGroup>

              <FormCheck type="checkbox" label="Check me out" className="mb-3" />
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </Card>
        </Col>

        <Col lg={6} className="mt-3">
          <Card body className="mt-2 mb-4">
            <Tabs defaultActiveKey="home" id="uncontrolled-tab-example">
              <Tab eventKey="home" title="Home">
                {randomText}
              </Tab>

              <Tab eventKey="profile" title="Profile">
                {randomText}
              </Tab>

              <Tab eventKey="contact" title="Contact">
                {randomText}
              </Tab>

              <Tab eventKey="disabled" title="Disabled" disabled>
                {randomText}
              </Tab>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
