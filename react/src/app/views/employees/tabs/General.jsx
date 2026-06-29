import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import api from "app/services/api";

// ─── Validation helpers ────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidPhone = (val) => /^\d{7,15}$/.test(val.replace(/[\s\-().+]/g, ""));
const isDateNotFuture = (val) => val && new Date(val) <= new Date();
const isValidDate = (val) => val && !isNaN(new Date(val).getTime());
// ────────────────────────────────────────────────────────────────────────────

export default function General({ employee }) {

 
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [roles, setRoles] = useState([]);

  const statuses = ["Active", "Inactive", "Terminated"];
  const attendanceTypes = ["Daily", "Hourly"];
  const attendanceMethods = ["manual", "geofence", "location_tracking"];
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    staffId: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    company: "",
    department: "",
    designation: "",
    role: "",
    status: "",
    officeShift: "",
    dateOfJoining: "",
    dateOfLeaving: "",
    attendanceType: "",
    location: "",
    attendanceMethod: "",
  });

  // ---------- 1. Fetch all companies (no filter needed) ----------
  const fetchCompanies = async () => {
    try {
      const res = await api.get("/api/company/all");
      setCompanies(res.data.data || []);
    } catch (e) {
      console.error("Companies fetch error:", e);
    }
  };

  // ---------- 2. Fetch all departments (client-side filter by company) ----------
  const fetchDepartments = async () => {
    try {
      const res = await api.get("/api/departments");
      const depts = res.data.departments || [];
      setDepartments(depts);
    } catch (e) {
      console.error("Departments fetch error:", e);
    }
  };

  // ---------- 3. Fetch designations filtered by department ----------
  const fetchDesignations = async (departmentId) => {
    if (!departmentId) {
      setDesignations([]);
      return;
    }
    try {
      const res = await api.get(`/api/designations?department_id=${departmentId}`);
      setDesignations(res.data.designations || []);
    } catch (e) {
      console.error("Designations fetch error:", e);
    }
  };

  // ---------- 4. Fetch office shifts (optionally filtered by company) ----------
  const fetchShifts = async (companyId) => {
    try {
      const url = companyId ? `/api/office-shifts?company_id=${companyId}` : "/api/office-shifts";
      const res = await api.get(url);
      setShifts(res.data.data || []);
    } catch (e) {
      console.error("Shifts fetch error:", e);
    }
  };

  // ---------- 5. Fetch roles ----------
  const fetchRoles = async () => {
    try {
      const res = await api.get("/api/roles/all");
      setRoles(res.data.data || []);
    } catch (e) {
      console.error("Roles fetch error:", e);
    }
  };

  // ---------- 6. Fetch geo locations ----------
  const fetchLocations = async () => {
    try {
      const res = await api.get("/api/geo-locations");
      setLocations(res.data.data || []);
    } catch (e) {
      console.error("Locations fetch error:", e);
    }
  };

  // ---------- Load all data when employee prop changes ----------
  useEffect(() => {
    if (!employee) return;

    const loadData = async () => {
      await Promise.all([
        fetchCompanies(),
        fetchDepartments(),
        fetchRoles(),
        fetchLocations(),
      ]);

      if (employee.company_id) {
        await fetchShifts(employee.company_id);
      }

      if (employee.department_id) {
        await fetchDesignations(employee.department_id);
      }

      setFormData({
        firstName: employee.first_name || "",
        lastName: employee.last_name || "",
        staffId: employee.staff_id || "",
        username: employee.username || "",
        email: employee.email || "",
        phone: employee.contact_no || "",
        address: employee.address || "",
        city: employee.city || "",
        state: employee.state || "",
        zip: employee.zip_code || "",
        country: employee.country || "",
        dob: employee.date_of_birth?.split("T")[0] || "",
        gender: employee.gender || "",
        maritalStatus: employee.marital_status || "",
        company: employee.company_id?.toString() || "",
        department: employee.department_id?.toString() || "",
        designation: employee.designation_id?.toString() || "",
        role: employee.role_users_id?.toString() || "",
        status:
          employee.is_active === 1
            ? "Active"
            : employee.is_active === 0
            ? "Inactive"
            : "",
        officeShift: employee.office_shift_id?.toString() || "",
        dateOfJoining: employee.joining_date?.split("T")[0] || "",
        dateOfLeaving: employee.exit_date?.split("T")[0] || "",
        attendanceType: employee.attendance_type || "",
        location: employee.location_id?.toString() || "",
        attendanceMethod: employee.attendance_method || "manual",
      });
      console.log("📋 Form Data Loaded - attendance_method:", employee.attendance_method);
    };

    loadData();
  }, [employee]);

  // ---------- Handle form changes + cascading dropdowns ----------
  const handleChange = (e) => {

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "company") {
      fetchShifts(value);
      setFormData((prev) => ({ ...prev, department: "", designation: "" }));
      setDesignations([]);
    }

    if (name === "department") {
      fetchDesignations(value);
      setFormData((prev) => ({ ...prev, designation: "" }));
    }
  };

  // ---------- Validate form before save ----------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    else if (formData.firstName.trim().length > 50)
      newErrors.firstName = "First name must not exceed 50 characters";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required";
    else if (formData.lastName.trim().length > 50)
      newErrors.lastName = "Last name must not exceed 50 characters";

    if (!formData.staffId.trim())
      newErrors.staffId = "Staff ID is required";
    else if (formData.staffId.trim().length > 50)
      newErrors.staffId = "Staff ID must not exceed 50 characters";

    if (!formData.username.trim())
      newErrors.username = "Username is required";
    else if (formData.username.trim().length < 3)
      newErrors.username = "Username must be at least 3 characters";
    else if (formData.username.trim().length > 50)
      newErrors.username = "Username must not exceed 50 characters";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim()))
      newErrors.email = "Please enter a valid email address";

    if (formData.phone && !isValidPhone(formData.phone))
      newErrors.phone = "Phone must be 7–15 digits";

    if (formData.dob) {
      if (!isValidDate(formData.dob))
        newErrors.dob = "Please enter a valid date";
      else if (!isDateNotFuture(formData.dob))
        newErrors.dob = "Date of birth cannot be a future date";
    }

    if (!formData.dateOfJoining)
      newErrors.dateOfJoining = "Date of joining is required";
    else if (!isValidDate(formData.dateOfJoining))
      newErrors.dateOfJoining = "Please enter a valid date";
    else if (new Date(formData.dateOfJoining) > new Date())
      newErrors.dateOfJoining = "Joining date cannot be a future date";

    if (formData.dateOfLeaving && formData.dateOfJoining) {
      if (new Date(formData.dateOfLeaving) < new Date(formData.dateOfJoining))
        newErrors.dateOfLeaving = "Leaving date must be on or after joining date";
    }

    if (!formData.company) newErrors.company = "Company is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.designation) newErrors.designation = "Designation is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.officeShift) newErrors.officeShift = "Office shift is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.attendanceType)
      newErrors.attendanceType = "Attendance type is required";
    if (!formData.location) newErrors.location = "Geo Location is required";
    if (!formData.attendanceMethod)
      newErrors.attendanceMethod = "Attendance method is required";

    const validGenders = ["Male", "Female", "Other"];
    if (formData.gender && !validGenders.includes(formData.gender))
      newErrors.gender = "Please select a valid gender";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Save employee ----------
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        staff_id: formData.staffId,
        username: formData.username,
        email: formData.email,
        contact_no: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip,
        country: formData.country,
        date_of_birth: formData.dob || null,
        gender: formData.gender || null,
        marital_status: formData.maritalStatus || null,
        company_id: formData.company || null,
        department_id: formData.department || null,
        designation_id: formData.designation || null,
        role_users_id: formData.role || null,
        is_active:
          formData.status === "Active" ? 1 : formData.status === "Inactive" ? 0 : null,
        office_shift_id: formData.officeShift || null,
        joining_date: formData.dateOfJoining || null,
        exit_date: formData.dateOfLeaving || null,
        attendance_type: formData.attendanceType || null,
        location_id: formData.location || null,
        attendance_method: formData.attendanceMethod || null,
      };

      console.log("📤 Sending payload to API - attendance_method:", payload.attendance_method);
      await api.put(`/api/employees/${employee.id}`, payload);
      alert("Employee data saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert(err?.response?.data?.message || "Failed to save. Check console.");
    }
  };

  // ---------- Filter departments by selected company (client-side) ----------
  const filteredDepartments = departments.filter(
    (dept) => { console.log("Filtering department:", dept);
      return !formData.company || dept.company_id === parseInt(formData.company)}
  );

  // ---------- Render UI ----------
  return (
    <Row>
      <Col md={12}>
        <Card body>
          <h5 className="mb-3">Basic Information</h5>

          {/* Name & Staff ID */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                isInvalid={!!errors.firstName}
              />
              <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                isInvalid={!!errors.lastName}
              />
              <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Staff ID <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                isInvalid={!!errors.staffId}
               
              />
              <Form.Control.Feedback type="invalid">{errors.staffId}</Form.Control.Feedback>
            </Col>
          </Row>

          {/* Username, Email, Phone */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Username <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="username"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username}
               
              />
              <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
               
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                isInvalid={!!errors.phone}
               
              />
              <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
            </Col>
          </Row>

          {/* Address, City, State */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Country</Form.Label>
              <Form.Select
                name="country"
                value={formData.country}
                onChange={handleChange}
               
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>State / Province</Form.Label>
              <Form.Select
                name="state"
                value={formData.state || ""}
                onChange={handleChange}
               
              >
                <option value="">Select State</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Gujarat">Gujarat</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>City</Form.Label>
              <Form.Control
                name="city"
                value={formData.city}
                onChange={handleChange}
               
              />
            </Col>
          </Row>

          {/* Zip, Address, DOB */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Address</Form.Label>
              <Form.Control
                name="address"
                value={formData.address}
                onChange={handleChange}
               
              />
            </Col>
            <Col md={4}>
              <Form.Label>Zip</Form.Label>
              <Form.Control
                name="zip"
                value={formData.zip}
                onChange={handleChange}
               
              />
            </Col>
            <Col md={4}>
              <Form.Label>Date Of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                isInvalid={!!errors.dob}
               
              />
              <Form.Control.Feedback type="invalid">{errors.dob}</Form.Control.Feedback>
            </Col>
          </Row>

          {/* Gender, Attendance Type, Geo Location */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
               
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Attendance Type <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="attendanceType"
                value={formData.attendanceType}
                onChange={handleChange}
                isInvalid={!!errors.attendanceType}
               
              >
                <option value="">Select Type</option>
                {attendanceTypes.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.attendanceType}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Geo Location <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="location"
                value={String(formData.location || "")}
                onChange={handleChange}
                isInvalid={!!errors.location}
               
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.value} value={String(loc.value)}>{loc.label}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
              {formData.attendanceMethod === "geofence" && !formData.location && (
                <small className="text-warning" style={{ display: "block", marginTop: "4px" }}>
                  ⚠️ Geo-fence method requires a location to be selected.
                </small>
              )}
            </Col>
          </Row>

          {/* Attendance Method */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Attendance Method <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="attendanceMethod"
                value={formData.attendanceMethod}
                onChange={handleChange}
                isInvalid={!!errors.attendanceMethod}
              >
                <option value="">Select Method</option>
                {attendanceMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.attendanceMethod}</Form.Control.Feedback>
            </Col>
          </Row>

          {/* Company, Department, Designation */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Company <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="company"
                value={formData.company}
                onChange={handleChange}
                isInvalid={!!errors.company}
               
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.company}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Department <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                isInvalid={!!errors.department}
               
              >
                <option value="">Select Department</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>{d.department_name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.department}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                isInvalid={!!errors.designation}
               
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>{d.designation_name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.designation}</Form.Control.Feedback>
            </Col>
          </Row>

          {/* Role, Office Shift, DOJ */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Role <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                isInvalid={!!errors.role}
               
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Office Shift <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="officeShift"
                value={formData.officeShift}
                onChange={handleChange}
                isInvalid={!!errors.officeShift}
               
              >
                <option value="">Select Shift</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>{s.Shift}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.officeShift}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Date Of Joining <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                isInvalid={!!errors.dateOfJoining}
               
              />
              <Form.Control.Feedback type="invalid">{errors.dateOfJoining}</Form.Control.Feedback>
            </Col>
          </Row>

          {/* Status, Date Of Leaving */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Status <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                isInvalid={!!errors.status}
              >
                <option value="">Select Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.status}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label>Date Of Leaving</Form.Label>
              <Form.Control
                type="date"
                name="dateOfLeaving"
                value={formData.dateOfLeaving}
                onChange={handleChange}
                isInvalid={!!errors.dateOfLeaving}
              />
              <Form.Control.Feedback type="invalid">{errors.dateOfLeaving}</Form.Control.Feedback>
            </Col>
          </Row>

       
            <div className="text-end">
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
      
        </Card>
      </Col>
    </Row>
  );
}