import { Card, Col, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import TextField from "app/components/sessions/TextField";
import SocialButtons from "app/components/sessions/SocialButtons";
import api from "app/services/api";

const validationSchema = yup.object().shape({
  username: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be 8 character long")
    .required("Password is required"),
  rePassword: yup
    .string()
    .required("Repeat Password is required")
    .oneOf([yup.ref("password")], "Passwords must match")
});

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
    username: "",
    password: "",
    rePassword: ""
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      await api.post("/api/auth/signup", {
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      window.alert("Account created successfully. Please sign in.");
      navigate("/sessions/signin");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to create account. Please try again.";
      window.alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout-wrap">
      <div className="auth-content">
        <Card className="o-hidden">
          <Row>
            <Col md={6} className="text-center auth-cover">
              <div className="ps-3 auth-right">
                <div className="auth-logo text-center mt-4">
                  <img src="/assets/images/logo.png" alt="Gull" />
                </div>

                <div className="w-100 h-100 justify-content-center d-flex flex-column">
                  <SocialButtons
                    isLogin
                    routeUrl="/sessions/signin"
                    googleHandler={() => alert("google")}
                    facebookHandler={() => alert("facebook")}
                  />
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="p-4">
                <h1 className="mb-3 text-18">Sign Up</h1>

                <Formik
                  onSubmit={handleSubmit}
                  initialValues={initialValues}
                  validationSchema={validationSchema}>
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                      <TextField
                        type="text"
                        name="username"
                        label="Your name"
                        onBlur={handleBlur}
                        value={values.username}
                        onChange={handleChange}
                        helperText={errors.username}
                        error={errors.username && touched.username}
                      />

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

                      <TextField
                        type="password"
                        name="password"
                        label="Password"
                        onBlur={handleBlur}
                        value={values.password}
                        onChange={handleChange}
                        helperText={errors.password}
                        error={errors.password && touched.password}
                      />

                      <TextField
                        type="password"
                        name="rePassword"
                        label="Retype password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.rePassword}
                        helperText={errors.rePassword}
                        error={errors.rePassword && touched.rePassword}
                      />

                      <button type="submit" disabled={loading} className="btn btn-primary w-100 my-1 btn-rounded mt-3">
                        {loading ? "Please wait" : "Sign Up"}
                      </button>
                    </form>
                  )}
                </Formik>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}