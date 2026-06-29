import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import { useEffect, useMemo, useState } from "react";

import api from "app/services/api";
import TextField from "app/components/sessions/TextField";
import SocialButtons from "app/components/sessions/SocialButtons";

const validationSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be 8 character long")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => (searchParams.get("token") || "").trim(), [searchParams]);

  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        setErrorMessage("Reset token is missing.");
        return;
      }

      try {
        await api.get("/api/auth/reset-password/verify", {
          params: { token },
        });
        setTokenStatus("valid");
      } catch (error) {
        setTokenStatus("invalid");
        setErrorMessage(error.response?.data?.message || "Invalid or expired reset token");
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setMessage("");
      setErrorMessage("");

      await api.post("/api/auth/reset-password", {
        token,
        newPassword: values.newPassword,
      });

      setMessage("Password updated successfully. Redirecting to sign in...");
      setTimeout(() => navigate("/sessions/signin"), 1200);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to reset password");
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

                <h1 className="mb-3 text-18">Reset Password</h1>

                {tokenStatus === "checking" && <div className="alert alert-info">Checking reset token...</div>}
                {message && <div className="alert alert-success">{message}</div>}
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                {tokenStatus === "valid" && (
                  <Formik
                    onSubmit={handleSubmit}
                    initialValues={{ newPassword: "", confirmPassword: "" }}
                    validationSchema={validationSchema}
                  >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit: onSubmit }) => (
                      <form onSubmit={onSubmit}>
                        <TextField
                          type="password"
                          name="newPassword"
                          label="New password"
                          onBlur={handleBlur}
                          value={values.newPassword}
                          onChange={handleChange}
                          helperText={errors.newPassword}
                          error={errors.newPassword && touched.newPassword}
                        />

                        <TextField
                          type="password"
                          name="confirmPassword"
                          label="Confirm password"
                          onBlur={handleBlur}
                          value={values.confirmPassword}
                          onChange={handleChange}
                          helperText={errors.confirmPassword}
                          error={errors.confirmPassword && touched.confirmPassword}
                        />

                        <button className="btn btn-rounded btn-primary w-100 mt-2" type="submit" disabled={loading}>
                          {loading ? "Please wait" : "Update Password"}
                        </button>
                      </form>
                    )}
                  </Formik>
                )}

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