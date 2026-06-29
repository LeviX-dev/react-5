import { Row, Col, Card, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import api from "app/services/api";

export default function MyGeneral({ employee }) {
  const [departments,  setDepartments]  = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations,    setLocations]    = useState([]);
  const [companies,    setCompanies]    = useState([]);
  const [shifts,       setShifts]       = useState([]);
  const [roles,        setRoles]        = useState([]);

  const statuses       = ["Active", "Inactive", "Terminated"];
  const attendanceTypes = ["Daily", "Hourly"];

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", staffId: "", username: "",
    email: "", phone: "", address: "", city: "", state: "",
    zip: "", country: "", dob: "", gender: "", maritalStatus: "",
    company: "", department: "", designation: "", role: "",
    status: "", officeShift: "", dateOfJoining: "", dateOfLeaving: "",
    attendanceType: "", location: "",
  });

  const fetchCompanies    = async () => { try { const r = await api.get("/api/company/all");                          setCompanies(r.data.data || []);          } catch (e) { console.error(e); } };
  const fetchDepartments  = async () => { try { const r = await api.get("/api/departments");                          setDepartments(r.data.departments || []);  } catch (e) { console.error(e); } };
  const fetchDesignations = async (deptId) => { if (!deptId) { setDesignations([]); return; } try { const r = await api.get(`/api/designations?department_id=${deptId}`); setDesignations(r.data.designations || []); } catch (e) { console.error(e); } };
  const fetchShifts       = async (compId) => { try { const url = compId ? `/api/office-shifts?company_id=${compId}` : "/api/office-shifts"; const r = await api.get(url); setShifts(r.data.data || []); } catch (e) { console.error(e); } };
  const fetchRoles        = async () => { try { const r = await api.get("/api/roles/all");                            setRoles(r.data.data || []);               } catch (e) { console.error(e); } };
  const fetchLocations    = async () => { try { const r = await api.get("/api/geo-locations");                        setLocations(r.data.data || []);           } catch (e) { console.error(e); } };

  useEffect(() => {
    if (!employee) return;

    const loadData = async () => {
      await Promise.all([fetchCompanies(), fetchDepartments(), fetchRoles(), fetchLocations()]);
      if (employee.company_id)    await fetchShifts(employee.company_id);
      if (employee.department_id) await fetchDesignations(employee.department_id);

      setFormData({
        firstName:     employee.first_name || "",
        lastName:      employee.last_name  || "",
        staffId:       employee.staff_id   || "",
        username:      employee.username   || "",
        email:         employee.email      || "",
        phone:         employee.contact_no || "",
        address:       employee.address    || "",
        city:          employee.city       || "",
        state:         employee.state      || "",
        zip:           employee.zip_code   || "",
        country:       employee.country    || "",
        dob:           employee.date_of_birth?.split("T")[0]  || "",
        gender:        employee.gender         || "",
        maritalStatus: employee.marital_status || "",
        company:       employee.company_id?.toString()     || "",
        department:    employee.department_id?.toString()  || "",
        designation:   employee.designation_id?.toString() || "",
        role:          employee.role_users_id?.toString()  || "",
        status:        employee.is_active === 1 ? "Active" : employee.is_active === 0 ? "Inactive" : "",
        officeShift:   employee.office_shift_id?.toString() || "",
        dateOfJoining: employee.joining_date?.split("T")[0] || "",
        dateOfLeaving: employee.exit_date?.split("T")[0]    || "",
        attendanceType: employee.attendance_type || "",
        location:       employee.location_id?.toString()   || "",
      });
    };

    loadData();
  }, [employee]);

  const filteredDepartments = departments.filter(
    (d) => !formData.company || d.company_id === parseInt(formData.company)
  );

  return (
    <Row>
      <Col md={12}>
        <Card body>
          <h5 className="mb-3">Basic Information</h5>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>First Name</Form.Label>
              <Form.Control value={formData.firstName} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Last Name</Form.Label>
              <Form.Control value={formData.lastName} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Staff ID</Form.Label>
              <Form.Control value={formData.staffId} disabled />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Username</Form.Label>
              <Form.Control value={formData.username} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={formData.email} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Phone</Form.Label>
              <Form.Control value={formData.phone} disabled />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Country</Form.Label>
              <Form.Control value={formData.country} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>State / Province</Form.Label>
              <Form.Control value={formData.state} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>City</Form.Label>
              <Form.Control value={formData.city} disabled />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Address</Form.Label>
              <Form.Control value={formData.address} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Zip</Form.Label>
              <Form.Control value={formData.zip} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Date Of Birth</Form.Label>
              <Form.Control type="date" value={formData.dob} disabled />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Gender</Form.Label>
              <Form.Control value={formData.gender} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Attendance Type</Form.Label>
              <Form.Control value={formData.attendanceType} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Geo Location</Form.Label>
              <Form.Control
                value={locations.find((l) => String(l.value) === String(formData.location))?.label || formData.location}
                disabled
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Company</Form.Label>
              <Form.Control
                value={companies.find((c) => String(c.id) === String(formData.company))?.company_name || formData.company}
                disabled
              />
            </Col>
            <Col md={4}>
              <Form.Label>Department</Form.Label>
              <Form.Control
                value={filteredDepartments.find((d) => String(d.id) === String(formData.department))?.department_name || formData.department}
                disabled
              />
            </Col>
            <Col md={4}>
              <Form.Label>Designation</Form.Label>
              <Form.Control
                value={designations.find((d) => String(d.id) === String(formData.designation))?.designation_name || formData.designation}
                disabled
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Role</Form.Label>
              <Form.Control
                value={roles.find((r) => String(r.id) === String(formData.role))?.name || formData.role}
                disabled
              />
            </Col>
            <Col md={4}>
              <Form.Label>Office Shift</Form.Label>
              <Form.Control
                value={shifts.find((s) => String(s.id) === String(formData.officeShift))?.Shift || formData.officeShift}
                disabled
              />
            </Col>
            <Col md={4}>
              <Form.Label>Date Of Joining</Form.Label>
              <Form.Control type="date" value={formData.dateOfJoining} disabled />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Status</Form.Label>
              <Form.Control value={formData.status} disabled />
            </Col>
            <Col md={4}>
              <Form.Label>Date Of Leaving</Form.Label>
              <Form.Control type="date" value={formData.dateOfLeaving} disabled />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}
