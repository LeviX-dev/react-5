import {
  Button,
  Card,
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  FormText,
  InputGroup,
  Row
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function MultiColumnForms() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[{ name: "Forms", path: "/forms" }, { name: "Multi Column Forms" }]}
      />

      <Row>
        <Col xs={12}>
          {/* 2 Columns Form Layout */}
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">2 Columns Form Layout</Card.Title>
            </Card.Header>

            <form>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <FormGroup controlId="name">
                      <FormLabel className="ul-form__label">Full Name:</FormLabel>
                      <FormControl type="text" placeholder="Enter full name" />
                      <FormText className="ul-form__text">Please enter your full name</FormText>
                    </FormGroup>
                  </Col>

                  <Col md={6}>
                    <FormGroup controlId="name">
                      <FormLabel className="ul-form__label">Contact Number:</FormLabel>
                      <FormControl type="text" placeholder="Enter contact number" />
                      <FormText className="ul-form__text">
                        Please enter your contact number
                      </FormText>
                    </FormGroup>
                  </Col>
                </Row>

                <div className="custom-separator" />

                <Row>
                  <Col md={6}>
                    <FormGroup controlId="address">
                      <FormLabel className="ul-form__label">Address:</FormLabel>
                      <FormControl type="text" placeholder="Enter address" />
                      <FormText className="ul-form__text">Please enter your address</FormText>
                    </FormGroup>
                  </Col>

                  <Col md={6}>
                    <FormGroup controlId="postcode">
                      <FormLabel className="ul-form__label">Postcode:</FormLabel>
                      <FormControl type="text" placeholder="Enter postcode" />
                      <FormText className="ul-form__text">Please enter your postcode</FormText>
                    </FormGroup>
                  </Col>
                </Row>

                <div className="custom-separator" />

                <Row>
                  <Col md={6}>
                    <FormGroup controlId="address">
                      <FormLabel className="ul-form__label">User Group:</FormLabel>

                      <div className="ul-form__radio-inline">
                        <label className=" ul-radio__position radio radio-primary form-check-inline">
                          <input type="radio" name="radio" />
                          <span className="ul-form__radio-font">Sales Person</span>
                          <span className="checkmark" />
                        </label>

                        <label className="ul-radio__position radio radio-primary">
                          <input type="radio" name="radio" />
                          <span className="ul-form__radio-font">Customer</span>
                          <span className="checkmark" />
                        </label>
                      </div>

                      <FormText className="ul-form__text">Please enter your address</FormText>
                    </FormGroup>
                  </Col>
                </Row>
              </Card.Body>

              <Card.Footer>
                <button type="button" className="btn  btn-primary m-1">
                  Save
                </button>
                <button type="button" className="btn btn-outline-secondary m-1">
                  Cancel
                </button>

                <button type="button" className="btn btn-danger m-1 footer-delete-right">
                  Delete
                </button>
              </Card.Footer>
            </form>
          </Card>

          {/* 2 Columns Horizontal Form Layout */}
          <Card className="ul-card__margin-25">
            <Card.Header>
              <Card.Title className="mb-0">2 Columns Horizontal Form Layout</Card.Title>
            </Card.Header>

            <Card.Body>
              <FormGroup>
                <Row>
                  <FormLabel className="ul-form__label ul-form--margin col-lg-3 col-form-label">
                    Full Name:
                  </FormLabel>

                  <Col lg={2}>
                    <FormControl type="text" placeholder="Enter full name" />
                    <FormText className="ul-form__text form-text ">
                      Please enter your full name
                    </FormText>
                  </Col>

                  <FormLabel className="ul-form__label ul-form--margin col-lg-3 col-form-label">
                    Contact Number:
                  </FormLabel>

                  <Col lg={2}>
                    <FormControl type="text" placeholder="Enter Contact Number" />
                    <FormText className="ul-form__text ">Please enter your Contact Number</FormText>
                  </Col>
                </Row>
              </FormGroup>

              <div className="custom-separator" />

              <FormGroup className="row">
                <label className="ul-form__label ul-form--margin col-lg-3 col-form-label">
                  Address:
                </label>

                <Col lg={2}>
                  <div className="input-right-icon">
                    <FormControl type="text" placeholder="Enter your address" />
                    <span className="span-right-input-icon">
                      <i className="ul-form__icon i-Map-Marker" />
                    </span>
                  </div>

                  <FormText className="ul-form__text form-text">Please enter your address</FormText>
                </Col>

                <label
                  htmlFor="staticEmail9"
                  className="ul-form__label ul-form--margin col-lg-3 col-form-label">
                  Postcode:
                </label>

                <Col lg={2}>
                  <div className="input-right-icon">
                    <FormControl type="text" placeholder="Enter your postcode" />
                    <span className="span-right-input-icon">
                      <i className="ul-form__icon i-New-Mail" />
                    </span>
                  </div>

                  <FormText className="ul-form__text form-text">
                    Please enter your postcode
                  </FormText>
                </Col>
              </FormGroup>

              <div className="custom-separator" />

              <FormGroup className="row">
                <label
                  htmlFor="staticEmail10"
                  className="ul-form__label ul-form--margin col-lg-3 col-form-label">
                  Group:
                </label>

                <Col lg={2}>
                  <div className="ul-form__radio-inline">
                    <label className=" ul-radio__position radio radio-primary form-check-inline">
                      <input type="radio" name="radio" />
                      <span className="ul-form__radio-font">Sales Person</span>
                      <span className="checkmark" />
                    </label>

                    <label className="ul-radio__position radio radio-primary">
                      <input type="radio" name="radio" />
                      <span className="ul-form__radio-font">Customer</span>
                      <span className="checkmark" />
                    </label>
                  </div>

                  <FormText className="ul-form__text form-text">Please enter your address</FormText>
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

          {/* 3 Columns Form Layout */}
          <Card>
            <Card.Header>
              <Card.Title className="mb-0"> 3 Columns Form Layout</Card.Title>
            </Card.Header>

            <Card.Body>
              <Row>
                <FormGroup controlId="name" className="col-md-4">
                  <FormLabel className="ul-form__label">Full Name:</FormLabel>
                  <FormControl type="text" placeholder="Enter full name" />
                  <FormText className="ul-form__text">Please enter your full name</FormText>
                </FormGroup>

                <FormGroup controlId="contact" className="col-md-4">
                  <FormLabel className="ul-form__label">Contact Number:</FormLabel>
                  <FormControl type="text" placeholder="Enter Contact Number" />
                  <FormText className="ul-form__text">Please enter your contact number</FormText>
                </FormGroup>

                <FormGroup controlId="username" className="col-md-4">
                  <FormLabel className="ul-form__label">Username:</FormLabel>

                  <InputGroup className="mb-2">
                    <InputGroup.Text>
                      <i className="i-Checked-User" />
                    </InputGroup.Text>

                    <FormControl type="text" placeholder="Username" />
                  </InputGroup>

                  <FormText className="ul-form__text">Please enter your username</FormText>
                </FormGroup>
              </Row>

              <div className="custom-separator" />

              <Row>
                <FormGroup controlId="contact" className="col-md-4">
                  <FormLabel className="ul-form__label">Contact:</FormLabel>
                  <FormControl
                    type="text"
                    className="form-control"
                    placeholder="Enter contact number"
                  />
                  <FormText className="ul-form__text">Please enter your contact</FormText>
                </FormGroup>

                <FormGroup className="col-md-4">
                  <FormLabel className="ul-form__label">Fax:</FormLabel>

                  <div className="input-right-icon">
                    <FormControl type="text" placeholder="Fax Number" />
                    <span className="span-right-input-icon">
                      <i className="ul-form__icon i-Information" />
                    </span>
                  </div>

                  <FormText className="ul-form__text">Please enter your Fax</FormText>
                </FormGroup>

                <FormGroup className="col-md-4">
                  <FormLabel className="ul-form__label">Address:</FormLabel>

                  <div className="input-right-icon">
                    <FormControl type="text" placeholder="Enter your address" />
                    <span className="span-right-input-icon">
                      <i className="ul-form__icon i-Map-Marker" />
                    </span>
                  </div>

                  <FormText className="ul-form__text">Please enter your address</FormText>
                </FormGroup>
              </Row>

              <div className="custom-separator" />

              <Row>
                <FormGroup className="col-md-4 me-2">
                  <FormLabel className="ul-form__label">Postcode:</FormLabel>
                  <div className="input-right-icon">
                    <FormControl type="text" placeholder="Enter your postcode" />
                    <span className="span-right-input-icon">
                      <i className="ul-form__icon i-New-Mail" />
                    </span>
                  </div>

                  <FormText className="ul-form__text">Please enter your postcode</FormText>
                </FormGroup>

                <FormGroup className="col-md-4">
                  <FormLabel className="ul-form__label">User Group:</FormLabel>

                  <div className="ul-form__radio-inline">
                    <label className=" ul-radio__position radio radio-primary form-check-inline">
                      <input type="radio" name="radio" />
                      <span className="ul-form__radio-font">Sales Person</span>
                      <span className="checkmark" />
                    </label>

                    <label className="ul-radio__position radio radio-primary">
                      <input type="radio" name="radio" />
                      <span className="ul-form__radio-font">Customer</span>
                      <span className="checkmark" />
                    </label>
                  </div>

                  <FormText className="ul-form__text">Please select user group</FormText>
                </FormGroup>
              </Row>
            </Card.Body>

            <Card.Footer>
              <button type="button" className="btn  btn-primary m-1">
                Save
              </button>
              <button type="button" className="btn btn-outline-secondary m-1">
                Cancel
              </button>
            </Card.Footer>
          </Card>

          <Card className="ul-card__margin-25">
            <Card.Header>
              <Card.Title className="mb-0">3 Columns Horizontal Form Layout</Card.Title>
            </Card.Header>

            <Card.Body>
              <FormGroup className="row">
                <label
                  htmlFor="staticEmail19"
                  className="ul-form__label ul-form--margin col-lg-1 col-form-label">
                  Full Name:
                </label>

                <Col lg={3}>
                  <FormControl type="text" placeholder="Enter full name" />
                  <FormText className="ul-form__text">Please enter your full name</FormText>
                </Col>

                <label
                  htmlFor="staticEmail20"
                  className="ul-form__label ul-form--margin col-lg-1 col-form-label">
                  Email:
                </label>

                <Col lg={3}>
                  <FormControl type="email" placeholder="Enter Your Email" />
                  <FormText className="ul-form__text">Please enter your Email</FormText>
                </Col>

                <label
                  htmlFor="staticEmail21"
                  className="ul-form__label ul-form--margin col-lg-1 col-form-label">
                  Username:
                </label>

                <Col lg={3}>
                  <InputGroup className="mb-2">
                    <InputGroup.Text>
                      <i className="i-Checked-User" />
                    </InputGroup.Text>

                    <FormControl type="text" placeholder="Username" />
                  </InputGroup>

                  <FormText className="ul-form__text">Please enter your Email</FormText>
                </Col>
              </FormGroup>

              <div className="custom-separator" />

              <FormGroup className="row">
                <label
                  htmlFor="staticEmail22"
                  className="ul-form__label ul-form--margin col-lg-1 col-form-label">
                  Contact:
                </label>

                <Col lg={3}>
                  <FormControl type="text" id="staticEmail22" placeholder="Enter contact number" />
                  <FormText className="ul-form__text">Please enter your contact number</FormText>
                </Col>

                <label
                  htmlFor="staticEmail23"
                  className="ul-form__label ul-form--margin col-lg-1 col-form-label">
                  Fax:
                </label>

                <Col lg={3}>
                  <div className="input-right-icon">
                    <FormControl type="text" id="staticEmail23" placeholder="Enter your fax" />

                    <span className="span-right-input-icon">
                      <i className="ul-form__icon i-Information" />
                    </span>
                  </div>

                  <FormText className="ul-form__text">Please enter your fax</FormText>
                </Col>

                <label
                  htmlFor="staticEmail24"
                  className="ul-form__label ul-form--margin col-lg-1 col-form-label">
                  Address:
                </label>

                <Col lg={3}>
                  <div className="input-right-icon">
                    <FormControl type="text" id="staticEmail24" placeholder="Enter your address" />
                    <span className="span-right-input-icon">
                      <i className="ul-form__icon i-Map-Marker" />
                    </span>
                  </div>

                  <FormText className="ul-form__text">Please enter your address</FormText>
                </Col>
              </FormGroup>

              <div className="custom-separator" />

              <FormGroup className="row">
                <label
                  htmlFor="staticEmail25"
                  className="ul-form__label ul-form--margin col-lg-1 col-form-label">
                  Postcode:
                </label>

                <Col lg={2}>
                  <div className="input-right-icon">
                    <FormControl type="text" id="inputEmail25" placeholder="Enter your postcode" />

                    <span className="span-right-input-icon">
                      <i className="ul-form__icon i-New-Mail" />
                    </span>
                  </div>

                  <FormText className="ul-form__text">Please enter your postcode</FormText>
                </Col>

                <label
                  htmlFor="staticEmail26"
                  className="ul-form__label ul-form--margin col-lg-1 col-form-label">
                  User Group:
                </label>

                <Col lg={2}>
                  <div className="ul-form__radio-inline">
                    <label className=" ul-radio__position radio radio-primary form-check-inline">
                      <input type="radio" name="radio" />
                      <span className="ul-form__radio-font">Sales Person</span>
                      <span className="checkmark" />
                    </label>

                    <label className="ul-radio__position radio radio-primary">
                      <input type="radio" name="radio" />
                      <span className="ul-form__radio-font">Customer</span>
                      <span className="checkmark" />
                    </label>
                  </div>

                  <FormText className="ul-form__text">Please enter your address</FormText>
                </Col>
              </FormGroup>
            </Card.Body>

            <Card.Footer>
              <Button variant="primary" className="m-1">
                Save
              </Button>

              <Button variant="secondary" className="m-1">
                Cancel
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
