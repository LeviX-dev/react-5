import { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";

import Breadcrumb from "app/components/Breadcrumb";

export default function FormValidation() {
  const [state] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    city: "",
    cardNumber: "4444444444444444",
    state: "",
    password: "",
    repassword: "",
    zip: "",
    agree: false,
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

  return (
    <div>
      <Breadcrumb
        routeSegments={[{ name: "Forms", path: "/forms" }, { name: "Form Validation" }]}
      />

      <Row>
        <Col md={8}>
          <p>
            For custom Bootstrap form validation messages, you’ll need to add the{" "}
            <code>novalidate</code> boolean attribute to your
            <code>form</code>. This disables the browser default feedback tooltips, but still
            provides access to the form validation APIs in JavaScript. Try to submit the form below;
            our JavaScript will intercept the submit button and relay feedback to you. When
            attempting to submit, you’ll see the <code>:invalid</code> and
            <code>:valid</code> styles applied to your form controls.
          </p>
          <Card body className="mb-4">
            <Formik
              initialValues={state}
              onSubmit={handleSubmit}
              validationSchema={basicFormSchema}>
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => {
                return (
                  <form className="needs-validation" onSubmit={handleSubmit} noValidate>
                    <Row>
                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="firstName"
                        className="mb-3 position-relative">
                        <Form.Label>First name</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          placeholder="First name"
                          name="firstName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.firstName}
                          isValid={touched.firstName && !errors.firstName}
                          isInvalid={touched.firstName && errors.firstName}
                        />

                        <Form.Control.Feedback type="invalid">
                          First name is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="lastName"
                        className="mb-3 position-relative">
                        <Form.Label>Last name</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.lastName}
                          isValid={touched.lastName && !errors.lastName}
                          isInvalid={touched.lastName && errors.lastName}
                        />

                        <Form.Control.Feedback type="invalid">
                          Last name is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="username"
                        className="mb-3 position-relative">
                        <Form.Label>Username</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="username"
                          placeholder="Username"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.username}
                          isValid={touched.username && !errors.username}
                          isInvalid={touched.username && errors.username}
                        />

                        <Form.Control.Feedback type="invalid">
                          Username is required
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>

                    <Row>
                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="userName"
                        className="mb-3 position-relative">
                        <Form.Label>City</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="city"
                          placeholder="City"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.city}
                          isValid={touched.city && !errors.city}
                          isInvalid={touched.city && errors.city}
                        />

                        <Form.Control.Feedback type="invalid">
                          City is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="state"
                        className="mb-3 position-relative">
                        <Form.Label>State</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="state"
                          placeholder="State"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.state}
                          isInvalid={touched.state && errors.state}
                          isValid={touched.state && !errors.state}
                        />

                        <Form.Control.Feedback type="invalid">
                          State is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="zip"
                        className="mb-3 position-relative">
                        <Form.Label>Zip</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="zip"
                          placeholder="Zip"
                          value={values.zip}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          isInvalid={touched.zip && errors.zip}
                          isValid={touched.zip && !errors.zip}
                        />

                        <Form.Control.Feedback type="invalid">
                          Zip is required
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>

                    <Form.Group controlId="agree" className="position-relative mb-3">
                      <Form.Check
                        type="checkbox"
                        name="agree"
                        label="Agree to terms and conditions"
                        onBlur={handleBlur}
                        value={values.agree}
                        onChange={handleChange}
                        checked={values.agree}
                        isInvalid={touched.agree && errors.agree}
                        required
                        feedbackType="invalid"
                        feedback="You must agree before submitting"
                      />
                    </Form.Group>

                    <Button type="submit">Submit form</Button>
                  </form>
                );
              }}
            </Formik>
          </Card>
        </Col>

        <Col md={8}>
          <Card body>
            <Card.Title>Tooltip message</Card.Title>

            <Formik
              initialValues={state}
              onSubmit={handleSubmit}
              validationSchema={basicFormSchema}>
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => {
                return (
                  <form className="needs-validation" onSubmit={handleSubmit} noValidate>
                    <Row>
                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="firstName"
                        className="mb-3 position-relative">
                        <Form.Label>First name</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          placeholder="First name"
                          name="firstName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.firstName}
                          isInvalid={touched.firstName && errors.firstName}
                        />

                        <Form.Control.Feedback tooltip type="invalid">
                          First name is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="lastName"
                        className="mb-3 position-relative">
                        <Form.Label>Last name</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.lastName}
                          isInvalid={touched.lastName && errors.lastName}
                        />

                        <Form.Control.Feedback tooltip type="invalid">
                          Last name is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="username"
                        className="mb-3 position-relative">
                        <Form.Label>Username</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="username"
                          placeholder="Username"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.username}
                          isInvalid={touched.username && errors.username}
                        />

                        <Form.Control.Feedback tooltip type="invalid">
                          Username is required
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>

                    <Row>
                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="userName"
                        className="mb-3 position-relative">
                        <Form.Label>City</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="city"
                          placeholder="City"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.city}
                          isInvalid={touched.city && errors.city}
                        />

                        <Form.Control.Feedback tooltip type="invalid">
                          City is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="state"
                        className="mb-3 position-relative">
                        <Form.Label>State</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="state"
                          placeholder="State"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.state}
                          isInvalid={touched.state && errors.state}
                        />

                        <Form.Control.Feedback tooltip type="invalid">
                          State is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        md={4}
                        controlId="zip"
                        className="mb-3 position-relative">
                        <Form.Label>Zip</Form.Label>

                        <Form.Control
                          required
                          type="text"
                          name="zip"
                          placeholder="Zip"
                          value={values.zip}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          isInvalid={touched.zip && errors.zip}
                        />

                        <Form.Control.Feedback tooltip type="invalid">
                          Zip is required
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>

                    <Form.Group controlId="agree" className="position-relative mb-3">
                      <Form.Check
                        type="checkbox"
                        name="agree"
                        label="Agree to terms and conditions"
                        onBlur={handleBlur}
                        value={values.agree}
                        onChange={handleChange}
                        checked={values.agree}
                        isInvalid={touched.agree && errors.agree}
                        required
                        feedbackTooltip
                        feedbackType="invalid"
                        feedback="You must agree before submitting"
                      />
                    </Form.Group>

                    <Button type="submit">Submit form</Button>
                  </form>
                );
              }}
            </Formik>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

const basicFormSchema = yup.object().shape({
  firstName: yup.string().required("first name is required"),
  lastName: yup.string().required("last name is required"),
  username: yup.string().required("select any option"),
  city: yup.string().required("birthDay is required"),
  zip: yup.string().required("zip is required"),
  agree: yup.bool().oneOf([true], "terms must be accepted"),
  state: yup.string().required("Required")
});
