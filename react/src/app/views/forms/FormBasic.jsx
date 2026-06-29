import * as yup from "yup";
import { Formik } from "formik";
import { useState } from "react";
import DateTime from "react-datetime";
import { DateRange } from "react-date-range";
import { Form, Button, Row, Col, Card, FormGroup, FormLabel, FormControl } from "react-bootstrap";

import Breadcrumb from "app/components/Breadcrumb";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function FormBasic() {
  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    select: "",
    birthDay: "",
    cardNumber: "4444444444444444",
    email: "",
    password: "",
    repassword: "",
    website: "",
    switch: false,
    checkbox1: "",
    checkbox2: "",
    radio: "",
    range: {
      startDate: new Date(),
      endDate: (() => {
        let date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
      })()
    }
  });

  const handleSubmit = (values, { setSubmitting }) => {
    console.log(values);
  };

  const handleDateRangeChange = (range) => {
    let { startDate, endDate } = range;
    setState((prevState) => ({
      ...prevState,
      range: { startDate: startDate.toDate(), endDate: endDate.toDate() }
    }));
  };

  return (
    <section>
      <Breadcrumb routeSegments={[{ name: "Forms", path: "/forms" }, { name: "Basic Form" }]} />

      <Row>
        <Col md={12}>
          <Card body className="mb-4">
            <div className="card-title mb-3">Form Inputs</div>

            <Formik
              initialValues={state}
              onSubmit={handleSubmit}
              validationSchema={basicFormSchema}>
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 form-group mb-3">
                      <label htmlFor="firstName">First name</label>
                      <input
                        id="firstName"
                        name="firstName"
                        className="form-control"
                        placeholder="Enter your first name"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.firstName}
                      />
                      {errors.firstName && touched.firstName && (
                        <div className="text-danger mt-1 ml-2">{errors.firstName}</div>
                      )}
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <label htmlFor="lastName">Last name</label>
                      <input
                        id="lastName"
                        name="lastName"
                        className="form-control"
                        placeholder="Enter your last name"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.lastName}
                      />
                      {errors.lastName && touched.lastName && (
                        <div className="text-danger mt-1 ml-2">{errors.lastName}</div>
                      )}
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <label htmlFor="email">Email address</label>
                      <input
                        name="email"
                        id="email"
                        className="form-control"
                        placeholder="xox@xmail.com"
                        type="email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                      />
                      {errors.email && touched.email && (
                        <div className="text-danger mt-1 ml-2">{errors.email}</div>
                      )}
                      <small id="emailHelp" className="form-text text-muted">
                        We'll never share your email with anyone else.
                      </small>
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <label htmlFor="phone">Phone</label>
                      <input
                        className="form-control"
                        id="phone"
                        name="phone"
                        placeholder="Enter phone"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.phone}
                      />
                      {errors.phone && touched.phone && (
                        <div className="text-danger mt-1 ml-2">{errors.phone}</div>
                      )}
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <label htmlFor="cardNumber">Cradit card number</label>
                      <input
                        className="form-control"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="4444-4444-4444-4444"
                        type="number"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.cardNumber}
                      />
                      {errors.cardNumber && touched.cardNumber && (
                        <div className="text-danger mt-1 ml-2">{errors.cardNumber}</div>
                      )}
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <label htmlFor="website">Website</label>
                      <input
                        className="form-control"
                        id="website"
                        name="website"
                        placeholder="Web address"
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <label htmlFor="picker2">Birth date</label>
                      <DateTime
                        name="birthDay"
                        onChange={(date) => {
                          handleChange({
                            target: { name: "birthDay", value: date.toDate() }
                          });
                        }}
                      />
                      {errors.birthDay && touched.birthDay && (
                        <div className="text-danger mt-1 ml-2">{errors.birthDay}</div>
                      )}
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <label htmlFor="picker1">Select</label>
                      <select
                        id="picker1"
                        className="form-control"
                        name="select"
                        value={values.select}
                        onChange={handleChange}
                        onBlur={handleBlur}>
                        <option value="opt1">Option 1</option>
                        <option value="opt2">Option 2</option>
                        <option value="opt3">Option 3</option>
                      </select>
                      {errors.select && touched.select && (
                        <div className="text-danger mt-1 ml-2">{errors.select}</div>
                      )}
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <Form.Check
                        name="switch"
                        onChange={handleChange}
                        value={values.switch}
                        type="switch"
                        id="custom-switch"
                        label="I accept the terms & conditions"
                      />
                      <Form.Check
                        name="checkbox1"
                        onChange={handleChange}
                        value="check123"
                        checked={values.checkbox1 && values.checkbox1.includes("check123")}
                        type="checkbox"
                        id="check1"
                        label="I accept the policies"
                      />
                      <Form.Check
                        name="checkbox2"
                        onChange={handleChange}
                        value="check321"
                        checked={values.checkbox2 && values.checkbox2.includes("check321")}
                        type="checkbox"
                        id="check2"
                        label="Subscribe for future news letters"
                      />
                    </div>

                    <div className="col-md-6 form-group mb-3">
                      <fieldset onChange={handleChange}>
                        <Form.Group>
                          <Form.Label as="legend">Choose any option</Form.Label>
                          <Form.Check
                            type="radio"
                            label="first radio"
                            name="radio"
                            id="formHorizontalRadios1"
                            value="radio1"
                          />
                          <Form.Check
                            type="radio"
                            label="second radio"
                            name="radio"
                            id="formHorizontalRadios2"
                            value="radio2"
                          />
                          <Form.Check
                            type="radio"
                            label="third radio"
                            name="radio"
                            id="formHorizontalRadios3"
                            value="radio3"
                          />
                        </Form.Group>
                      </fieldset>
                    </div>

                    <Col xs={12} className="form-group mb-3">
                      <label htmlFor="picker2">Birth date</label>
                      <DateRange
                        startDate={new Date(state.range.startDate).toLocaleDateString("en-GB")}
                        endDate={new Date(state.range.endDate).toLocaleDateString("en-GB")}
                        onChange={handleDateRangeChange}
                      />
                    </Col>

                    <Col>
                      <Button type="submit">Submit</Button>
                    </Col>
                  </div>
                </form>
              )}
            </Formik>
          </Card>
        </Col>

        <Col md={12}>
          <Card body className="mb-4">
            <Card.Title>Form Inputs Rounded</Card.Title>

            <form>
              <Row>
                <FormGroup as={Col} md={6} className="mb-3">
                  <FormLabel htmlFor="firstName2">First name</FormLabel>
                  <FormControl
                    type="text"
                    id="firstName2"
                    className="form-control-rounded"
                    placeholder="Enter your first name"
                  />
                </FormGroup>

                <FormGroup as={Col} md={6} className="mb-3">
                  <FormLabel htmlFor="lastName2">Last name</FormLabel>
                  <FormControl
                    type="text"
                    className="form-control-rounded"
                    id="lastName2"
                    placeholder="Enter your last name"
                  />
                </FormGroup>

                <FormGroup as={Col} md={6} className="mb-3">
                  <FormLabel htmlFor="exampleInputEmail2">Email address</FormLabel>
                  <FormControl
                    type="email"
                    className="form-control-rounded"
                    id="exampleInputEmail2"
                    placeholder="Enter email"
                  />
                </FormGroup>

                <FormGroup as={Col} md={6} className="mb-3">
                  <FormLabel htmlFor="phone1">Phone</FormLabel>
                  <FormControl
                    className="form-control-rounded"
                    id="phone1"
                    placeholder="Enter phone"
                  />
                </FormGroup>

                <FormGroup as={Col} md={6} className="mb-3">
                  <FormLabel htmlFor="credit2">Credit card number</FormLabel>
                  <FormControl className="form-control-rounded" id="credit2" placeholder="Card" />
                </FormGroup>

                <FormGroup as={Col} md={6} className="mb-3">
                  <FormLabel htmlFor="website2">Website</FormLabel>
                  <FormControl
                    className="form-control-rounded"
                    id="website2"
                    placeholder="Web address"
                  />
                </FormGroup>

                <FormGroup as={Col} md={6} className="mb-3">
                  <label htmlFor="picker3">Birth date</label>
                  <DateTime className="form-control-rounded" />
                </FormGroup>

                <FormGroup as={Col} md={6} className="mb-3">
                  <label htmlFor="picker1">Select</label>
                  <select className="form-control form-control-rounded">
                    <option>Option 1</option>
                    <option>Option 1</option>
                    <option>Option 1</option>
                  </select>
                </FormGroup>

                <Col xs={12}>
                  <Button>Submit</Button>
                </Col>
              </Row>
            </form>
          </Card>
        </Col>

        <Col md={12}>
          <Card body className="mb-4">
            <Card.Title>Switch</Card.Title>

            <Form>
              <Form.Check type="switch" id="custom-switch 5" label="Check this switch" />
              <Form.Check
                disabled
                type="switch"
                label="disabled switch"
                id="disabled-custom-switch"
              />
            </Form>
          </Card>
        </Col>
      </Row>
    </section>
  );
}

const basicFormSchema = yup.object().shape({
  firstName: yup.string().required("first name is required"),
  lastName: yup.string().required("last name is required"),
  phone: yup.string().required("select any option"),
  select: yup.string().required("select any option"),
  birthDay: yup.string().required("birthDay is required"),
  cardNumber: yup
    .number()
    .test("card-validator", "Invlid card", (value) =>
      value && value.toString().length !== 16 ? false : true
    )
    .required("Card number is required"),
  email: yup.string().email("Invalid email").required("email is required"),
  checkbox1: yup.string().required("Required"),
  checkbox2: yup.string().required("Required"),
  switch: yup.string().required("Required")
  // password: yup
  //   .string()
  //   .min(8, "Password must be 8 character long")
  //   .required("password is required"),
  // repassword: yup
  //   .string()
  //   .required("repeat password")
  //   .oneOf([yup.ref("password")], "Passwords must match")
});
