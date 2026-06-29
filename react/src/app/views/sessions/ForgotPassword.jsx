import { Link } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";

import api from "app/services/api";
import TextField from "app/components/sessions/TextField";
import SocialButtons from "app/components/sessions/SocialButtons";

const validationSchema = yup.object().shape({
  // Rule: valid email address required
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email must not exceed 254 characters")
    .required("Email is required"),
});

export default function ForgotPassword() {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const initialValues = { email: "" };

  const handleSubmit = async (value) => {
    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      await api.post("/api/auth/forgot-password", {
        email: value.email,
      });

      setSuccessMessage("Check your email for password reset instructions.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout-wrap">
      <div className="auth-content">
        <Card className="o-hidden">
          <Row>
            <Col md={6}>
              <div className="p-4">
                <div className="auth-logo text-center mb-4">
                  <img src="/assets/images/logo.png" alt="Gull" />
                </div>

                <h1 className="mb-3 text-18">Forgot Password</h1>

                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <Formik
                  onSubmit={handleSubmit}
                  initialValues={initialValues}
                  validationSchema={validationSchema}>
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                      <TextField
                        type="email"
                        name="email"
                        label="Email address"
                        onBlur={handleBlur}
                        value={values.email}
                        onChange={handleChange}
                        helperText={errors.email}
                        error={errors.email && touched.email}
                      />

                      <button className="btn btn-rounded btn-primary w-100 mt-2" type="submit" disabled={loading}>
                        {loading ? "Please wait" : "Reset Password"}
                      </button>
                    </form>
                  )}
                </Formik>

                <div className="mt-3 text-center">
                  <Link to="/sessions/signin" className="text-muted">
                    Go back to signin
                  </Link>
                </div>
              </div>
            </Col>

            <Col md={6} className="text-center auth-cover">
              <div className="pe-3 auth-right">
                <SocialButtons
                  routeUrl="/sessions/signup"
                  googleHandler={() => alert("google")}
                  facebookHandler={() => alert("facebook")}
                />
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}