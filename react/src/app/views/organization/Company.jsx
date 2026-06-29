// import { useState, useEffect } from "react";
// import { Card, Row, Col, Form, Button } from "react-bootstrap";
// import Breadcrumb from "app/components/Breadcrumb";
// import axios from "axios";
// import api from "app/services/api";

// export default function CompanyInfo() {
//   const [isEdit, setIsEdit] = useState(false);
//   const [companyId, setCompanyId] = useState(null);
//   const [locationId, setLocationId] = useState(null);
//   const [formData, setFormData] = useState({
//     company: "",
//     companyType: "",
//     tradingName: "",
//     registrationNumber: "",
//     contactNumber: "",
//     email: "",
//     website: "",
//     taxNumber: "",
//     addressLine: "",
//     city: "",
//     state: "",
//     country: "",
//     zip: "",
//   });

//   // FETCH FROM DB
//   useEffect(() => {
//     fetchCompany();
//   }, []);

//   const fetchCompany = async () => {
//     try {
//       const res = await api.get("/api/companies");

//       if (res.data.companies.length > 0) {
//         const data = res.data.companies[1];

//         setCompanyId(data.id);
//         setLocationId(data.location_id);

//         setFormData({
//           company: data.company_name || "",
//           companyType: data.company_type_id || "",
//           tradingName: data.trading_name || "",
//           registrationNumber: data.registration_no || "",
//           contactNumber: data.contact_no || "",
//           email: data.email || "",
//           website: data.website || "",
//           taxNumber: data.tax_no || "",
//           addressLine: data.addressLine || "",
//           city: data.city || "",
//           state: data.state || "",
//           country: data.country || "",
//           zip: data.zip || "",
//         });
//       }
//     } catch (error) {
//       console.log("Error fetching company:", error);
//     }
//   };
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSave = async () => {
//     try {
//       await api.put(`/api/companies/${companyId}`, {
//         company_name: formData.company,
//         company_type_id: Number(formData.companyType) || 1,
//         trading_name: formData.tradingName,
//         registration_no: formData.registrationNumber,
//         contact_no: formData.contactNumber,
//         email: formData.email,
//         website: formData.website,
//         tax_no: formData.taxNumber,

//         // ✅ add these
//         addressLine: formData.addressLine,
//         city: formData.city,
//         state: formData.state,
//         country: formData.country,
//         zip: formData.zip,

//         company_logo: "",
//         is_active: 1,
//       });

//       setIsEdit(false);
//       fetchCompany();
//     } catch (error) {
//       console.log("Update error:", error);
//     }
//   };
//   return (
//     <section>
//       <Breadcrumb
//         routeSegments={[
//           { name: "Dashboard", path: "/" },
//           { name: "Organization", path: "/organization/company" },
//           { name: "Company Info" },
//         ]}
//       />

//       <Row>
//         <Col lg={12}>
//           <Card>
//             <Card.Header
//               style={{
//                 backgroundColor: "#E0D6EB",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Card.Title className="mb-0">Company Information</Card.Title>

//               {!isEdit ? (
//                 <Button
//                   size="sm"
//                   style={{ backgroundColor: "#663399", border: "none" }}
//                   onClick={() => setIsEdit(true)}
//                 >
//                   <i className="i-Edit me-1"></i> Edit
//                 </Button>
//               ) : (
//                 <div className="d-flex gap-2">
//                   <Button size="sm" variant="success" onClick={handleSave}>
//                     Save
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     onClick={() => setIsEdit(false)}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               )}
//             </Card.Header>

//             <Card.Body>
//               <table className="table table-bordered align-middle">
//                 <tbody>
//                   <tr>
//                     <th width="30%">Company</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           name="company"
//                           value={formData.company}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.company
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>Company Type</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           name="companyType"
//                           value={formData.companyType}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.companyType || "—"
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>Trading Name</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           name="tradingName"
//                           value={formData.tradingName}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.tradingName || "—"
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>Registration Number</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           name="registrationNumber"
//                           value={formData.registrationNumber}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.registrationNumber || "—"
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>Contact Number</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           name="contactNumber"
//                           value={formData.contactNumber}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.contactNumber
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>Email</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           type="email"
//                           name="email"
//                           value={formData.email}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.email
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>Website</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           name="website"
//                           value={formData.website}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.website || "—"
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>Tax Number</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           name="taxNumber"
//                           value={formData.taxNumber}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.taxNumber
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>Address</th>
//                     <td>
//                       {isEdit ? (
//                         <>
//                           <Form.Control
//                             className="mb-2"
//                             name="addressLine"
//                             value={formData.addressLine}
//                             onChange={handleChange}
//                           />
//                           <Form.Control
//                             className="mb-2"
//                             name="city"
//                             value={formData.city}
//                             onChange={handleChange}
//                           />
//                           <Form.Control
//                             className="mb-2"
//                             name="state"
//                             value={formData.state}
//                             onChange={handleChange}
//                           />
//                           <Form.Control
//                             className="mb-2"
//                             name="country"
//                             value={formData.country}
//                             onChange={handleChange}
//                           />
//                         </>
//                       ) : (
//                         <>
//                           {formData.addressLine} <br />
//                           {formData.city} <br />
//                           {formData.state} <br />
//                           {formData.country}
//                         </>
//                       )}
//                     </td>
//                   </tr>

//                   <tr>
//                     <th>ZIP</th>
//                     <td>
//                       {isEdit ? (
//                         <Form.Control
//                           name="zip"
//                           value={formData.zip}
//                           onChange={handleChange}
//                         />
//                       ) : (
//                         formData.zip
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </section>
//   );
// }

import { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// Rule: lightweight RFC 5322-style email check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Rule: phone 7–15 digits
const isValidPhone = (val) => /^\d{7,15}$/.test(val.replace(/[\s\-().+]/g, ""));


export default function CompanyInfo() {
  const [isEdit, setIsEdit] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [locationId, setLocationId] = useState(null);
  // Per-field validation error messages
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    company: "",
    companyType: "",
    tradingName: "",
    registrationNumber: "",
    contactNumber: "",
    email: "",
    website: "",
    taxNumber: "",
    addressLine: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });

  // FETCH FROM DB
  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      // ✅ CHANGED API
      const res = await api.get("/api/companies/me");

      const data = res.data.company; // ✅ FIXED

      if (data) {
        setCompanyId(data.id);
        setLocationId(data.location_id);

        setFormData({
          company: data.company_name || "",
          companyType: data.company_type_id || "",
          tradingName: data.trading_name || "",
          registrationNumber: data.registration_no || "",
          contactNumber: data.contact_no || "",
          email: data.email || "",
          website: data.website || "",
          taxNumber: data.tax_no || "",
          addressLine: data.addressLine || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          zip: data.zip || "",
        });
      }
    } catch (error) {
      console.log("Error fetching company:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ---------- Validate before save ----------
  const validateForm = () => {
    const errs = {};
    // Rule: company name is required
    if (!formData.company.trim()) errs.company = "Company name is required";
    // Rule: email required and must be valid format
    if (!formData.email.trim())
      errs.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim()))
      errs.email = "Please enter a valid email address";
    // Rule: phone optional but 7–15 digits if provided
    if (formData.contactNumber && !isValidPhone(formData.contactNumber))
      errs.contactNumber = "Phone must be 7–15 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      // ⚠️ still using old update API (as per your request no change)
      await api.put(`/api/companies/${companyId}`, {
        company_name: formData.company,
        company_type_id: Number(formData.companyType) || 1,
        trading_name: formData.tradingName,
        registration_no: formData.registrationNumber,
        contact_no: formData.contactNumber,
        email: formData.email,
        website: formData.website,
        tax_no: formData.taxNumber,

        addressLine: formData.addressLine,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip: formData.zip,

        company_logo: "",
        is_active: 1,
      });

      setIsEdit(false);
      fetchCompany();
    } catch (error) {
      console.log("Update error:", error);
    }
  };

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Organization", path: "/organization/company" },
          { name: "Company Info" },
        ]}
      />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header
              style={{
                backgroundColor: "#E0D6EB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Card.Title className="mb-0">Company Information</Card.Title>

              {!isEdit ? (
                <Button
                  size="sm"
                  style={{ backgroundColor: "#663399", border: "none" }}
                  onClick={() => setIsEdit(true)}
                >
                  <i className="i-Edit me-1"></i> Edit
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button size="sm" variant="success" onClick={handleSave}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEdit(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card.Header>

            <Card.Body>
              <table className="table table-bordered align-middle">
                <tbody>
                  <tr>
                    <th width="30%">Company</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.company
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Company Type</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          name="companyType"
                          value={formData.companyType}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.companyType || "—"
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Trading Name</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          name="tradingName"
                          value={formData.tradingName}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.tradingName || "—"
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Registration Number</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.registrationNumber || "—"
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Contact Number</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.contactNumber
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Email</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.email
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Website</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.website || "—"
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Tax Number</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.taxNumber
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Address</th>
                    <td>
                      {isEdit ? (
                        <>
                          <Form.Control
                            className="mb-2"
                            name="addressLine"
                            value={formData.addressLine}
                            onChange={handleChange}
                          />
                          <Form.Control
                            className="mb-2"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                          />
                          <Form.Control
                            className="mb-2"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                          />
                          <Form.Control
                            className="mb-2"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                          />
                        </>
                      ) : (
                        <>
                          {formData.addressLine} <br />
                          {formData.city} <br />
                          {formData.state} <br />
                          {formData.country}
                        </>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>ZIP</th>
                    <td>
                      {isEdit ? (
                        <Form.Control
                          name="zip"
                          value={formData.zip}
                          onChange={handleChange}
                        />
                      ) : (
                        formData.zip
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
