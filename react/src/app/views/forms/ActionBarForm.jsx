import { Card, Col, Form, FormGroup, Row } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function ActionBarForm() {
  return (
    <section className="basic-action-bar">
      <Breadcrumb
        routeSegments={[{ name: "Forms", path: "/forms" }, { name: "Action Bar Form" }]}
      />

      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="py-3">
              <Card.Title className="mb-0"> Default Action Bar</Card.Title>
            </Card.Header>

            <form>
              <Card.Body>
                <Row>
                  <FormGroup controlId="name" className="col-md-6">
                    <Form.Label className="ul-form__label">Full Name:</Form.Label>
                    <Form.Control type="text" placeholder="Enter full name" />
                    <Form.Text className="ul-form__text">Please enter your full name</Form.Text>
                  </FormGroup>

                  <FormGroup controlId="email" className="col-md-6">
                    <Form.Label className="ul-form__label">Email Address:</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" />
                    <Form.Text className="ul-form__text">
                      We'll never share your email with anyone else
                    </Form.Text>
                  </FormGroup>
                </Row>

                <div className="custom-separator" />

                <Card.Title className="mb-3">Communication:</Card.Title>

                <div className="d-flex align-items-center gap-3">
                  <label className="checkbox checkbox-primary">
                    <input type="checkbox" />
                    <span>Email</span>
                    <span className="checkmark" />
                  </label>

                  <label className="checkbox checkbox-primary">
                    <input type="checkbox" />
                    <span>SMS</span>
                    <span className="checkmark" />
                  </label>

                  <label className="checkbox checkbox-primary">
                    <input type="checkbox" />
                    <span>Phone</span>
                    <span className="checkmark" />
                  </label>
                </div>
              </Card.Body>

              <Card.Footer>
                <div className="mc-footer">
                  <div className="row">
                    <div className="col-lg-12">
                      <button type="button" className="btn  btn-primary m-1">
                        Submit
                      </button>
                      <button type="button" className="btn btn-outline-secondary m-1">
                        Cancel
                      </button>
                      <button type="button" className="btn  btn-danger m-1 footer-delete-right">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card.Footer>
            </form>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <form>
            <Card>
              <Card.Header className="py-3">
                <Card.Title className="mb-0">Horizontal Form Layout</Card.Title>
              </Card.Header>

              <Card.Body>
                <FormGroup controlId="name" className="row mb-3">
                  <Col lg={4}>
                    <Form.Label className="action-bar-horizontal-label">Full Name:</Form.Label>
                  </Col>

                  <Col lg={6}>
                    <Form.Control type="text" placeholder="Enter full name" />
                    <Form.Text className="ul-form__text">Please enter your full name</Form.Text>
                  </Col>
                </FormGroup>

                <FormGroup controlId="email" className="row mb-3">
                  <Col lg={4}>
                    <Form.Label className="action-bar-horizontal-label">Email:</Form.Label>
                  </Col>

                  <Col lg={6}>
                    <Form.Control type="email" placeholder="Enter your email" />
                    <Form.Text className="ul-form__text">Please enter email</Form.Text>
                  </Col>
                </FormGroup>

                <FormGroup controlId="email" className="row">
                  <Col lg={4}>
                    <Form.Label className="action-bar-horizontal-label">Communication:</Form.Label>
                  </Col>

                  <Col lg={6}>
                    <div className="d-inline-flex align-self-center gap-2">
                      <label className="checkbox checkbox-primary">
                        <input type="checkbox" />
                        <span>Email</span>
                        <span className="checkmark" />
                      </label>

                      <label className="checkbox checkbox-primary">
                        <input type="checkbox" />
                        <span>SMS</span>
                        <span className="checkmark" />
                      </label>

                      <label className="checkbox checkbox-primary">
                        <input type="checkbox" />
                        <span>Phone</span>
                        <span className="checkmark" />
                      </label>
                    </div>
                  </Col>
                </FormGroup>
              </Card.Body>

              <Card.Footer>
                <button type="button" className="btn btn-primary m-1">
                  Save
                </button>
                <button type="button" className="btn btn-outline-secondary m-1">
                  Cancel
                </button>
              </Card.Footer>
            </Card>
          </form>
        </Col>

        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="py-3">
              <Card.Title className="mb-0">No Layout</Card.Title>
            </Card.Header>

            <form>
              <Card.Body>
                <Row>
                  <FormGroup controlId="name">
                    <Form.Label className="ul-form__label">Full Name:</Form.Label>
                    <Form.Control type="text" placeholder="Enter full name" />
                    <Form.Text className="ul-form__text">Please enter your full name</Form.Text>
                  </FormGroup>

                  <FormGroup controlId="email">
                    <Form.Label className="ul-form__label">Email Address:</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" />
                    <Form.Text className="ul-form__text">
                      We'll never share your email with anyone else
                    </Form.Text>
                  </FormGroup>
                </Row>

                <div className="custom-separator" />

                <Card.Title className="mb-3">Communication:</Card.Title>

                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Email</span>
                  <span className="checkmark" />
                </label>

                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>SMS</span>
                  <span className="checkmark" />
                </label>

                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Phone</span>
                  <span className="checkmark" />
                </label>
              </Card.Body>

              <Card.Footer>
                <div className="mc-footer">
                  <div className="row">
                    <div className="col-lg-12">
                      <button type="button" className="btn  btn-primary m-1">
                        Submit
                      </button>
                      <button type="button" className="btn btn-outline-secondary m-1">
                        Cancel
                      </button>
                      <button type="button" className="btn  btn-danger m-1 footer-delete-right">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card.Footer>
            </form>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="py-3">
              <Card.Title className="mb-0">Right Action Button</Card.Title>
            </Card.Header>

            <form>
              <Card.Body>
                <Row>
                  <FormGroup controlId="name">
                    <Form.Label className="ul-form__label">Full Name:</Form.Label>
                    <Form.Control type="text" placeholder="Enter full name" />
                    <Form.Text className="ul-form__text">Please enter your full name</Form.Text>
                  </FormGroup>

                  <FormGroup controlId="email">
                    <Form.Label className="ul-form__label">Email Address:</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" />
                    <Form.Text className="ul-form__text">
                      We'll never share your email with anyone else
                    </Form.Text>
                  </FormGroup>
                </Row>

                <div className="custom-separator" />

                <Card.Title className="mb-3">Communication:</Card.Title>

                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Email</span>
                  <span className="checkmark" />
                </label>

                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>SMS</span>
                  <span className="checkmark" />
                </label>

                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Phone</span>
                  <span className="checkmark" />
                </label>
              </Card.Body>

              <Card.Footer className="text-end">
                <button type="button" className="btn btn-outline-secondary m-1">
                  Cancel
                </button>
                <button type="button" className="btn  btn-primary m-1">
                  Submit
                </button>
              </Card.Footer>
            </form>
          </Card>
        </Col>

        {/* <Col lg={6} className="mb-3">
          <div className="card">
            <div className="card-header bg-transparent">
              <h3 className="card-title"> Solid Bar</h3>
            </div>
            <form action="">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-12">
                    <label htmlFor="inputEmail4" className="ul-form__label">
                      Full Name:
                    </label>
                    <input type="text" className="form-control" placeholder="Enter full name" />
                    <small id="passwordHelpBlock" className="ul-form__text form-text ">
                      Please enter your full name
                    </small>
                  </div>
                  <div className="form-group col-md-12">
                    <label htmlFor="inputEmail4" className="ul-form__label">
                      Email Address:
                    </label>
                    <input type="email" className="form-control" placeholder="Enter full name" />
                    <small id="passwordHelpBlock" className="ul-form__text form-text ">
                      We'll never share your email with anyone else
                    </small>
                  </div>
                </div>
                <div className="custom-separator"></div>
                <div className="card-title">Communication:</div>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Email</span>
                  <span className="checkmark"></span>
                </label>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>SMS</span>
                  <span className="checkmark"></span>
                </label>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Phone</span>
                  <span className="checkmark"></span>
                </label>
              </div>
              <div className="card-footer">
                <div className="mc-footer">
                  <div className="row">
                    <div className="col-lg-12 text-end">
                      <button type="button" className="btn  btn-primary m-1">
                        Submit
                      </button>
                      <button type="button" className="btn btn-outline-secondary m-1">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Col>

        <Col lg={6} className="mb-3">
          <div className="card">
            <div className="card-header bg-transparent">
              <h3 className="card-title"> Multiple Buttons</h3>
            </div>
            <form action="">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-12">
                    <label htmlFor="inputEmail4" className="ul-form__label">
                      Full Name:
                    </label>
                    <input type="text" className="form-control" placeholder="Enter full name" />
                    <small id="passwordHelpBlock" className="ul-form__text form-text ">
                      Please enter your full name
                    </small>
                  </div>
                  <div className="form-group col-md-12">
                    <label htmlFor="inputEmail4" className="ul-form__label">
                      Email Address:
                    </label>
                    <input type="email" className="form-control" placeholder="Enter full name" />
                    <small id="passwordHelpBlock" className="ul-form__text form-text ">
                      We'll never share your email with anyone else
                    </small>
                  </div>
                </div>
                <div className="custom-separator"></div>
                <div className="card-title">Communication:</div>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Email</span>
                  <span className="checkmark"></span>
                </label>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>SMS</span>
                  <span className="checkmark"></span>
                </label>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Phone</span>
                  <span className="checkmark"></span>
                </label>
              </div>
              <div className="card-footer bg-transparent">
                <div className="mc-footer">
                  <div className="row">
                    <div className="col-lg-12">
                      <button type="button" className="btn  btn-primary m-1">
                        Submit
                      </button>
                      <button type="button" className="btn btn-outline-secondary m-1">
                        Cancel
                      </button>
                      <button type="button" className="btn  btn-danger m-1 footer-delete-right">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Col>

        <Col lg={6} className="mb-3">
          <div className="card">
            <div className="card-header bg-transparent">
              <h3 className="card-title"> Top & Bottom Actions Bars</h3>
            </div>
            <div className="card-footer">
              <div className="top-action-bar">
                <div className="row">
                  <div className="col-lg-12 text-end">
                    <button type="button" className="btn  btn-primary m-1">
                      Submit
                    </button>
                    <button type="button" className="btn btn-outline-secondary m-1">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <form action="">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-12">
                    <label htmlFor="inputEmail4" className="ul-form__label">
                      Full Name:
                    </label>
                    <input type="text" className="form-control" placeholder="Enter full name" />
                    <small id="passwordHelpBlock" className="ul-form__text form-text ">
                      Please enter your full name
                    </small>
                  </div>
                  <div className="form-group col-md-12">
                    <label htmlFor="inputEmail4" className="ul-form__label">
                      Email Address:
                    </label>
                    <input type="email" className="form-control" placeholder="Enter full name" />
                    <small id="passwordHelpBlock" className="ul-form__text form-text ">
                      We'll never share your email with anyone else
                    </small>
                  </div>
                </div>
                <div className="custom-separator"></div>
                <div className="card-title">Communication:</div>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Email</span>
                  <span className="checkmark"></span>
                </label>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>SMS</span>
                  <span className="checkmark"></span>
                </label>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Phone</span>
                  <span className="checkmark"></span>
                </label>
              </div>
              <div className="card-footer">
                <div className="mc-footer">
                  <div className="row">
                    <div className="col-lg-12 text-end">
                      <button type="button" className="btn  btn-primary m-1">
                        Submit
                      </button>
                      <button type="button" className="btn btn-outline-secondary m-1">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Col>

        <Col lg={6} className="mb-3">
          <div className="card">
            <div className="card-header bg-transparent">
              <h3 className="card-title"> Default Action Bar</h3>
            </div>
            <form action="">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-12">
                    <label htmlFor="inputEmail4" className="ul-form__label">
                      Full Name:
                    </label>
                    <input type="text" className="form-control" placeholder="Enter full name" />
                    <small id="passwordHelpBlock" className="ul-form__text form-text ">
                      Please enter your full name
                    </small>
                  </div>
                  <div className="form-group col-md-12">
                    <label htmlFor="inputEmail4" className="ul-form__label">
                      Email Address:
                    </label>
                    <input type="email" className="form-control" placeholder="Enter full name" />
                    <small id="passwordHelpBlock" className="ul-form__text form-text ">
                      We'll never share your email with anyone else
                    </small>
                  </div>
                </div>
                <div className="custom-separator"></div>
                <div className="card-title">Communication:</div>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Email</span>
                  <span className="checkmark"></span>
                </label>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>SMS</span>
                  <span className="checkmark"></span>
                </label>
                <label className="checkbox checkbox-primary">
                  <input type="checkbox" />
                  <span>Phone</span>
                  <span className="checkmark"></span>
                </label>
              </div>
              <div className="card-footer bg-transparent">
                <div className="mc-footer">
                  <div className="row">
                    <div className="col-lg-12 text-end">
                      <button type="submit" className="btn  btn-primary m-1">
                        Submit
                      </button>
                      <span>or</span>
                      <button type="button" className="btn  btn-outline-danger ml-1">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Col> */}
      </Row>
    </section>
  );
}
