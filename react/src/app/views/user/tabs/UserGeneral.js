// import { Row, Col, Card, Form, Button } from "react-bootstrap";
// import { useEffect, useState } from "react";
// import api from "app/services/api";

// export default function UserGeneral({ user }) {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     username: "",
//     email: "",
//     phone: "",
//     role: "",
//     status: "",
//   });

//   // ✅ load data
//   useEffect(() => {
//     if (!user) return;

//     setFormData({
//       firstName: user.first_name || "",
//       lastName: user.last_name || "",
//       username: user.username || "",
//       email: user.email || "",
//       phone: user.contact_no || "",
//       role: user.role_users_id || "",
//       status: user.is_active === 1 ? "Active" : "Inactive",
//     });
//   }, [user]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // ✅ SAVE USER
//   const handleSave = async () => {
//     try {
//       const payload = {
//         first_name: formData.firstName,
//         last_name: formData.lastName,
//         username: formData.username,
//         email: formData.email,
//         contact_no: formData.phone,
//         role_users_id: formData.role,
//         is_active: formData.status === "Active" ? 1 : 0,
//       };

//       await api.put(`/api/users/${user.id}`, payload);

//       alert("User updated ✅");
//     } catch (err) {
//       console.error(err);
//       alert("Update failed ❌");
//     }
//   };

//   return (
//     <Row>
//       <Col md={12}>
//         <Card body>
//           <h5>User Information</h5>

//           <Row className="mb-3">
//             <Col md={4}>
//               <Form.Label>First Name</Form.Label>
//               <Form.Control
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//               />
//             </Col>

//             <Col md={4}>
//               <Form.Label>Last Name</Form.Label>
//               <Form.Control
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//               />
//             </Col>

//             <Col md={4}>
//               <Form.Label>Username</Form.Label>
//               <Form.Control
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//               />
//             </Col>
//           </Row>

//           <Row className="mb-3">
//             <Col md={4}>
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//             </Col>

//             <Col md={4}>
//               <Form.Label>Phone</Form.Label>
//               <Form.Control
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//               />
//             </Col>

//             <Col md={4}>
//               <Form.Label>Status</Form.Label>
//               <Form.Select
//                 name="status"
//                 value={formData.status}
//                 onChange={handleChange}
//               >
//                 <option>Active</option>
//                 <option>Inactive</option>
//               </Form.Select>
//             </Col>
//           </Row>

//           <div className="text-end">
//             <Button onClick={handleSave}>Save</Button>
//           </div>
//         </Card>
//       </Col>
//     </Row>
//   );
// }

import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "app/services/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidPhone = (val) => /^\d{7,15}$/.test(val.replace(/[\s\-().+]/g, ""));

export default function UserGeneral({ user }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    password: "", // 🔥 NEW
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.contact_no || "",
      role: user.role_users_id || "",
      status: user.is_active === 1 ? "Active" : "Inactive",
      password: "", // empty always
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.username.trim()) errs.username = "Username is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim()))
      errs.email = "Please enter a valid email address";
    if (formData.phone && !isValidPhone(formData.phone))
      errs.phone = "Phone must be 7-15 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ✅ SAVE USER + PASSWORD
  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      // 🔥 USER UPDATE
      await api.put(`/api/users/${user.id}`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        email: formData.email,
        contact_no: formData.phone,
        role_users_id: formData.role,
        is_active: formData.status === "Active" ? 1 : 0,
      });

      // 🔥 PASSWORD UPDATE (only if filled)
      if (formData.password) {
        await api.put(`/api/users/${user.id}/password`, {
          password: formData.password,
        });
      }

      alert("User updated successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Update failed ❌");
    }
  };

  return (
    <Row>
      <Col md={12}>
        <Card body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>User Information</h5>

            {/* 🔥 BACK BUTTON */}
            <Button
              variant="secondary"
              onClick={() => navigate("/user/UserList")}
            >
              ← Back
            </Button>
          </div>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstName"
                value={formData.firstName}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, firstName: "" }));
                }}
                isInvalid={!!errors.firstName}
              />
              <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="lastName"
                value={formData.lastName}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, lastName: "" }));
                }}
                isInvalid={!!errors.lastName}
              />
              <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                value={formData.username}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, username: "" }));
                }}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Inactive</option>
              </Form.Select>
            </Col>
          </Row>

          {/* 🔥 PASSWORD FIELD */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep same"
              />
            </Col>
          </Row>

          <div className="text-end">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
