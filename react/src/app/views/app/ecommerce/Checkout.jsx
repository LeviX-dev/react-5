import { Link } from "react-router-dom";
import { Tabs, Tab, Row, Col, Card, Table, Form } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function Checkout() {
  const customTabHeader = (title, icon) => (
    <div className="d-flex align-items-center gap-2">
      <i className={icon} />
      <span>{title}</span>
    </div>
  );

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Ecommerce", path: "/ecommerce" },
          { name: "Checkout" }
        ]}
      />

      <Row>
        <Col lg={4} className=" mb-4">
          <Card body>
            <Card.Title>Product Cart</Card.Title>
            <span className="text-muted">Gull Modern Cart</span>

            <Table responsive>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        className="avatar-sm mb-2 img-fluid"
                        src="/assets/images/faces/1.jpg"
                        alt=""
                      />

                      <div>
                        <Link to="/">
                          <h6 className="heading mb-0">Nike Air Jordan</h6>
                        </Link>
                        <span className="text-mute">size-14 mode:664</span>
                      </div>
                    </div>
                  </td>
                  <td>$2,000</td>
                  <td>4</td>
                  <td>$8,000</td>
                  <td>
                    <Link to="/">
                      <i className="i-Close-Window text-19 text-danger font-weight-700" />
                    </Link>
                  </td>
                </tr>

                <tr>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      className="avatar-sm mb-2 img-fluid"
                      src="/assets/images/faces/1.jpg"
                      alt=""
                    />

                    <div>
                      <Link to="/">
                        <h6 className="heading mb-0">Nike Air Jordan</h6>
                      </Link>
                      <span className="text-mute">size-14 mode:664</span>
                    </div>
                  </div>
                  <td>$2,000</td>
                  <td>4</td>
                  <td>$8,000</td>
                  <td>
                    <Link to="/">
                      <i className="i-Close-Window text-19 text-danger font-weight-700"></i>
                    </Link>
                  </td>
                </tr>

                <tr>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      className="avatar-sm mb-2 img-fluid"
                      src="/assets/images/faces/1.jpg"
                      alt=""
                    />

                    <div>
                      <Link to="/">
                        <h6 className="heading mb-0">Nike Air Jordan</h6>
                      </Link>
                      <span className="text-mute">size-14 mode:664</span>
                    </div>
                  </div>
                  <td>$2,000</td>
                  <td>4</td>
                  <td>$8,000</td>
                  <td>
                    <Link to="/">
                      <i className="i-Close-Window text-19 text-danger font-weight-700"></i>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </Table>

            <Row>
              <Col xs={12} className="mt-5">
                <Card.Title className="heading text-primary">Total Payment</Card.Title>

                <Table responsive>
                  <tbody>
                    <tr>
                      <th scope="row" className="text-16">
                        Subtotal
                      </th>
                      <td className="text-16 text-success font-weight-700">$5,000</td>
                    </tr>

                    <tr>
                      <th scope="row" className="text-16">
                        Shipping
                      </th>

                      <td>
                        <ul className="list-unstyled mb-0">
                          <li>
                            <label className="radio radio-primary" checked="">
                              <input type="radio" name="radio" value="0" />
                              <span>Shipping Charge : $15.00</span>
                              <span className="checkmark" />
                            </label>
                          </li>

                          <li>
                            <label className="radio radio-primary">
                              <input type="radio" name="radio" value="0" />
                              <span>Shipping Charge : $15.00</span>
                              <span className="checkmark" />
                            </label>
                          </li>

                          <li>
                            <Link to="/" className="text-dark font-weight-bold">
                              Change Address
                            </Link>
                          </li>
                        </ul>
                      </td>
                    </tr>

                    <tr>
                      <th scope="row" className="text-primary text-16">
                        Total:
                      </th>
                      <td className="font-weight-700 text-16">$5,015</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col lg={8}>
          <Card body>
            <form>
              <Card.Title>Delivery Address</Card.Title>

              <Row>
                <Form.Group controlId="firstName" className="mb-3 col-md-6">
                  <Form.Label>First Name:</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>

                <Form.Group controlId="lastName" className="mb-3 col-md-6">
                  <Form.Label>Last Name:</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>

                <Form.Group controlId="deliveryAddress" className="mb-3 col-md-6">
                  <Form.Label>Delivery Address:</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>

                <Form.Group controlId="address" className="mb-3 col-md-6">
                  <Form.Label>Address:</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>

                <Form.Group controlId="city" className="mb-3 col-md-4">
                  <Form.Label>City:</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>

                <Form.Group controlId="state" className="mb-3 col-md-4">
                  <Form.Label>State:</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>

                <Form.Group controlId="country" className="mb-3 col-md-4">
                  <Form.Label>Country:</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>
              </Row>
            </form>
          </Card>

          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Billing Details</Card.Title>
              <Tabs defaultActiveKey="card">
                <Tab eventKey="card" title={customTabHeader("Credit Card", "i-Credit-Card")}>
                  <Row>
                    <Form.Group controlId="number" className="mb-3 col-md-6">
                      <Form.Label>Card Number:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="name" className="mb-3 col-md-6">
                      <Form.Label>Full Name:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="exDate" className="mb-3 col-md-6">
                      <Form.Label>Ex Date:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="ccv" className="mb-3 col-md-6">
                      <Form.Label>CCV:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>
                  </Row>
                </Tab>

                <Tab eventKey="paypal" title={customTabHeader("Paypal", "i-Money-2")}>
                  <Row>
                    <Form.Group controlId="number" className="mb-3 col-md-6">
                      <Form.Label>Card Number:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="name" className="mb-3 col-md-6">
                      <Form.Label>Full Name:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="exDate" className="mb-3 col-md-6">
                      <Form.Label>Ex Date:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="ccv" className="mb-3 col-md-6">
                      <Form.Label>CCV:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>
                  </Row>
                </Tab>

                <Tab eventKey="bitcoin" title={customTabHeader("Bitcoin", "i-Bitcoin")}>
                  <Row>
                    <Form.Group controlId="number" className="mb-3 col-md-6">
                      <Form.Label>Card Number:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="name" className="mb-3 col-md-6">
                      <Form.Label>Full Name:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="exDate" className="mb-3 col-md-6">
                      <Form.Label>Ex Date:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group controlId="ccv" className="mb-3 col-md-6">
                      <Form.Label>CCV:</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>
                  </Row>
                </Tab>
              </Tabs>
            </Card.Body>

            <Card.Footer>
              <div className="row text-end">
                <div className="col-lg-12 ">
                  <button type="button" className="btn btn-success m-1">
                    Pay Now
                  </button>
                </div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
