import Breadcrumb from "app/components/Breadcrumb";
import { Tabs, Tab, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ProductDetails() {
  return (
    <div>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Ecommerce", path: "/ecommerce" },
          { name: "Product Details" }
        ]}
      />

      <section className="ul-product-detail">
        <Row>
          <Col xs={12}>
            <Card body>
              <Row>
                <Col lg={6}>
                  <img src="/assets/images/mac_book.jpg" alt="" className="w-100 p-4" />
                </Col>

                <Col lg={6}>
                  <div className="mb-4">
                    <h5 className="heading">MAC Book Pro</h5>
                    <span className="text-mute">Modern model 2019</span>
                  </div>

                  <div className="d-flex align-items-baseline">
                    <h3 className="font-weight-700 text-primary mb-0 me-2">$2,300</h3>
                    <span className="text-mute font-weight-800 me-2">
                      <del>$1,150</del>
                    </span>
                    <small className="text-success font-weight-700">50% off</small>
                  </div>

                  <div className="ul-product-detail__features mt-3">
                    <h6 className=" font-weight-700">Features:</h6>
                    <ul className="m-0 p-0">
                      <li className="d-flex align-items-center gap-1">
                        <i className="i-Right1 text-primary text-15 align-middle font-weight-700" />
                        <span>
                          This Refurbished product is tested to work and look like new with minimal
                          to no signs of wear & tear
                        </span>
                      </li>

                      <li className="d-flex align-items-center gap-1">
                        <i className="i-Right1 text-primary text-15 align-middle font-weight-700" />
                        <span>2.6GHz Intel Core i5 4th Gen processor</span>
                      </li>

                      <li className="d-flex align-items-center gap-1">
                        <i className="i-Right1 text-primary text-15 align-middle font-weight-700" />
                        <span>8GB DDR3 RAM</span>
                      </li>

                      <li className="d-flex align-items-center gap-1">
                        <i className="i-Right1 text-primary text-15 align-middle font-weight-700" />
                        <span>13.3-inch screen, Intel Iris 5100 1.5GB Graphics</span>
                      </li>
                    </ul>
                  </div>

                  <Button className="mt-3">Add To Cart</Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </section>

      <section>
        <Row>
          <Col lg={3} md={6} className="mt-4 text-center">
            <Card body>
              <div className="ul-product-detail--icon mb-2">
                <i className="i-Car-2 text-success text-25 font-weight-500" />
              </div>
              <h5 className="heading">Quick Delivery</h5>
              <p className="text-muted text-12">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mt-4 text-center">
            <Card body>
              <div className="ul-product-detail--icon mb-2">
                <i className="i-Reload text-danger text-25 font-weight-500" />
              </div>
              <h5 className="heading">Back In 30 Days</h5>
              <p className="text-muted text-12">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mt-4 text-center">
            <Card body>
              <div className="ul-product-detail--icon mb-2">
                <i className="i-Consulting text-info text-25 font-weight-500" />
              </div>
              <h5 className="heading">Support 24/7</h5>
              <p className="text-muted text-12">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mt-4 text-center">
            <Card body>
              <div className="ul-product-detail--icon mb-2">
                <i className="i-Money-Bag text-warning text-25 font-weight-500" />
              </div>
              <h5 className="heading">High Secure Payment</h5>
              <p className="text-muted text-12">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
            </Card>
          </Col>
        </Row>
      </section>

      <section>
        <Row>
          <Col xs={12} className="mt-4">
            <Card body className="mt-2 mb-4">
              <Tabs defaultActiveKey="Description" className="mb-4">
                <Tab eventKey="Description" title="Description">
                  <Row>
                    <Col md={4} xs={12}>
                      <img src="/assets/images/mac_book.jpg" alt="product" className="w-100" />
                    </Col>

                    <Col md={8} xs={12}>
                      <h5 className="text-uppercase font-weight-700 text-muted mt-4 mb-2">
                        Lorem Ipsum is simply dummy text of the printing
                      </h5>
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        Lorem Ipsum has been the industry's standard dummy text ever since the
                        1500s, when an unknown printer took a galley of type and scrambled it to
                        make a type specimen book. It has survived not only five centuries, but also
                        the leap into electronic typesetting, remaining essentially unchanged.
                      </p>

                      <Row className="text-center">
                        <Col lg={4} xs={12} className="mb-2">
                          <Card body className="shadow-none border">
                            <i className="i-Car-2 text-success text-25 font-weight-500" />
                            <h5 className="mt-2">Quick Delivery</h5>
                            <p className="text-muted text-12">
                              Lorem Ipsum is simply dummy text of the printing and typesetting
                              industry.
                            </p>
                          </Card>
                        </Col>

                        <Col lg={4} xs={12} className="mb-2">
                          <Card body className="shadow-none border">
                            <i className="i-Car-2 text-primary text-25 font-weight-500" />
                            <h5 className="heading mt-2">Quick Delivery</h5>
                            <p className="text-muted text-12">
                              Lorem Ipsum is simply dummy text of the printing and typesetting
                              industry.
                            </p>
                          </Card>
                        </Col>

                        <Col lg={4} xs={12} className="mb-2">
                          <Card body className="shadow-none border">
                            <i className="i-Car-2 text-danger text-25 font-weight-500 " />
                            <h5 className="heading mt-2">Quick Delivery</h5>
                            <p className="text-muted text-12">
                              Lorem Ipsum is simply dummy text of the printing and typesetting
                              industry.
                            </p>
                          </Card>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="Reviews" title="Reviews">
                  <Row>
                    <Col xs={12}>
                      <div className="text-center">
                        <h3 className="heading text-success">4.9</h3>
                        <span className="text-muted font-weight-600">Overall Rating</span>
                      </div>

                      <div className="mt-3">
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <Link to="/" className="d-flex align-items-center gap-1 mb-2">
                              <i className="i-Left" />
                              <span className="line-height-1">Reply</span>
                            </Link>

                            <h5 className="font-weight-800">Timothy Clarkson</h5>
                            <p>Very comfortable key,and nice product.</p>
                          </ListGroup.Item>

                          <ListGroup.Item>
                            <Link to="/" className="d-flex align-items-center gap-1 mb-2 mt-3">
                              <i className="i-Left" />
                              <span className="line-height-1">Reply</span>
                            </Link>

                            <h5 className="font-weight-800">Jaret Leto</h5>
                            <p>Very comfortable key,and nice product.</p>
                          </ListGroup.Item>
                        </ListGroup>
                      </div>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="Customized Tab" title="Customized Tab">
                  <Row className="text-center">
                    <Col lg={4} xs={12} className="mb-2">
                      <Card body className="shadow-none border">
                        <i className="i-Car-2 text-success text-25 font-weight-500" />
                        <h5 className="heading mt-2">Quick Delivery</h5>
                        <p className="text-muted text-12">
                          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                      </Card>
                    </Col>

                    <Col lg={4} xs={12} className="mb-2">
                      <Card body className="shadow-none border">
                        <i className="i-Car-2 text-primary text-25 font-weight-500" />
                        <h5 className="heading mt-2">Quick Delivery</h5>
                        <p className="text-muted text-12">
                          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                      </Card>
                    </Col>

                    <Col lg={4} xs={12} className="mb-2">
                      <Card body className="shadow-none border">
                        <i className="i-Car-2 text-danger text-25 font-weight-500" />
                        <h5 className="heading mt-2">Quick Delivery</h5>
                        <p className="text-muted text-12">
                          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                      </Card>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="About Brand" title="About Brand">
                  <Row>
                    <Col lg={2}>
                      <img src="/assets/images/mac_book.jpg" alt="" />
                    </Col>

                    <Col lg={6}>
                      <span className="badge badge-pill badge-danger p-2 m-1">Apple</span>
                      <h6 className="heading mt-2">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                      </h6>
                      <p className="text-muted">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        Lorem Ipsum has been the industry's standard dummy text ever since the
                        1500s, when an unknown printer
                      </p>
                    </Col>

                    <Col lg={4}>
                      <div className="ul-product-detail__features mt-3">
                        <ul className="m-0 p-0">
                          <li className="d-flex align-items-center gap-2">
                            <i className="i-Right1 text-primary text-15 align-middle font-weight-700" />
                            <span>
                              This Refurbished product is tested to work and look like new with
                              minimal to no signs of wear &amp; tear
                            </span>
                          </li>

                          <li className="d-flex align-items-center gap-2">
                            <i className="i-Right1 text-primary text-15 align-middle font-weight-700" />
                            <span>2.6GHz Intel Core i5 4th Gen processor</span>
                          </li>

                          <li className="d-flex align-items-center gap-2">
                            <i className="i-Right1 text-primary text-15 align-middle font-weight-700" />
                            <span>8GB DDR3 RAM</span>
                          </li>

                          <li className="d-flex align-items-center gap-2">
                            <i className="i-Right1 text-primary text-15 align-middle font-weight-700" />
                            <span>13.3-inch screen, Intel Iris 5100 1.5GB Graphics</span>
                          </li>
                        </ul>
                      </div>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
