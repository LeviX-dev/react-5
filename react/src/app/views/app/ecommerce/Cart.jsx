import { Link } from "react-router-dom";
import { Card, Col, Row, Table } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function Cart() {
  return (
    <div>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Ecommerce", path: "/ecommerce" },
          { name: "Cart" }
        ]}
      />

      <section>
        <Row>
          <Col>
            <Card body>
              <Card.Title>Product Cart</Card.Title>

              <Table responsive>
                <thead>
                  <tr>
                    <th scope="col">SL.</th>
                    <th scope="col">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Total</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>1</td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          className="avatar-sm img-fluid"
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

                    <td>
                      <input className="form-control w-25" type="number" defaultValue="4" id="" />
                    </td>

                    <td>$8,000</td>

                    <td>
                      <Link to="/">
                        <i className="i-Close-Window text-19 text-danger font-weight-700" />
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </Table>

              <Row>
                <Col lg={6} className="mt-5">
                  <div className="ul-product-cart__invoice">
                    <Card.Title className="heading text-primary">Total Payment</Card.Title>

                    <Table>
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
                                <label className="radio radio-primary" checked>
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

                    <button type="button" className="btn btn-primary ripple m-1">
                      Checkout
                    </button>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
