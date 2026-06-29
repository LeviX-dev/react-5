// import { Link, useNavigate } from "react-router-dom";
// import { Card, Col, Row } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { Formik } from "formik";
// import * as yup from "yup";

// import jwtAuthService from "app/services/jwtAuthService";
// import { loginWithEmailAndPassword, userLoggedIn } from "app/redux/auth/authSlice";

// import TextField from "app/components/sessions/TextField";
// import SocialButtons from "app/components/sessions/SocialButtons";
// import { useState } from "react";

// const validationSchema = yup.object().shape({
//   email: yup.string().email("Invalid email").required("Email is required"),
//   password: yup
//     .string()
//     .min(8, "Password must be 8 character long")
//     .required("Password is required")
// });

// export default function Signin() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const { isAuthenticated, user } = useSelector((state) => state.auth);

//   const initialValues = { email: "watson@example.com", password: "faskfjhaksdflkjafs" };

//   const handleSubmit = async (value) => {
//     try {
//       setLoading(true)
//       const result = await jwtAuthService.loginWithEmailAndPassword(value);
//       if (result.token) {
//         dispatch(userLoggedIn({ accessToken: result.token, user: result }));
//         setLoading(false)
//         navigate("/");

//       } else {
//         throw new Error({ message: 'Invalid username or password' });
//       }
//     } catch (error) {
//       setLoading(false)
//       window.alert('Invalid username or password');
//     }
//   };

//   return (
//     <div className="auth-layout-wrap">
//       <div className="auth-content">
//         <Card className="o-hidden">
//           <Row>
//             <Col md={6}>
//               <div className="p-4">
//                 <div className="auth-logo text-center mb-4">
//                   <img src="/assets/images/logo.png" alt="Gull" />
//                 </div>

//                 <h1 className="mb-3 text-18">Sign In</h1>

//                 <Formik
//                   onSubmit={handleSubmit}
//                   initialValues={initialValues}
//                   validationSchema={validationSchema}>
//                   {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
//                     <form onSubmit={handleSubmit}>
//                       <TextField
//                         type="email"
//                         name="email"
//                         label="Email address"
//                         onBlur={handleBlur}
//                         value={values.email}
//                         onChange={handleChange}
//                         helperText={errors.email}
//                         error={errors.email && touched.email}
//                       />

//                       <TextField
//                         type="password"
//                         name="password"
//                         label="Password"
//                         onBlur={handleBlur}
//                         value={values.password}
//                         onChange={handleChange}
//                         helperText={errors.password}
//                         error={errors.password && touched.password}
//                       />

//                       <button type="submit" disabled={loading} className="btn btn-rounded btn-primary w-100 my-1 mt-2">
//                         {loading ? 'Pleas wait' : 'Sign In'}
//                       </button>
//                     </form>
//                   )}
//                 </Formik>

//                 <div className="mt-3 text-center">
//                   <Link to="/sessions/forgot-password" className="text-muted">
//                     Forgot Password?
//                   </Link>
//                 </div>
//               </div>
//             </Col>

//             <Col md={6} className="text-center auth-cover">
//               <div className="pe-3 auth-right">
//                 <SocialButtons
//                   routeUrl="/sessions/signup"
//                   googleHandler={() => alert("google")}
//                   facebookHandler={() => alert("facebook")}
//                 />
//               </div>
//             </Col>
//           </Row>
//         </Card>
//       </div>
//     </div>
//   );
// }

import { Link, useNavigate } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Formik } from "formik";
import * as yup from "yup";
import api from "app/services/api";

import { userLoggedIn } from "app/redux/auth/authSlice";

import TextField from "app/components/sessions/TextField";
import SocialButtons from "app/components/sessions/SocialButtons";
import { useState } from "react";

const validationSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(8, "Password must be 8 character long")
    .required("Password is required"),
});

export default function Signin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    username: "",
    password: "",
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      alert("Login attempt", JSON.stringify(values));
      console.log("🚀 Attempting login with values:", values);
      const response = await api.post("/api/auth/login", values, {
        withCredentials: true,
      });


      // 🔥 ADD THIS (IMPORTANT)
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }

      // ✅ Redux (already correct)
      if (response.data.user) {
        dispatch(
          userLoggedIn({
            accessToken: response.data.accessToken,
            user: response.data.user,
          }),
        );

          const role = String(response.data.user.role || "").toLowerCase();
          navigate(role === "admin" ? "/dashboard/v1" : "/dashboard/user", { replace: true });
      }
    } catch (error) {

      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

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
            <Col md={6}>
              <div className="p-4">
                <div className="auth-logo text-center mb-4">
                  <img src="/assets/images/logo.png" alt="Gull" />
                </div>

                <h1 className="mb-3 text-18">Sign In</h1>

                <Formik
                  onSubmit={handleSubmit}
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <TextField
                        type="text"
                        name="username"
                        label="Username"
                        onBlur={handleBlur}
                        value={values.username}
                        onChange={handleChange}
                        helperText={errors.username}
                        error={errors.username && touched.username}
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

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-rounded btn-primary w-100 my-1 mt-2"
                      >
                        {loading ? "Please wait" : "Sign In"}
                      </button>
                    </form>
                  )}
                </Formik>

                <div className="mt-3 text-center">
                  <Link to="/sessions/forgot-password" className="text-muted">
                    Forgot Password?
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
