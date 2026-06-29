import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, X, ChevronDown, AlertTriangle } from "lucide-react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Table,
  Alert,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

// ─── Validation helpers ────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidPhone = (val) => /^\d{7,15}$/.test(val.replace(/[\s\-().+]/g, ""));
const isValidDate = (val) => val && !isNaN(new Date(val).getTime());
const isNotFuture = (val) => val && new Date(val) <= new Date();

// ─── ColumnFilter component ────────────────────────────────────────────────
function ColumnFilter({ label, filterKey, options, selected, activeFilter, setActiveFilter, onToggle, onClearKey }) {
  const isOpen = activeFilter === filterKey;
  const hasValue = selected.length > 0;
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Position the fixed dropdown relative to the trigger button
  useEffect(() => {
    if (isOpen && triggerRef.current && dropdownRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${rect.bottom + 6}px`;
      dropdownRef.current.style.left = `${rect.left}px`;
    }
  }, [isOpen]);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontWeight: 600, fontSize: 13, color: "#3d2459", letterSpacing: "0.02em" }}>{label}</span>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setActiveFilter(isOpen ? null : filterKey);
        }}
        style={{
          border: hasValue ? "1.5px solid #663399" : "1.5px solid #d1c4e9",
          background: hasValue ? "#f3eeff" : "#faf8ff",
          borderRadius: 6,
          padding: "2px 6px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          transition: "all 0.15s",
          outline: "none",
          boxShadow: isOpen ? "0 0 0 3px rgba(102,51,153,0.15)" : "none",
        }}
      >
        <Filter size={11} style={{ color: hasValue ? "#663399" : "#9e9e9e" }} />
        {hasValue && (
          <span style={{
            background: "#663399",
            color: "#fff",
            borderRadius: "50%",
            fontSize: 10,
            width: 15,
            height: 15,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}>
            {selected.length}
          </span>
        )}
        <ChevronDown
          size={10}
          style={{
            color: hasValue ? "#663399" : "#9e9e9e",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            background: "#fff",
            border: "1px solid #e8e0f3",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(102,51,153,0.13), 0 2px 8px rgba(0,0,0,0.07)",
            padding: "6px 0",
            minWidth: 190,
            zIndex: 9999,
            animation: "filterDropIn 0.15s ease",
          }}
        >
          <style>{`
            @keyframes filterDropIn {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: "6px 14px 8px",
            borderBottom: "1px solid #f0eaf8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#663399", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {label}
            </span>
            {hasValue && (
              <button
                onClick={() => { onClearKey(filterKey); setActiveFilter(null); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#c62828",
                  fontSize: 11,
                  cursor: "pointer",
                  padding: "0 2px",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  fontWeight: 500,
                }}
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: "auto", padding: "4px 0" }}>
            {options.length === 0 ? (
              <div style={{ padding: "10px 14px", color: "#bbb", fontSize: 12 }}>No options available</div>
            ) : (
              options.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "7px 14px",
                      cursor: "pointer",
                      fontSize: 13,
                      color: checked ? "#663399" : "#444",
                      background: checked ? "#f8f2ff" : "transparent",
                      transition: "background 0.1s",
                      fontWeight: checked ? 600 : 400,
                    }}
                    onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = "#faf7ff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = checked ? "#f8f2ff" : "transparent"; }}
                  >
                    <span style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: checked ? "none" : "2px solid #c9b8e8",
                      background: checked ? "#663399" : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}>
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(filterKey, opt)}
                      style={{ display: "none" }}
                    />
                    {opt}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Active Filter Pill ────────────────────────────────────────────────────
function FilterPill({ label, value, onRemove }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: "#f3eeff",
      border: "1px solid #d1b3f5",
      color: "#5a2d91",
      borderRadius: 20,
      padding: "3px 10px 3px 10px",
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: "nowrap",
    }}>
      <span style={{ color: "#9e7bc4", fontSize: 11 }}>{label}:</span>
      {value}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          color: "#9e7bc4",
        }}
      >
        <X size={12} />
      </button>
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function EmployeeTable() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [showEyeMenu, setShowEyeMenu] = useState(false);

  // ── Unified filter state ──
  const [activeFilter, setActiveFilter] = useState(null);
  const [filters, setFilters] = useState({ shift: [], department: [], designation: [], role: [] });
  const filterContainerRef = useRef(null);

  // ── Single outside-click handler ──
  useEffect(() => {
    const handler = (e) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFilterToggle = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const clearFilterKey = (key) => {
    setFilters((prev) => ({ ...prev, [key]: [] }));
  };

  const clearAllFilters = () => {
    setFilters({ shift: [], department: [], designation: [], role: [] });
    setActiveFilter(null);
  };

  const totalActiveFilters = Object.values(filters).flat().length;

  // ── Form / table state ──
  const [disabledCols, setDisabledCols] = useState({ employee: false, shift: false, contact: false, action: false });
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalErrors, setModalErrors] = useState({});
  const [modalImageError, setModalImageError] = useState("");
  const [modalImageFile, setModalImageFile] = useState(null);

  // ── Bulk action state ──
  const [showBulkLeaveModal, setShowBulkLeaveModal] = useState(false);
  const [showBulkSalaryModal, setShowBulkSalaryModal] = useState(false);
  const [showBulkAttendanceModal, setShowBulkAttendanceModal] = useState(false);  // ✅ NEW
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [salaryPolicies, setSalaryPolicies] = useState([]);
  const [bulkLeavePolicy, setBulkLeavePolicy] = useState("");
  const [bulkSalaryPolicy, setBulkSalaryPolicy] = useState("");
  const [bulkAttendanceType, setBulkAttendanceType] = useState("manual");  // ✅ NEW - manual/geo/location_tracking
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const initialFormData = {
    first_name: "", last_name: "", office_shift_id: "", email: "",
    contact_no: "", password: "", confirm_password: "", username: "",
    date_of_birth: "", gender: "", department_id: "", designation_id: "",
    role_users_id: "", joining_date: "", state: "", attendance_type: "",
    location_id: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  // ── Filter options derived from data ──
  const filterOptions = useMemo(() => ({
    shift:       [...new Set(users.map((u) => u.shift).filter(Boolean))],
    department:  [...new Set(users.map((u) => u.department).filter(Boolean))],
    designation: [...new Set(users.map((u) => u.designation).filter(Boolean))],
    role:        [...new Set(users.map((u) => u.role).filter(Boolean))],
  }), [users]);

  // ── Validation ──
  const validateModal = () => {
    const errs = {};
    if (!formData.first_name?.trim()) errs.first_name = "First name is required";
    else if (formData.first_name.trim().length > 50) errs.first_name = "Max 50 characters";
    if (!formData.last_name?.trim()) errs.last_name = "Last name is required";
    else if (formData.last_name.trim().length > 50) errs.last_name = "Max 50 characters";
    if (!formData.staff_id?.trim()) errs.staff_id = "Staff ID is required";
    else if (formData.staff_id.trim().length < 2) errs.staff_id = "Min 2 characters";
    else if (formData.staff_id.trim().length > 50) errs.staff_id = "Max 50 characters";
    if (!formData.email?.trim()) errs.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim())) errs.email = "Invalid email address";
    if (formData.contact_no && !isValidPhone(formData.contact_no)) errs.contact_no = "Phone must be 7–15 digits";
    if (!formData.username?.trim()) errs.username = "Username is required";
    else if (formData.username.trim().length < 3) errs.username = "Min 3 characters";
    else if (formData.username.trim().length > 50) errs.username = "Max 50 characters";
    if (!formData.password?.trim()) errs.password = "Password is required";
    else if (formData.password.trim().length < 8) errs.password = "Min 8 characters";
    if (!formData.confirm_password?.trim()) errs.confirm_password = "Required";
    else if (formData.password !== formData.confirm_password) errs.confirm_password = "Passwords must match";
    if (formData.date_of_birth) {
      if (!isValidDate(formData.date_of_birth)) errs.date_of_birth = "Invalid date";
      else if (!isNotFuture(formData.date_of_birth)) errs.date_of_birth = "Cannot be a future date";
    }
    if (!formData.joining_date) errs.joining_date = "Required";
    else if (!isValidDate(formData.joining_date)) errs.joining_date = "Invalid date";
    else if (new Date(formData.joining_date) > new Date()) errs.joining_date = "Cannot be a future date";
    if (!formData.department_id) errs.department_id = "Required";
    if (!formData.designation_id) errs.designation_id = "Required";
    if (!formData.office_shift_id) errs.office_shift_id = "Required";
    if (!formData.role_users_id) errs.role_users_id = "Required";
    if (!formData.location_id) errs.location_id = "Required";
    if (!formData.gender || !["Male", "Female"].includes(formData.gender)) errs.gender = "Select a gender";
    if (!["Daily", "Hourly"].includes(formData.attendance_type)) errs.attendance_type = "Select attendance type";
    setModalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleModalImageChange = (e) => {
    const file = e.target.files[0];
    setModalImageFile(null);
    setModalImageError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(file.type)) {
      setModalImageError("Only jpg, jpeg, png, gif allowed");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setModalImageError("Image must be less than 5MB");
      e.target.value = "";
      return;
    }
    setModalImageFile(file);
  };

  // ── API calls ──
  useEffect(() => {
    api.get("/api/company/all").then((r) => setCompanies(r.data.data || [])).catch(() => {});
    api.get("/api/departments").then((r) => setDepartments(r.data.departments || [])).catch(() => {});
    api.get("/api/office-shifts").then((r) => {
      const arr = Array.isArray(r.data) ? r.data : r.data?.data || [];
      setShifts(arr);
    }).catch(() => setShifts([]));
    api.get("/api/roles/all").then((r) => setRoles(r.data.data || [])).catch(() => {});
    api.get("/api/geo-locations").then((r) => setLocations(r.data.data || [])).catch(() => {});
    api.get("/api/leave-policy/list").then((r) => setLeavePolicies(r.data.data || [])).catch(() => {});
    api.get("/api/salary-policies").then((r) => setSalaryPolicies(r.data.data || [])).catch(() => {});
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!formData.department_id) return;
    api.get(`/api/designations?department_id=${formData.department_id}`)
      .then((r) => setDesignations(r.data.designations || []))
      .catch(() => {});
  }, [formData.department_id]);

  useEffect(() => { setCurrentPage(1); }, [search, filters]);

  const fetchEmployees = () => {
    api.get("/api/employees").then((res) => {
      const data = res.data.data || [];
      setUsers(data.map((item, ind) => ({
        ...item,
        index: ind + 1,
        shift:       item.shift       || "N/A",
        department:  item.department  || "N/A",
        designation: item.designation || "N/A",
        role:        item.role        || "N/A",
        contact:     item.email       || item.contact_no || "N/A",
      })));
    }).catch(() => {
      toast.error("Failed to fetch employees");
      setUsers([]);
    });
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Delete "${item.employee}"?`)) return;
    api.delete(`/api/employees/${item.id}`)
      .then(() => { toast.success("Deleted"); fetchEmployees(); })
      .catch(() => toast.error("Failed to delete"));
  };

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = item.is_active === 1 ? 0 : 1;
      await api.put(`/api/employees/${item.id}/status`, { is_active: newStatus });
      setUsers((prev) => prev.map((u) => u.id === item.id ? { ...u, is_active: newStatus } : u));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ── Filtered + paginated data ──
  const filteredUsers = users.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || item.employee?.toLowerCase().includes(q);
    const matchesShift       = !filters.shift.length       || filters.shift.includes(item.shift);
    const matchesDepartment  = !filters.department.length  || filters.department.includes(item.department);
    const matchesDesignation = !filters.designation.length || filters.designation.includes(item.designation);
    const matchesRole        = !filters.role.length        || filters.role.includes(item.role);
    return matchesSearch && matchesShift && matchesDepartment && matchesDesignation && matchesRole;
  });

  const totalRows   = filteredUsers.length;
  const totalPages  = rowsPerPage >= totalRows ? 1 : Math.ceil(totalRows / rowsPerPage);
  const startIndex  = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  // ── Bulk apply handlers ──
  const handleBulkApplyLeave = async () => {
    if (!bulkLeavePolicy) return;
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await api.post("/api/leave-policy/bulk-assign", {
        employee_ids: selectedRows,
        policy_id: Number(bulkLeavePolicy),
      });
      const { success, failed } = res.data;
      setBulkResult({ type: "leave", success, failed });
      if (failed.length === 0) {
        toast.success(`Leave policy applied to ${success} employee(s)`);
        setShowBulkLeaveModal(false);
        setSelectedRows([]);
        setShowCheckbox(false);
      } else {
        toast.warn(`Applied to ${success}, failed for ${failed.length}. See details below.`);
      }
    } catch {
      toast.error("Failed to apply leave policy");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkApplySalary = async () => {
    if (!bulkSalaryPolicy) return;
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await api.post("/api/salary-policies/bulk-assign", {
        employee_ids: selectedRows,
        policy_id: Number(bulkSalaryPolicy),
      });
      const { success, failed } = res.data;
      setBulkResult({ type: "salary", success, failed });
      if (failed.length === 0) {
        toast.success(`Salary policy applied to ${success} employee(s)`);
        setShowBulkSalaryModal(false);
        setSelectedRows([]);
        setShowCheckbox(false);
      } else {
        toast.warn(`Applied to ${success}, failed for ${failed.length}. See details below.`);
      }
    } catch {
      toast.error("Failed to apply salary policy");
    } finally {
      setBulkLoading(false);
    }
  };

  // ✅ NEW: Bulk attendance method handler (updates employee table attendance_method)
  const handleBulkApplyAttendance = async () => {
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await api.post("/api/attendance/bulk-add", {
        employee_ids: selectedRows,
        method: bulkAttendanceType, // manual, geo (geofence), location_tracking
      });
      const { success, failed, attendance_method } = res.data;
      setBulkResult({ type: "attendance", success, failed });
      if (failed.length === 0) {
        toast.success(`Attendance method "${attendance_method}" applied to ${success.length} employee(s)`);
        setShowBulkAttendanceModal(false);
        setSelectedRows([]);
        setShowCheckbox(false);
        // Refresh employee list to show updated attendance_method
        fetchEmployees();
      } else {
        toast.warn(`Updated ${success.length}, failed for ${failed.length}. See details below.`);
        fetchEmployees();
      }
    } catch (err) {
      console.error("Bulk attendance method error:", err);
      toast.error(err.response?.data?.error || "Failed to update attendance method");
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Derived selection context ──
  const selectedOnThisPage = paginatedUsers.filter((u) => selectedRows.includes(u.id));
  const selectedEmployeeNames = users.filter((u) => selectedRows.includes(u.id));

  // ── Filter columns config ──
  const filterColumns = [
    { key: "shift",       label: "Shift" },
    { key: "department",  label: "Department" },
    { key: "designation", label: "Designation" },
    { key: "role",        label: "Role" },
  ];

  return (
    <section>

      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Employee", path: "/employees/EmployeesList" },
          { name: "Employee List" },
        ]}
      />

      {/* ── Toolbar Card ── */}
      <div className="mb-3">
        <Card body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            {/* Left */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Button
                className="btn-icon m-1 d-flex align-items-center text-white border-0"
                style={{ backgroundColor: "#663399" }}
                onClick={() => setShowModal(true)}
              >
                <span className="ul-btn__icon"><i className="i-Add-User text-18"></i></span>
                <span className="ul-btn__text ms-2">Add Employee</span>
              </Button>
              <Button
                className="btn-icon m-1 d-flex align-items-center border-0"
                style={{ backgroundColor: showCheckbox ? "#3d1a6e" : "#cfc7d9", color: showCheckbox ? "#fff" : "#3d2459" }}
                onClick={() => {
                  setShowCheckbox((p) => !p);
                  if (showCheckbox) setSelectedRows([]);
                }}
              >
                <span className="ul-btn__icon"><i className="i-Check text-18"></i></span>
                <span className="ul-btn__text ms-2">Bulk Actions</span>
              </Button>
            </div>

            {/* Right */}
            <div className="d-flex align-items-center border-0">
              <Button
                className="btn-icon d-flex align-items-center justify-content-center me-1"
                style={{ width: 36, height: 36, backgroundColor: "#f44336", border: "none", borderRadius: 0 }}
                title="Export PDF"
              >
                <i className="i-File-Horizontal-Text text-18 text-white"></i>
              </Button>
              <Button
                className="btn-icon d-flex align-items-center justify-content-center me-1"
                style={{ width: 36, height: 36, backgroundColor: "#ffc107", border: "none", borderRadius: 0 }}
                title="Export CSV"
              >
                <i className="i-File-CSV text-18 text-white"></i>
              </Button>

              {/* Column Visibility Dropdown */}
              <div style={{ position: "relative" }}>
                <Button
                  className="btn-icon d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36, backgroundColor: "#663399", border: "none", borderRadius: 0 }}
                  onClick={() => setShowEyeMenu(!showEyeMenu)}
                >
                  <i className="i-Eye text-18 text-white"></i>
                </Button>
                {showEyeMenu && (
                  <div style={{
                    position: "absolute",
                    top: 42,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e8e0f3",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(102,51,153,0.12)",
                    padding: "6px 0",
                    minWidth: 170,
                    zIndex: 9999,
                  }}>
                    <div style={{ padding: "6px 14px 8px", borderBottom: "1px solid #f0eaf8" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#663399", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Toggle Columns
                      </span>
                    </div>
                    {["Employee", "Shift", "Contact", "Action"].map((col) => {
                      const key = col.toLowerCase();
                      return (
                        <label
                          key={col}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            padding: "8px 14px",
                            cursor: "pointer",
                            fontSize: 13,
                            color: "#444",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!disabledCols[key]}
                            onChange={() => setDisabledCols((p) => ({ ...p, [key]: !p[key] }))}
                            style={{ accentColor: "#663399" }}
                          />
                          {col}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Table Card ── */}
      <Card body>
        <Card.Body>

          {/* ── Table Header Row ── */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Card.Title className="mb-0">Employee List</Card.Title>
              <Badge bg="secondary" className="ms-2">{totalRows} employees</Badge>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "250px", height: "36px" }}
            />
          </div>

          {/* ── Active Filter Pills ── */}
          {totalActiveFilters > 0 && (
            <div className="d-flex align-items-center flex-wrap gap-2 mb-3" style={{
              padding: "10px 14px",
              background: "#faf7ff",
              borderRadius: 8,
              border: "1px solid #e8e0f3",
            }}>
              <span style={{ fontSize: 12, color: "#9e7bc4", fontWeight: 600, marginRight: 4 }}>Filters:</span>
              {filterColumns.map(({ key, label }) =>
                filters[key].map((val) => (
                  <FilterPill
                    key={`${key}-${val}`}
                    label={label}
                    value={val}
                    onRemove={() => handleFilterToggle(key, val)}
                  />
                ))
              )}
              <button
                onClick={clearAllFilters}
                style={{
                  background: "none",
                  border: "1px solid #ef9a9a",
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 12,
                  color: "#c62828",
                  cursor: "pointer",
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <X size={11} /> Clear all
              </button>
            </div>
          )}

          {/* ── Table ── */}
          <div style={{ overflowX: "auto" }} ref={filterContainerRef}>
            <Table bordered hover style={{ minWidth: 900 }}>
              <thead style={{ background: "#cfc7d9" }}>
                <tr>
                  {showCheckbox && (
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        checked={paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedRows.includes(u.id))}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRows(paginatedUsers.map((u) => u.id));
                          else setSelectedRows([]);
                        }}
                      />
                    </th>
                  )}
                  <th>No</th>
                  {!disabledCols.employee && <th>Employee</th>}

                  {/* Filterable columns */}
                  {filterColumns.map(({ key, label }) => (
                    <th key={key}>
                      <ColumnFilter
                        label={label}
                        filterKey={key}
                        options={filterOptions[key]}
                        selected={filters[key]}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        onToggle={handleFilterToggle}
                        onClearKey={clearFilterKey}
                      />
                    </th>
                  ))}

                  {!disabledCols.contact && <th>Contact</th>}
                  <th>Status</th>
                  {!disabledCols.action && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: "center", padding: "48px 0", color: "#bbb" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>No employees match your filters</div>
                      {totalActiveFilters > 0 && (
                        <button
                          onClick={clearAllFilters}
                          style={{
                            marginTop: 12,
                            background: "none",
                            border: "1px solid #663399",
                            borderRadius: 6,
                            color: "#663399",
                            padding: "6px 16px",
                            fontSize: 13,
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((item, index) => (
                    <tr key={item.id}>
                      {showCheckbox && (
                        <td>
                          <input
                            type="checkbox"
                            style={{ accentColor: "#663399" }}
                            checked={selectedRows.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedRows((p) => [...p, item.id]);
                              else setSelectedRows((p) => p.filter((id) => id !== item.id));
                            }}
                          />
                        </td>
                      )}
                      <td>{startIndex + index + 1}</td>
                      {!disabledCols.employee && (
                        <td>{item.employee}</td>
                      )}
                      <td>{item.shift}</td>
                      <td>{item.department}</td>
                      <td>{item.designation}</td>
                      <td><Badge bg="primary">{item.role}</Badge></td>
                      {!disabledCols.contact && <td style={{ color: "#666" }}>{item.contact}</td>}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Form.Check
                            type="switch"
                            checked={item.is_active === 1}
                            onChange={() => handleToggleStatus(item)}
                          />
                          <span style={{ color: item.is_active === 1 ? "green" : "red" }}>
                            {item.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      {!disabledCols.action && (
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              style={{ width: 32, height: 32, backgroundColor: "#663399", border: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                              title="View"
                              onClick={() => navigate(`/employees/${item.id}/general`, { state: item })}
                            >
                              <i className="i-Eye text-white"></i>
                            </Button>
                            <Button
                              style={{ width: 32, height: 32, backgroundColor: "#c4302b", border: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                              title="Delete"
                              onClick={() => handleDelete(item)}
                            >
                              <i className="i-Close-Window text-white"></i>
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          <div className="d-flex justify-content-end align-items-center mt-3">
            <span className="me-2">Rows per page</span>
            <Form.Select
              value={rowsPerPage === filteredUsers.length ? "all" : rowsPerPage}
              onChange={(e) => {
                const val = e.target.value === "all" ? filteredUsers.length : Number(e.target.value);
                setRowsPerPage(val);
                setCurrentPage(1);
              }}
              style={{ width: "90px", marginRight: "15px" }}
            >
              <option value={5}>5</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value="all">All</option>
            </Form.Select>
            <span className="me-3">
              {startIndex + 1}–{Math.min(startIndex + rowsPerPage, totalRows)} of {totalRows}
            </span>
            <Button style={{ backgroundColor: "#7d5bbe", border: "none", marginRight: "5px", padding: "4px 10px" }} disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>⏮</Button>
            <Button style={{ backgroundColor: "#7d5bbe", border: "none", marginRight: "5px", padding: "4px 10px" }} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>◀</Button>
            <Button style={{ backgroundColor: "#7d5bbe", border: "none", marginRight: "5px", padding: "4px 10px" }} disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>▶</Button>
            <Button style={{ backgroundColor: "#7d5bbe", border: "none", padding: "4px 10px" }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>⏭</Button>
          </div>
          {/* ── Floating Bulk Action Bar ── */}
          {showCheckbox && selectedRows.length > 0 && (
            <div className="mt-3 p-3 d-flex align-items-center flex-wrap gap-2" style={{ background: "#663399", borderRadius: 8 }}>
              <div className="d-flex flex-column">
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  {selectedRows.length} employee{selectedRows.length > 1 ? "s" : ""} selected
                </span>
                {selectedOnThisPage.length !== selectedRows.length && (
                  <span style={{ color: "#d1c4e9", fontSize: 11 }}>
                    {selectedOnThisPage.length} on this page · {selectedRows.length} total
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }} />

              <Button
                className="btn-icon d-flex align-items-center border-0 text-white ms-2"
                style={{ backgroundColor: "#22c55e" }}
                onClick={() => { setBulkResult(null); setBulkLeavePolicy(""); setShowBulkLeaveModal(true); }}
              >
                <span className="ul-btn__icon"><i className="i-File-Clipboard-File--Text text-18"></i></span>
                <span className="ul-btn__text ms-2">Apply Leave Policy</span>
              </Button>
              <Button
                className="btn-icon d-flex align-items-center border-0 text-white ms-2"
                style={{ backgroundColor: "#3b82f6" }}
                onClick={() => { setBulkResult(null); setBulkSalaryPolicy(""); setShowBulkSalaryModal(true); }}
              >
                <span className="ul-btn__icon"><i className="i-Money-2 text-18"></i></span>
                <span className="ul-btn__text ms-2">Apply Salary Policy</span>
              </Button>
              {/* ✅ NEW: Bulk Attendance Method Button */}
              <Button
                className="btn-icon d-flex align-items-center border-0 text-white ms-2"
                style={{ backgroundColor: "#f59e0b" }}
                onClick={() => {
                  setBulkResult(null);
                  setBulkAttendanceType("manual");
                  setShowBulkAttendanceModal(true);
                }}
              >
                <span className="ul-btn__icon"><i className="i-Clock text-18"></i></span>
                <span className="ul-btn__text ms-2">Apply Attendance Method</span>
              </Button>
              <Button
                className="btn-icon d-flex align-items-center border-0 ms-2"
                style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#e2d9f3" }}
                onClick={() => { setSelectedRows([]); setShowCheckbox(false); }}
              >
                <span className="ul-btn__icon"><i className="i-Close text-18"></i></span>
                <span className="ul-btn__text ms-2">Clear</span>
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ── Add Employee Modal ── */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setFormData(initialFormData);
          setModalErrors({});
          setModalImageFile(null);
          setModalImageError("");
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px 28px" }}>
          <Form>
            {/* Personal Info */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#663399", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, paddingBottom: 6, borderBottom: "2px solid #ede7f6" }}>
                Personal Information
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>First Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" placeholder="First Name" value={formData.first_name || ""} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} isInvalid={!!modalErrors.first_name} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.first_name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Last Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" placeholder="Last Name" value={formData.last_name || ""} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} isInvalid={!!modalErrors.last_name} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.last_name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Staff ID <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" placeholder="Staff ID" value={formData.staff_id || ""} onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })} isInvalid={!!modalErrors.staff_id} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.staff_id}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Gender <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={formData.gender || ""} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} isInvalid={!!modalErrors.gender} style={{ fontSize: 13 }}>
                      <option value="">Select Gender…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.gender}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Date of Birth</Form.Label>
                    <Form.Control type="date" value={formData.date_of_birth || ""} max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} isInvalid={!!modalErrors.date_of_birth} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.date_of_birth}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Phone</Form.Label>
                    <Form.Control type="text" placeholder="Phone number" value={formData.contact_no || ""} onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })} isInvalid={!!modalErrors.contact_no} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.contact_no}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Account */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#663399", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, paddingBottom: 6, borderBottom: "2px solid #ede7f6" }}>
                Account
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="email" placeholder="example@email.com" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} isInvalid={!!modalErrors.email} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.email}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Username <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" placeholder="Username" value={formData.username || ""} onChange={(e) => setFormData({ ...formData, username: e.target.value })} isInvalid={!!modalErrors.username} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.username}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="password" placeholder="Min 8 characters" value={formData.password || ""} onChange={(e) => setFormData({ ...formData, password: e.target.value })} isInvalid={!!modalErrors.password} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.password}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Confirm Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="password" placeholder="Repeat password" value={formData.confirm_password || ""} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} isInvalid={!!modalErrors.confirm_password} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.confirm_password}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Work Info */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#663399", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, paddingBottom: 6, borderBottom: "2px solid #ede7f6" }}>
                Work Information
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Department <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} isInvalid={!!modalErrors.department_id} style={{ fontSize: 13 }}>
                      <option value="">Select Department…</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.department_id}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Designation <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={formData.designation_id || ""} onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })} isInvalid={!!modalErrors.designation_id} style={{ fontSize: 13 }}>
                      <option value="">Select Designation…</option>
                      {designations.map((d) => <option key={d.id} value={d.id}>{d.designation_name}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.designation_id}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Office Shift <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={formData.office_shift_id || ""} onChange={(e) => setFormData({ ...formData, office_shift_id: e.target.value })} isInvalid={!!modalErrors.office_shift_id} style={{ fontSize: 13 }}>
                      <option value="">Select Shift…</option>
                      {shifts.map((s) => <option key={s.id} value={s.id}>{s.Shift}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.office_shift_id}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Role <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={formData.role_users_id || ""} onChange={(e) => setFormData({ ...formData, role_users_id: e.target.value })} isInvalid={!!modalErrors.role_users_id} style={{ fontSize: 13 }}>
                      <option value="">Select Role…</option>
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.role_users_id}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Attendance Type <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={formData.attendance_type || ""} onChange={(e) => setFormData({ ...formData, attendance_type: e.target.value })} isInvalid={!!modalErrors.attendance_type} style={{ fontSize: 13 }}>
                      <option value="">Select Type…</option>
                      <option value="Daily">Daily</option>
                      <option value="Hourly">Hourly</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.attendance_type}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Attendance Method</Form.Label>
                    <Form.Select value={formData.attendance_method || "manual"} onChange={(e) => setFormData({ ...formData, attendance_method: e.target.value })} style={{ fontSize: 13 }}>
                      <option value="manual">Manual</option>
                      <option value="geofence">Geo-Fence</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Date of Joining <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="date" value={formData.joining_date || ""} onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} isInvalid={!!modalErrors.joining_date} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.joining_date}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Geo Location <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={formData.location_id || ""} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} isInvalid={!!modalErrors.location_id} style={{ fontSize: 13 }}>
                      <option value="">Select Location…</option>
                      {locations.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalErrors.location_id}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Profile Image</Form.Label>
                    <Form.Control type="file" onChange={handleModalImageChange} accept="image/jpeg,image/png,image/gif" isInvalid={!!modalImageError} style={{ fontSize: 13 }} />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 12 }}>{modalImageError}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Address */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#663399", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, paddingBottom: 6, borderBottom: "2px solid #ede7f6" }}>
                Address
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Country</Form.Label>
                    <Form.Select value={formData.country || ""} onChange={(e) => setFormData({ ...formData, country: e.target.value })} style={{ fontSize: 13 }}>
                      <option value="">Select Country…</option>
                      <option value="India">India</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>State</Form.Label>
                    <Form.Select value={formData.state || ""} onChange={(e) => setFormData({ ...formData, state: e.target.value })} style={{ fontSize: 13 }}>
                      <option value="">Select State…</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Gujarat">Gujarat</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>City</Form.Label>
                    <Form.Control type="text" placeholder="City" value={formData.city || ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={{ fontSize: 13 }} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Zip Code</Form.Label>
                    <Form.Control type="text" placeholder="Zip Code" value={formData.zip_code || ""} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} style={{ fontSize: 13 }} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>Address</Form.Label>
                    <Form.Control type="text" placeholder="Full address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ fontSize: 13 }} />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: "#faf7ff", borderTop: "1px solid #e8e0f3", gap: 10 }}>
          <button
            onClick={() => {
              setShowModal(false);
              setFormData(initialFormData);
              setModalErrors({});
            }}
            style={{
              background: "none",
              border: "1.5px solid #d1c4e9",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: 14,
              color: "#663399",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!validateModal()) return;
              const { company_id, confirm_password, ...payload } = formData;
              api.post("/api/add/employees", payload)
                .then(() => {
                  toast.success("Employee added successfully");
                  setShowModal(false);
                  setFormData(initialFormData);
                  setModalErrors({});
                  setModalImageFile(null);
                  setModalImageError("");
                  fetchEmployees();
                })
                .catch((err) => toast.error(err.response?.data?.message || "Failed to add employee"));
            }}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #663399)",
              border: "none",
              borderRadius: 8,
              padding: "8px 24px",
              fontSize: 14,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 4px 12px rgba(102,51,153,0.25)",
            }}
          >
            Add Employee
          </button>
        </Modal.Footer>
      </Modal>
      {/* ── Bulk Apply Leave Policy Modal ── */}
      <Modal
        show={showBulkLeaveModal}
        onHide={() => { if (!bulkLoading) { setShowBulkLeaveModal(false); setBulkResult(null); } }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Apply Leave Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          {/* Selected employees preview */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Selected Employees ({selectedRows.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selectedEmployeeNames.slice(0, 5).map((emp) => (
                <span key={emp.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#f3eeff", border: "1px solid #d1b3f5",
                  borderRadius: 20, padding: "3px 10px", fontSize: 12,
                  color: "#5a2d91", fontWeight: 500,
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: `hsl(${(emp.employee?.charCodeAt(0) || 0) * 17 % 360}, 55%, 65%)`,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#fff",
                  }}>
                    {emp.employee?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                  {emp.employee}
                </span>
              ))}
              {selectedRows.length > 5 && (
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  background: "#e8e0f3", borderRadius: 20, padding: "3px 10px",
                  fontSize: 12, color: "#663399", fontWeight: 600,
                }}>
                  +{selectedRows.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Policy selector */}
          <Form.Group>
            <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>
              Leave Policy <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={bulkLeavePolicy}
              onChange={(e) => { setBulkLeavePolicy(e.target.value); setBulkResult(null); }}
              style={{ fontSize: 13 }}
              disabled={bulkLoading}
            >
              <option value="">Select a leave policy…</option>
              {leavePolicies.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Warning note */}
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "#fff8e1", border: "1px solid #ffe082",
            borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <AlertTriangle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "#92400e" }}>
              This will overwrite any existing leave policy assignment for the selected employees.
            </span>
          </div>

          {/* Partial-success result panel */}
          {bulkResult?.type === "leave" && bulkResult.failed.length > 0 && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "#fdecea", border: "1px solid #ef9a9a", borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c62828", marginBottom: 6 }}>
                ⚠ Applied to {bulkResult.success} · Failed for {bulkResult.failed.length}:
              </div>
              <div style={{ maxHeight: 90, overflowY: "auto" }}>
                {bulkResult.failed.map((f) => {
                  const emp = users.find((u) => u.id === f.id);
                  return (
                    <div key={f.id} style={{ fontSize: 12, color: "#c62828", marginBottom: 3 }}>
                      • {emp?.employee || f.id}: {f.reason}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowBulkLeaveModal(false); setBulkResult(null); }} disabled={bulkLoading}>
            {bulkResult?.failed?.length > 0 ? "Close" : "Cancel"}
          </Button>
          <Button
            style={{ backgroundColor: "#663399", border: "none" }}
            onClick={handleBulkApplyLeave}
            disabled={!bulkLeavePolicy || bulkLoading}
          >
            {bulkLoading ? "Applying…" : `Apply to ${selectedRows.length} employee${selectedRows.length > 1 ? "s" : ""}`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Bulk Apply Salary Policy Modal ── */}
      <Modal
        show={showBulkSalaryModal}
        onHide={() => { if (!bulkLoading) { setShowBulkSalaryModal(false); setBulkResult(null); } }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Apply Salary Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          {/* Selected employees preview */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Selected Employees ({selectedRows.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selectedEmployeeNames.slice(0, 5).map((emp) => (
                <span key={emp.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#eff6ff", border: "1px solid #bfdbfe",
                  borderRadius: 20, padding: "3px 10px", fontSize: 12,
                  color: "#1d4ed8", fontWeight: 500,
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: `hsl(${(emp.employee?.charCodeAt(0) || 0) * 17 % 360}, 55%, 65%)`,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#fff",
                  }}>
                    {emp.employee?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                  {emp.employee}
                </span>
              ))}
              {selectedRows.length > 5 && (
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  background: "#dbeafe", borderRadius: 20, padding: "3px 10px",
                  fontSize: 12, color: "#1d4ed8", fontWeight: 600,
                }}>
                  +{selectedRows.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Policy selector */}
          <Form.Group>
            <Form.Label style={{ fontSize: 13, fontWeight: 600, color: "#3d2459" }}>
              Salary Policy <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={bulkSalaryPolicy}
              onChange={(e) => { setBulkSalaryPolicy(e.target.value); setBulkResult(null); }}
              style={{ fontSize: 13 }}
              disabled={bulkLoading}
            >
              <option value="">Select a salary policy…</option>
              {salaryPolicies.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Warning note */}
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "#fff8e1", border: "1px solid #ffe082",
            borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <AlertTriangle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "#92400e" }}>
              This will link the selected salary policy to the chosen employees. Existing CTC values will be preserved.
            </span>
          </div>

          {/* Partial-success result panel */}
          {bulkResult?.type === "salary" && bulkResult.failed.length > 0 && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "#fdecea", border: "1px solid #ef9a9a", borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c62828", marginBottom: 6 }}>
                ⚠ Applied to {bulkResult.success} · Failed for {bulkResult.failed.length}:
              </div>
              <div style={{ maxHeight: 90, overflowY: "auto" }}>
                {bulkResult.failed.map((f) => {
                  const emp = users.find((u) => u.id === f.id);
                  return (
                    <div key={f.id} style={{ fontSize: 12, color: "#c62828", marginBottom: 3 }}>
                      • {emp?.employee || f.id}: {f.reason}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowBulkSalaryModal(false); setBulkResult(null); }} disabled={bulkLoading}>
            {bulkResult?.failed?.length > 0 ? "Close" : "Cancel"}
          </Button>
          <Button
            style={{ backgroundColor: "#663399", border: "none" }}
            onClick={handleBulkApplySalary}
            disabled={!bulkSalaryPolicy || bulkLoading}
          >
            {bulkLoading ? "Applying…" : `Apply to ${selectedRows.length} employee${selectedRows.length > 1 ? "s" : ""}`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ NEW: Bulk Attendance Method Modal */}
      <Modal
        show={showBulkAttendanceModal}
        onHide={() => { setShowBulkAttendanceModal(false); setBulkResult(null); }}
        backdrop="static"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#f59e0b", color: "#fff" }}>
          <Modal.Title>Update Attendance Method for {selectedRows.length} Employee{selectedRows.length > 1 ? "s" : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600, color: "#3d2459" }}>Attendance Method <span className="text-danger">*</span></Form.Label>
              <div className="d-flex gap-3 flex-wrap">
                <Form.Check
                  type="radio"
                  label={
                    <span>
                      <strong>Manual</strong>
                      <small className="d-block text-muted" style={{fontSize: 11}}>Sets to "manual"</small>
                    </span>
                  }
                  name="attendanceMethod"
                  id="methodManual"
                  checked={bulkAttendanceType === "manual"}
                  onChange={() => setBulkAttendanceType("manual")}
                />
                <Form.Check
                  type="radio"
                  label={
                    <span>
                      <strong>Geofence</strong>
                      <small className="d-block text-muted" style={{fontSize: 11}}>Sets to "geofence"</small>
                    </span>
                  }
                  name="attendanceMethod"
                  id="methodGeo"
                  checked={bulkAttendanceType === "geo"}
                  onChange={() => setBulkAttendanceType("geo")}
                />
                <Form.Check
                  type="radio"
                  label={
                    <span>
                      <strong>Location Tracking</strong>
                      <small className="d-block text-muted" style={{fontSize: 11}}>Sets to "location_tracking"</small>
                    </span>
                  }
                  name="attendanceMethod"
                  id="methodLocation"
                  checked={bulkAttendanceType === "location_tracking"}
                  onChange={() => setBulkAttendanceType("location_tracking")}
                />
              </div>
            </Form.Group>
          </Form>
          <Alert variant="info" className="py-2">
            <small>This will update the <strong>attendance_method</strong> column in the <strong>employees</strong> table.</small>
          </Alert>
          {bulkResult?.type === "attendance" && bulkResult.failed?.length > 0 && (
            <div className="mt-3" style={{ maxHeight: 150, overflowY: "auto" }}>
              <Alert variant="warning" className="py-2">
                <strong>Failed ({bulkResult.failed.length}):</strong>
              </Alert>
              <div className="px-2">
                {bulkResult.failed.map((f, i) => {
                  const emp = users.find((u) => u.id === f.id);
                  return (
                    <div key={f.id} style={{ fontSize: 12, color: "#c62828", marginBottom: 3 }}>
                      • {emp?.employee || f.id}: {f.reason}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowBulkAttendanceModal(false); setBulkResult(null); }} disabled={bulkLoading}>
            {bulkResult?.failed?.length > 0 ? "Close" : "Cancel"}
          </Button>
          <Button
            style={{ backgroundColor: "#f59e0b", border: "none" }}
            onClick={handleBulkApplyAttendance}
            disabled={bulkLoading}
          >
            {bulkLoading ? "Applying…" : `Update ${selectedRows.length} employee${selectedRows.length > 1 ? "s" : ""}`}
          </Button>
        </Modal.Footer>
      </Modal>

    </section>
  );
}