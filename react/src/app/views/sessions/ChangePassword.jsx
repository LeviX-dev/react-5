import { Link, useNavigate } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";
import { useSelector } from "react-redux";

import api from "app/services/api";
import TextField from "app/components/sessions/TextField";

const validationSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required")
    .test("not-same", "New password must be different from current password", function (value) {
      return value !== this.parent.currentPassword;
    }),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ChangePassword() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if not logged in
  if (!user?.user_id) {
    navigate("/sessions/signin", { replace: true });
    return null;
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      await api.post("/api/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setSuccessMessage("✅ Password changed successfully!");
      
      // Reset form and redirect after 2 seconds
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to change password"
      );
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
                  <img src="/assets/images/logo.png" alt="Logo" />
                </div>

                <h1 className="mb-3 text-18">Change Password</h1>
                <p className="text-muted mb-4">
                  Update your password to keep your account secure
                </p>

                {successMessage && (
                  <div className="alert alert-success">{successMessage}</div>
                )}
                {errorMessage && (
                  <div className="alert alert-danger">{errorMessage}</div>
                )}

                <Formik
                  onSubmit={handleSubmit}
                  initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }}
                  validationSchema={validationSchema}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit: onSubmit,
                  }) => (
                    <form onSubmit={onSubmit}>
                      <TextField
                        type="password"
                        name="currentPassword"
                        label="Current Password"
                        onBlur={handleBlur}
                        value={values.currentPassword}
                        onChange={handleChange}
                        helperText={errors.currentPassword}
                        error={
                          errors.currentPassword && touched.currentPassword
                        }
                      />

                      <TextField
                        type="password"
                        name="newPassword"
                        label="New Password"
                        onBlur={handleBlur}
                        value={values.newPassword}
                        onChange={handleChange}
                        helperText={errors.newPassword}
                        error={errors.newPassword && touched.newPassword}
                      />

                      <TextField
                        type="password"
                        name="confirmPassword"
                        label="Confirm New Password"
                        onBlur={handleBlur}
                        value={values.confirmPassword}
                        onChange={handleChange}
                        helperText={errors.confirmPassword}
                        error={
                          errors.confirmPassword && touched.confirmPassword
                        }
                      />

                      <button
                        className="btn btn-rounded btn-primary w-100 mt-3"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Change Password"}
                      </button>
                    </form>
                  )}
                </Formik>

                <div className="mt-3 text-center">
                  <Link to="/" className="text-muted">
                    Go back to dashboard
                  </Link>
                </div>
              </div>
            </Col>

            <Col md={6} className="text-center auth-cover">
              <div className="pe-3 auth-right">
                <h2 className="mb-3">Keep Your Account Secure</h2>
                <p className="text-muted">
                  Regularly changing your password helps protect your account
                  from unauthorized access.
                </p>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
