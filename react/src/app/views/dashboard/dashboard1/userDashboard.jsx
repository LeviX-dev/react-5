import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Breadcrumb from "app/components/Breadcrumb";
import { Row, Col, Card, Table, Badge, ProgressBar, Alert, Button, Modal, Form } from "react-bootstrap";
import ReactECharts from "echarts-for-react";
import api from "app/services/api";
import { getDaysUntil } from "./dashboardHolidayUtils";
import useGeoFenceMonitor from "app/hooks/useGeoFenceMonitor";

const PHOTO_BASE = process.env.REACT_APP_UPLOADS_URL || "https://react5.myospaz.in/uploads/employees";

const formatCurrency = (value) => {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue) || numericValue === 0) return "Not configured";

	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(numericValue);
};

const formatDate = (value) => {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

const normalizeDateKey = (value) => {
	if (!value) return "";
	return String(value).split("T")[0];
};

const parseDurationToMinutes = (value) => {
	if (!value || value === "00:00") return 0;

	const [hours, minutes] = String(value).split(":").map((part) => Number(part) || 0);
	return hours * 60 + minutes;
};

const formatMinutesToDuration = (minutes) => {
	if (!minutes || minutes <= 0) return "00:00";

	const totalMinutes = Math.round(minutes);
	const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
	const mins = String(totalMinutes % 60).padStart(2, "0");
	return `${hours}:${mins}`;
};

const resolvePhotoUrl = (photo) => {
	if (!photo) return "https://ui-avatars.com/api/?name=User&background=1f3c88&color=fff&size=160";
	if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
	if (photo.startsWith("/")) return `${process.env.REACT_APP_API_URL || ""}${photo}`;
	if (photo.startsWith("uploads/")) return `https://react5.myospaz.in/${photo}`;
	return `${PHOTO_BASE}/${photo}`;
};

const getFullName = (user) => {
	const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
	return fullName || user?.username || user?.name || "User";
};

const getDepartmentName = (employee) =>
	employee?.department?.department_name || employee?.department_name || employee?.department || "-";

const getDesignationName = (employee) =>
	employee?.designation?.designation_name || employee?.designation_name || employee?.designation || "-";

const getCompanyName = (employee) =>
	employee?.company?.company_name || employee?.company_name || employee?.company || "-";

const getShiftName = (employee) =>
	employee?.office_shift?.Shift ||
	employee?.office_shift?.shift_name ||
	employee?.office_shift_name ||
	(employee?.office_shift_id ? `Shift #${employee.office_shift_id}` : "Not assigned");

const getStatusVariant = (status) => {
	const normalized = String(status || "").toLowerCase();
	if (normalized === "present") return "success";
	if (normalized === "half-day") return "success";
	if (normalized === "late") return "warning";
	if (normalized === "leave") return "info";
	if (normalized === "holiday") return "primary";
	if (normalized === "weekoff") return "secondary";
	if (normalized === "absent") return "danger";
	return "secondary"; // "not marked", "unknown", etc.
};

const getAttendanceBarColor = (status) => {
	const normalized = String(status || "").toLowerCase();
	if (normalized === "present" || normalized === "half-day") return "#198754";
	if (normalized === "late") return "#f59e0b";
	if (normalized === "leave") return "#0dcaf0";
	if (normalized === "holiday") return "#6f42c1";
	if (normalized === "weekoff") return "#6c757d";
	return "#dc3545";
};

const DEFAULT_LEAVE_TYPES = ["Earned Leave", "Sick Leave", "Casual Leave"];

export default function UserDashboard() {
	const authUser = useSelector((state) => state.auth.user);
	const employeeId = authUser?.employee_id || authUser?.user_id || authUser?.id;

	const [employee, setEmployee] = useState(null);
	const [salary, setSalary] = useState(null);
	const [monthAttendance, setMonthAttendance] = useState([]);
	const [todayAttendance, setTodayAttendance] = useState(null);
	const [activeLogId, setActiveLogId] = useState(null); // For geo-fence heartbeat
	const [leaveBalance, setLeaveBalance] = useState([]);
	const [holidays, setHolidays] = useState([]);
	const [upcomingEvents, setUpcomingEvents] = useState([]);
	const [announcements, setAnnouncements] = useState([]);
	const [pendingLeaves, setPendingLeaves] = useState([]);
	const [showLeaveModal, setShowLeaveModal] = useState(false);
	const [leaveSubmitting, setLeaveSubmitting] = useState(false);
	const [leaveFeedback, setLeaveFeedback] = useState(null);
	const [leaveForm, setLeaveForm] = useState({
		leave_type: "",
		start_date: "",
		end_date: "",
		reason: "",
	});
	const [showCheckInModal, setShowCheckInModal] = useState(false);
	const [checkInLoading, setCheckInLoading] = useState(false);
	const [checkInError, setCheckInError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!employeeId) {
			setLoading(false);
			setError("No logged-in user was found.");
			return;
		}

		let isMounted = true;

		const loadDashboard = async () => {
			setLoading(true);
			setError("");

			const now = new Date();
			const today = now.toISOString().split("T")[0];
			const month = now.getMonth() + 1;
			const year = now.getFullYear();

			try {
				const [employeeResponse, salaryResponse, monthResponse, todayResponse] = await Promise.all([
					api.get(`/api/employees/${employeeId}`),
					api.get(`/api/employees/${employeeId}/salary`),
					api.get("/api/attendance/month", {
						params: {
							employee_id: employeeId,
							month,
							year,
						},
					}),
					api.get("/api/attendance/by-date", {
						params: { date: today },
					}),
				]);

				if (!isMounted) return;

				setEmployee(employeeResponse.data?.data || employeeResponse.data || null);
				setSalary(salaryResponse.data || null);
				setMonthAttendance(Array.isArray(monthResponse.data) ? monthResponse.data : []);

				const attendanceRows = Array.isArray(todayResponse.data) ? todayResponse.data : [];
				const todayData = attendanceRows[0] || null;
				setTodayAttendance(todayData);

				// If already checked in but not checked out, start heartbeat monitoring
				if (todayData?.logs?.length > 0) {
					const openLog = todayData.logs.find(log => !log.clock_out);
					if (openLog?.id) {
						setActiveLogId(openLog.id);
					}
				}

				const [balanceResult, holidaysResult, eventsResult, announcementsResult, pendingLeavesResult] = await Promise.allSettled([
					api.get(`/api/leaves/balance/${employeeId}`),
					api.get("/api/calendar/upcoming-holidays"),
					api.get("/api/calendar/upcoming-events"),
					api.get("/api/announcements"),
					api.get(`/api/leaves/employee/${employeeId}`, { params: { status: "pending" } }),
				]);

				if (!isMounted) return;

				if (balanceResult.status === "fulfilled") {
					const balanceData = balanceResult.value.data;
					// API returns { success: true, data: [...], summary: {...} }
					const leaveArray = Array.isArray(balanceData) ? balanceData : balanceData?.data || [];
					console.log("Leave Balance loaded:", leaveArray);
					setLeaveBalance(leaveArray);
				} else {
					console.warn("Leave Balance fetch failed:", balanceResult.reason);
					setLeaveBalance([]);
				}

				if (holidaysResult.status === "fulfilled") {
					setHolidays(Array.isArray(holidaysResult.value.data) ? holidaysResult.value.data : []);
				} else {
					setHolidays([]);
				}

				if (eventsResult.status === "fulfilled") {
					setUpcomingEvents(Array.isArray(eventsResult.value.data) ? eventsResult.value.data : []);
				} else {
					setUpcomingEvents([]);
				}

				if (announcementsResult.status === "fulfilled") {
					setAnnouncements(announcementsResult.value.data?.announcements || []);
				} else {
					setAnnouncements([]);
				}

				if (pendingLeavesResult.status === "fulfilled") {
					const raw = pendingLeavesResult.value.data;
					setPendingLeaves(Array.isArray(raw) ? raw : raw?.data ?? []);
				} else {
					console.warn("Pending leaves fetch failed (endpoint may not exist):", pendingLeavesResult.reason?.message);
					setPendingLeaves([]);
				}
			} catch (requestError) {
				if (!isMounted) return;

				console.error("User dashboard load error:", requestError);
				setError("We could not load your dashboard data right now.");
				setEmployee(authUser || null);
				setSalary(null);
				setMonthAttendance([]);
				setTodayAttendance(null);
				setLeaveBalance([]);
				setHolidays([]);
				setAnnouncements([]);
				setPendingLeaves([]);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		loadDashboard();

		return () => {
			isMounted = false;
		};
	}, [authUser, employeeId]);

	const handleLeaveFormChange = (event) => {
		const { name, value } = event.target;
		setLeaveForm((current) => ({ ...current, [name]: value }));
	};

	const handleLeaveSubmit = async (event) => {
		event.preventDefault();

		if (!employeeId) {
			setLeaveFeedback({ variant: "danger", message: "Unable to identify the logged-in employee." });
			return;
		}

		if (!leaveForm.leave_type || !leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
			setLeaveFeedback({ variant: "danger", message: "Fill all leave fields before submitting." });
			return;
		}

		if (new Date(leaveForm.start_date) > new Date(leaveForm.end_date)) {
			setLeaveFeedback({ variant: "danger", message: "From Date cannot be after To Date." });
			return;
		}

		const policyId = employee?.leave_policy_id || leaveBalance?.[0]?.policy_id || null;
		if (!policyId) {
			setLeaveFeedback({ variant: "danger", message: "No leave policy is attached to your profile." });
			return;
		}

		const start = new Date(leaveForm.start_date);
		const end = new Date(leaveForm.end_date);
		const totalDays = Math.max(1, Math.ceil((end - start) / 86400000) + 1);

		setLeaveSubmitting(true);
		setLeaveFeedback(null);

		try {
			await api.post("/api/leaves/apply", {
				employee_id: employeeId,
				policy_id: policyId,
				leave_type: leaveForm.leave_type,
				start_date: leaveForm.start_date,
				end_date: leaveForm.end_date,
				total_days: totalDays,
				description: leaveForm.reason,
			});

			setLeaveFeedback({ variant: "success", message: "Leave request submitted successfully." });
			setShowLeaveModal(false);
			setLeaveForm({ leave_type: "", start_date: "", end_date: "", reason: "" });
		} catch (submitError) {
			console.error("Leave submission error:", submitError);
			setLeaveFeedback({
				variant: "danger",
				message: submitError.response?.data?.message || submitError.response?.data?.error || "Leave submission failed.",
			});
		} finally {
			setLeaveSubmitting(false);
		}
	};

	const handleCheckIn = async () => {
		setCheckInLoading(true);
		setCheckInError(null);

		try {
			// Get current location
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				});
			});

			const { latitude, longitude } = position.coords;

			// Format current time as HH:MM
			const now = new Date();
			const hours = String(now.getHours()).padStart(2, "0");
			const minutes = String(now.getMinutes()).padStart(2, "0");
			const clockInTime = `${hours}:${minutes}`;

			// Get today's date
			const today = now.toISOString().split("T")[0];

			// Send check-in request with coordinates (numbers, not strings)
			const response = await api.post("/api/attendance/checkin", {
				employee_id: employeeId,
				attendance_date: today,
				clock_in: clockInTime,
				latitude: latitude,
				longitude: longitude,
			});

			const logId = response.data?.log_id;
			setActiveLogId(logId); // Start heartbeat monitoring

			setCheckInError(null);
			setShowCheckInModal(false);

			// Fire CustomEvent FIRST (before any blocking UI) with log_id
			window.dispatchEvent(new CustomEvent("geofence:checkin", {
				detail: { log_id: logId }
			}));

			// Defer alert to prevent blocking event handling
			setTimeout(() => alert("✅ Check-in successful!"), 0);

			// Reload attendance data
			const todayResponse = await api.get(`/api/attendances/day/${employeeId}?date=${today}`);
			setTodayAttendance(todayResponse.data?.data || null);
		} catch (err) {
			console.error("Check-in error:", err);

			// Handle specific error types
			if (err.code === 1) {
				setCheckInError("Location access denied. Please enable location permissions in your browser settings.");
			} else if (err.code === 2) {
				setCheckInError("Unable to get your location. Please ensure location services are enabled.");
			} else if (err.code === 3) {
				setCheckInError("Location request timed out. Please try again.");
			} else if (err.response?.status === 400) {
				// API error (could be geofence error)
				setCheckInError(err.response?.data?.error || "Check-in failed. Please try again.");
			} else {
				setCheckInError(err.message || "Check-in failed. Please try again.");
			}
		} finally {
			setCheckInLoading(false);
		}
	};

	const profile = employee || authUser || {};
	const displayName = getFullName(profile);
	const profilePhoto = resolvePhotoUrl(profile?.photo || profile?.employee_photo || profile?.profile_photo);
	const roleLabel = profile?.role?.name || profile?.role_name || profile?.role || profile?.user_type || "Employee";
	const departmentLabel = getDepartmentName(profile);
	const designationLabel = getDesignationName(profile);
	const companyLabel = getCompanyName(profile);
	const shiftLabel = getShiftName(profile);
	const statusLabel = profile?.is_active === 1 ? "Active" : profile?.is_active === 0 ? "Inactive" : "Unknown";
	const leaveBalanceSummary = leaveBalance.reduce(
		(summary, row) => {
			summary.used += Number(row.used_days || 0);
			summary.remaining += Number(row.remaining_days || 0);
			return summary;
		},
		{ used: 0, remaining: 0 },
	);

	const getColorByIndex = (index) => {
		const colors = ["primary", "success", "info", "warning", "danger", "secondary"];
		return colors[index % colors.length];
	};

	const chartAttendance = monthAttendance
		.map((record) => ({
			date: normalizeDateKey(record.attendance_date),
			status: String(record.attendance_status || "absent").toLowerCase(),
			value: ["present", "half-day"].includes(String(record.attendance_status || "").toLowerCase()) ? 1 : 0,
		}))
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(-15);

	const leaveTypeOptions = Array.from(
		new Set(
			leaveBalance.length > 0
				? leaveBalance.map((row) => row.leave_type).filter(Boolean)
				: DEFAULT_LEAVE_TYPES
		),
	);

	const visibleHolidays = (holidays || []).slice(0, 3);
	const visibleEvents = (upcomingEvents || []).slice(0, 3);
	const visibleAnnouncements = (announcements || []).slice(0, 3);

	const todayKey = normalizeDateKey(new Date().toISOString());
	const todayRecord = monthAttendance.find((record) => normalizeDateKey(record.attendance_date) === todayKey) || null;

	const monthlySummary = monthAttendance.reduce(
		(summary, record) => {
			const status = String(record.attendance_status || "").toLowerCase();
			summary.total += 1;

			if (status === "present") summary.present += 1;
			if (status === "leave") summary.leave += 1;
			if (status === "holiday") summary.holiday += 1;
			if (status === "weekoff") summary.weekoff += 1;
			if (status === "absent") summary.absent += 1;
			if (status === "late" || String(record.time_late || "00:00") !== "00:00") summary.late += 1;
			if (String(record.early_leaving || "00:00") !== "00:00") summary.earlyLeaving += 1;
			summary.workedMinutes += parseDurationToMinutes(record.total_work);

			return summary;
		},
		{
			total: 0,
			present: 0,
			leave: 0,
			holiday: 0,
			weekoff: 0,
			absent: 0,
			late: 0,
			earlyLeaving: 0,
			workedMinutes: 0,
		},
	);

	const recentAttendance = monthAttendance.slice(0, 5);
	const netSalary = salary?.net_salary ?? salary?.netSalary ?? salary?.monthly_ctc ?? null;
	const grossSalary = salary?.gross_salary ?? salary?.grossSalary ?? salary?.monthly_ctc ?? null;
	const attendanceRatio = monthlySummary.total > 0 ? Math.round((monthlySummary.present / monthlySummary.total) * 100) : 0;

	// Data for Daily Late Arrivals Chart
	const lateArrivalsData = monthAttendance
		.filter((record) => {
			const late = parseDurationToMinutes(record.time_late || "00:00");
			return late > 0;
		})
		.map((record) => ({
			date: normalizeDateKey(record.attendance_date),
			late: parseDurationToMinutes(record.time_late || "00:00"),
		}))
		.sort((a, b) => a.date.localeCompare(b.date));

	// Data for Daily Early Leaving Chart
	const earlyLeavingData = monthAttendance
		.filter((record) => {
			const early = parseDurationToMinutes(record.early_leaving || "00:00");
			return early > 0;
		})
		.map((record) => ({
			date: normalizeDateKey(record.attendance_date),
			early: parseDurationToMinutes(record.early_leaving || "00:00"),
		}))
		.sort((a, b) => a.date.localeCompare(b.date));

	// Data for Last 20 Days Attendance Trend
	const last20DaysTrend = monthAttendance
		.map((record) => ({
			date: normalizeDateKey(record.attendance_date),
			status: String(record.attendance_status || "absent").toLowerCase(),
		}))
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(-20);

	// Start geo-fence heartbeat monitoring (every 1 min, auto-checkout if outside zone or no heartbeat for 2 min)
	useGeoFenceMonitor(employeeId, activeLogId, employee?.attendance_method);

	return (
		<div>
			<Breadcrumb
				routeSegments={[
					{ name: "Dashboard", path: "/dashboard/v1" },
					{ name: "My Dashboard" },
				]}
			/>

			{error ? <Alert variant="warning" className="mb-4">{error}</Alert> : null}
			{leaveFeedback ? <Alert variant={leaveFeedback.variant} className="mb-4">{leaveFeedback.message}</Alert> : null}

			<Card className="mb-4 overflow-hidden border-0 shadow-sm">
				<Card.Body className="p-4 p-lg-5">
					<Row className="align-items-center g-4">
						<Col lg={3} md={4} className="text-center text-md-start">
							<img
								src={profilePhoto}
								alt={displayName}
								className="rounded-circle shadow-sm mb-3"
								style={{ width: 120, height: 120, objectFit: "cover" }}
							/>
							<div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
								<Badge bg="dark">{roleLabel}</Badge>
								<Badge bg={profile?.is_active === 1 ? "success" : "secondary"}>{statusLabel}</Badge>
							</div>
						</Col>

						<Col lg={5} md={8}>
							<p className="text-muted text-uppercase small mb-2">Logged-in profile</p>
							<h2 className="mb-2">Welcome back, {displayName}</h2>
							<p className="text-muted mb-4">
								Your personal workspace for attendance, salary snapshot, and profile details.
							</p>
							<div className="d-flex flex-wrap gap-2 mb-3">
								<Button variant="primary" onClick={() => setShowLeaveModal(true)}>
									Apply for Leave
								</Button>
								<Button variant="outline-secondary" as="a" href={`/employees/${employeeId}`}>
									View Profile
								</Button>
							</div>

							<Row className="g-3">
								<Col sm={6}>
									<div className="p-3 rounded border bg-light h-100">
										<div className="text-muted small">Employee ID</div>
										<div className="fw-semibold">{profile?.staff_id || profile?.employee_id || employeeId || "-"}</div>
									</div>
								</Col>
								<Col sm={6}>
									<div className="p-3 rounded border bg-light h-100">
										<div className="text-muted small">Department</div>
										<div className="fw-semibold">{departmentLabel}</div>
									</div>
								</Col>
								<Col sm={6}>
									<div className="p-3 rounded border bg-light h-100">
										<div className="text-muted small">Designation</div>
										<div className="fw-semibold">{designationLabel}</div>
									</div>
								</Col>
								<Col sm={6}>
									<div className="p-3 rounded border bg-light h-100">
										<div className="text-muted small">Company</div>
										<div className="fw-semibold">{companyLabel}</div>
									</div>
								</Col>
							</Row>
						</Col>

						<Col lg={4}>
							<div className="p-4 rounded-4 text-white" style={{ background: "linear-gradient(135deg, #1f3c88 0%, #3f72af 55%, #112d4e 100%)" }}>
								<p className="text-white-50 text-uppercase small mb-2">This month</p>
								<h3 className="mb-3">Attendance overview</h3>
								{loading ? (
									<div className="d-flex flex-column gap-2">
										{[1,2,3,4].map((i) => (
											<div key={i} className="d-flex justify-content-between">
												<span style={{ height: 12, width: "45%", borderRadius: 4, background: "rgba(255,255,255,0.2)", display: "inline-block" }} />
												<span style={{ height: 12, width: "25%", borderRadius: 4, background: "rgba(255,255,255,0.2)", display: "inline-block" }} />
											</div>
										))}
									</div>
								) : (
									<>
										<div className="d-flex justify-content-between mb-2">
											<span>Attendance ratio</span>
											<strong>{attendanceRatio}%</strong>
										</div>
										<ProgressBar now={attendanceRatio} variant="light" className="mb-3" style={{ height: 8 }} />
										<div className="d-flex justify-content-between small mb-1">
											<span>Marked days</span>
											<strong>{monthlySummary.total}</strong>
										</div>
										<div className="d-flex justify-content-between small mb-1">
											<span>Present days</span>
											<strong>{monthlySummary.present}</strong>
										</div>
										<div className="d-flex justify-content-between small mb-1">
											<span>Late days</span>
											<strong>{monthlySummary.late}</strong>
										</div>
										<div className="d-flex justify-content-between small">
											<span>Worked time</span>
											<strong>{formatMinutesToDuration(monthlySummary.workedMinutes)}</strong>
										</div>
									</>
								)}
							</div>
						</Col>
					</Row>
				</Card.Body>
			</Card>

			{/* ── Quick Actions ── */}
			<Row className="g-3 mb-4">
				{[
					{ icon: "i-Map-Marker",    label: "Check-In",         color: "danger",    onClick: () => { setShowCheckInModal(true); setCheckInError(null); setCheckInLoading(false); } },
					{ icon: "i-Add-File",     label: "Apply Leave",      color: "primary",   onClick: () => setShowLeaveModal(true) },
					{ icon: "i-Clock",        label: "My Attendance",    color: "success",   href: "/attendance" },
					{ icon: "i-Money-2",      label: "My Payslips",      color: "warning",   href: "/payslips" },
					{ icon: "i-Administrator",label: "My Profile",       color: "info",      href: `/employees/${employeeId}` },
				].map(({ icon, label, color, onClick, href }) => (
					<Col xs={6} md={3} key={label}>
						<Card
							className={`border-0 shadow-sm text-center h-100 cursor-pointer`}
							style={{ cursor: "pointer" }}
							onClick={onClick || (() => { window.location.href = href; })}
						>
							<Card.Body className="py-4">
								<div
									className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 bg-${color} bg-opacity-10`}
									style={{ width: 52, height: 52 }}
								>
									<i className={`${icon} text-${color}`} style={{ fontSize: 22 }} />
								</div>
								<div className="fw-semibold small">{label}</div>
							</Card.Body>
						</Card>
					</Col>
				))}
			</Row>

			{/* ── Summary metric cards ── */}
			<Row className="g-4 mb-4">
				<Col xl={3} md={6}>
					<Card className="h-100 border-0 shadow-sm">
						<Card.Body>
							<div className="text-muted small text-uppercase mb-2">Logged days</div>
							<h3 className="mb-1">{monthlySummary.total}</h3>
							<div className="text-muted">attendance records this month</div>
						</Card.Body>
					</Card>
				</Col>
				<Col xl={3} md={6}>
					<Card className="h-100 border-0 shadow-sm">
						<Card.Body>
							<div className="text-muted small text-uppercase mb-2">Present</div>
							<h3 className="mb-1 text-success">{monthlySummary.present}</h3>
							<div className="text-muted">days marked present</div>
						</Card.Body>
					</Card>
				</Col>
				<Col xl={3} md={6}>
					<Card className="h-100 border-0 shadow-sm">
						<Card.Body>
							<div className="text-muted small text-uppercase mb-2">Late / early leave</div>
							<h3 className="mb-1 text-warning">{monthlySummary.late} / {monthlySummary.earlyLeaving}</h3>
							<div className="text-muted">days with timing deviations</div>
						</Card.Body>
					</Card>
				</Col>
				<Col xl={3} md={6}>
					<Card className="h-100 border-0 shadow-sm">
						<Card.Body>
							<div className="text-muted small text-uppercase mb-2">Net salary</div>
							<h3 className="mb-1 text-primary">{formatCurrency(netSalary)}</h3>
							<div className="text-muted">gross: {formatCurrency(grossSalary)}</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Row className="row-cols-2 row-cols-sm-3 row-cols-xl-5 g-4 mb-4">
				{leaveBalance.length === 0 ? (
					<Col xs={12}>
						<Alert variant="info" className="mb-0">
							<i className="i-Information" /> No leave policy configured for your profile yet. Contact HR to set up your leave policy.
						</Alert>
					</Col>
				) : (
					[
						// Dynamically create cards from user's actual leave types
						...leaveBalance.map((balance, idx) => ({
							label: balance.leave_type || "Unknown Leave",
							value: Number(balance.allocated_days || 0),
							color: getColorByIndex(idx),
							type: "leave",
						})),
						// Add summary cards at the end
						{ label: "Used", value: leaveBalanceSummary.used, color: "warning", type: "summary" },
						{ label: "Remaining", value: leaveBalanceSummary.remaining, color: "dark", type: "summary" },
					].map((item) => (
						<Col key={item.label}>
							<Card className="h-100 border-0 shadow-sm">
								<Card.Body>
									<div className="text-muted small text-uppercase mb-1">{item.label}</div>
									<h4 className={`mb-0 text-${item.color}`}>{item.value}</h4>
								</Card.Body>
							</Card>
						</Col>
					))
				)}
			</Row>

			{/* ── Monthly Attendance Mini Chart — full width ── */}
			<Card className="border-0 shadow-sm mb-4">
				<Card.Body>
					<Card.Title className="mb-1">Monthly Attendance</Card.Title>
					<p className="text-muted mb-3">Color-coded daily status for the last 15 working days.</p>
					{chartAttendance.length > 0 ? (
						<>
							<ReactECharts
								style={{ height: 240 }}
								option={{
									tooltip: {
										trigger: "axis",
										formatter: (params) => {
											const point = params?.[0];
											if (!point) return "";
											const d = chartAttendance[point.dataIndex];
											return `${point.axisValue}<br/>Status: <b>${d?.status || "unknown"}</b>`;
										},
									},
									grid: { left: 8, right: 8, top: 24, bottom: 48, containLabel: true },
									xAxis: {
										type: "category",
										data: chartAttendance.map((item) => item.date.slice(5)),
										axisLabel: { rotate: 45, fontSize: 11 },
									},
									yAxis: { show: false },
									series: [
										{
											name: "Attendance",
											type: "bar",
											data: chartAttendance.map((item) => ({
												value: 1,
												itemStyle: { color: getAttendanceBarColor(item.status), borderRadius: [4,4,0,0] },
											})),
											barMaxWidth: 28,
											label: {
												show: true,
												position: "top",
												fontSize: 10,
												formatter: (params) => {
													const s = chartAttendance[params.dataIndex]?.status || "";
													const map = { present: "P", late: "L", absent: "A", leave: "LV", holiday: "H", weekoff: "WO", "half-day": "HD" };
													return map[s] || s.slice(0,1).toUpperCase();
												},
											},
										},
									],
								}}
							/>
							<div className="d-flex flex-wrap gap-3 mt-3 pt-3 border-top justify-content-center small">
								{[
									{ label: "Present",  color: "#198754" },
									{ label: "Late",     color: "#f59e0b" },
									{ label: "Absent",   color: "#dc3545" },
									{ label: "Leave",    color: "#0dcaf0" },
									{ label: "Holiday",  color: "#6f42c1" },
									{ label: "Week Off", color: "#6c757d" },
								].map(({ label, color }) => (
									<span key={label} className="d-flex align-items-center gap-1 text-muted">
										<span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
										{label}
									</span>
								))}
							</div>
						</>
					) : (
						<div className="text-center py-5 text-muted">
							<i className="i-Bar-Chart" style={{ fontSize: 40 }} />
							<p className="mt-2 mb-0">No attendance data available for this month.</p>
						</div>
					)}
				</Card.Body>
			</Card>

			{/* ── Holidays · Events · Announcements — 3 equal columns ── */}
			<Row className="g-4 mb-4">
				{/* Upcoming Holidays */}
				<Col lg={4}>
					<Card className="h-100 border-0 shadow-sm">
						<Card.Body>
							<Card.Title className="mb-3">Upcoming Holidays</Card.Title>
							{visibleHolidays.length > 0 ? (
								<div className="d-flex flex-column gap-3">
									{visibleHolidays.map((holiday) => {
										const { label, cls } = getDaysUntil(holiday.event_date);
										return (
											<div key={holiday.id || holiday.event_date} className="d-flex gap-3 align-items-center">
												<div className="bg-light rounded text-center p-2 flex-shrink-0" style={{ minWidth: 56 }}>
													<div className="text-18 fw-bold text-primary">{new Date(holiday.event_date).getDate()}</div>
													<div className="text-small text-muted">
														{new Date(holiday.event_date).toLocaleDateString("en-US", { month: "short" })}
													</div>
												</div>
												<div className="flex-grow-1 overflow-hidden">
													<div className="fw-semibold text-truncate">{holiday.title}</div>
													{holiday.description ? <div className="text-muted text-small text-truncate">{holiday.description}</div> : null}
												</div>
												<span className={`badge ${cls} flex-shrink-0`}>{label}</span>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-muted">No upcoming holidays found.</div>
							)}
						</Card.Body>
					</Card>
				</Col>

				{/* Upcoming Events */}
				<Col lg={4}>
					<Card className="h-100 border-0 shadow-sm">
						<Card.Body>
							<Card.Title className="mb-3">Upcoming Events</Card.Title>
							{visibleEvents.length > 0 ? (
								<div className="d-flex flex-column gap-3">
									{visibleEvents.map((event) => {
										const { label, cls } = getDaysUntil(event.event_date);
										return (
											<div key={event.id || event.event_date} className="d-flex gap-3 align-items-center">
												<div className="bg-light rounded text-center p-2 flex-shrink-0" style={{ minWidth: 56 }}>
													<div className="text-18 fw-bold text-success">{new Date(event.event_date).getDate()}</div>
													<div className="text-small text-muted">
														{new Date(event.event_date).toLocaleDateString("en-US", { month: "short" })}
													</div>
												</div>
												<div className="flex-grow-1 overflow-hidden">
													<div className="fw-semibold text-truncate">{event.title}</div>
													{event.description ? <div className="text-muted text-small text-truncate">{event.description}</div> : null}
												</div>
												<span className={`badge ${cls} flex-shrink-0`}>{label}</span>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-muted">No upcoming events found.</div>
							)}
						</Card.Body>
					</Card>
				</Col>

				{/* Company Announcements */}
				<Col lg={4}>
					<Card className="h-100 border-0 shadow-sm">
						<Card.Body>
							<Card.Title className="mb-3">Company Announcements</Card.Title>
							{visibleAnnouncements.length > 0 ? (
								<div className="d-flex flex-column gap-3">
									{visibleAnnouncements.map((announcement) => (
										<div key={announcement.id} className="border-bottom pb-3">
											<div className="d-flex justify-content-between gap-2 mb-1">
												<div className="fw-semibold text-truncate">{announcement.title}</div>
												<small className="text-muted text-nowrap">{formatDate(announcement.startDate)}</small>
											</div>
											<div className="text-muted text-small">
												{announcement.summary || announcement.description || "No description available."}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-muted">No announcements available right now.</div>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Row className="g-4 mb-4 align-items-start">
				<Col lg={5}>
					<Card className="border-0 shadow-sm">
						<Card.Body>
							<Card.Title className="mb-4">Today at a glance</Card.Title>
							{loading ? (
								<div className="placeholder-glow d-flex flex-column gap-3">
									{[1,2,3,4,5].map((i) => (
										<div key={i} className="d-flex justify-content-between">
											<span className="placeholder col-4" style={{ height: 16, borderRadius: 4 }} />
											<span className="placeholder col-3" style={{ height: 16, borderRadius: 4 }} />
										</div>
									))}
								</div>
							) : (
								<>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<span className="text-muted">Date</span>
										<strong>{formatDate(new Date())}</strong>
									</div>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<span className="text-muted">Attendance status</span>
										<Badge bg={getStatusVariant(todayAttendance?.attendance_status || todayRecord?.attendance_status || "unknown")}>
											{todayAttendance?.attendance_status || todayRecord?.attendance_status || "Not marked"}
										</Badge>
									</div>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<span className="text-muted">Logged actions</span>
										<strong>{todayAttendance?.logs?.length || 0}</strong>
									</div>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<span className="text-muted">Shift</span>
										<strong className="text-end">{shiftLabel}</strong>
									</div>
									<div className="d-flex justify-content-between align-items-center">
										<span className="text-muted">Last recorded work</span>
										<strong>{todayRecord?.total_work || "00:00"}</strong>
									</div>
								</>
							)}
						</Card.Body>
					</Card>
				</Col>

				<Col lg={7}>
					<Card className="border-0 shadow-sm">
						<Card.Body>
							<Card.Title className="mb-4">Salary snapshot</Card.Title>
							{loading ? (
								<div className="placeholder-glow">
									<Row className="g-3">
										{[1,2,3,4].map((i) => (
											<Col sm={6} key={i}>
												<div className="p-3 rounded border">
													<span className="placeholder col-5 d-block mb-2" style={{ height: 12, borderRadius: 4 }} />
													<span className="placeholder col-8 d-block" style={{ height: 20, borderRadius: 4 }} />
												</div>
											</Col>
										))}
									</Row>
								</div>
							) : salary ? (
								<Row className="g-3">
									<Col sm={6}>
										<div className="p-3 rounded border h-100">
											<div className="text-muted small mb-1">Monthly CTC</div>
											<div className="fw-semibold">{formatCurrency(salary.monthly_ctc || salary.total_monthly_ctc)}</div>
										</div>
									</Col>
									<Col sm={6}>
										<div className="p-3 rounded border h-100">
											<div className="text-muted small mb-1">Gross salary</div>
											<div className="fw-semibold">{formatCurrency(salary.gross_salary)}</div>
										</div>
									</Col>
									<Col sm={6}>
										<div className="p-3 rounded border h-100">
											<div className="text-muted small mb-1">Deductions</div>
											<div className="fw-semibold">{formatCurrency(salary.total_deductions)}</div>
										</div>
									</Col>
									<Col sm={6}>
										<div className="p-3 rounded border h-100">
											<div className="text-muted small mb-1">Net salary</div>
											<div className="fw-semibold">{formatCurrency(salary.net_salary)}</div>
										</div>
									</Col>
									<Col xs={12}>
										<div className="p-3 rounded border bg-light">
											<div className="text-muted small mb-1">Salary policy</div>
											<div className="fw-semibold">{salary.policy_id ? `Policy #${salary.policy_id}` : "No salary policy configured yet"}</div>
										</div>
									</Col>
								</Row>
							) : (
								<div className="text-muted">No salary information is configured for this account yet.</div>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Card className="border-0 shadow-sm mb-4">
				<Card.Body>
					<div className="d-flex justify-content-between align-items-center mb-4">
						<Card.Title className="mb-0">Recent Attendance</Card.Title>
						<a href="/attendance" className="text-primary small">View All</a>
					</div>
					{loading ? (
						<div className="placeholder-glow d-flex flex-column gap-2">
							{[1,2,3,4,5].map((i) => (
								<span key={i} className="placeholder col-12" style={{ height: 40, borderRadius: 6 }} />
							))}
						</div>
					) : recentAttendance.length > 0 ? (
						<Table responsive hover className="mb-0 align-middle">
							<thead className="table-light">
								<tr>
									<th>Date</th>
									<th>Status</th>
									<th>Clock In</th>
									<th>Clock Out</th>
									<th>Total Work</th>
									<th>Late</th>
									<th>Early Leaving</th>
								</tr>
							</thead>
							<tbody>
								{recentAttendance.map((record) => (
									<tr key={`${record.employee_id || employeeId}-${normalizeDateKey(record.attendance_date)}`}>
										<td>{formatDate(record.attendance_date)}</td>
										<td>
											<Badge bg={getStatusVariant(record.attendance_status)}>
												{record.attendance_status || "Not marked"}
											</Badge>
										</td>
										<td>{record.first_clock_in || record.clock_in || "-"}</td>
										<td>{record.last_clock_out || record.clock_out || "-"}</td>
										<td>{record.total_work || "00:00"}</td>
										<td className={record.time_late && record.time_late !== "00:00" ? "text-warning fw-semibold" : ""}>
											{record.time_late || "00:00"}
										</td>
										<td className={record.early_leaving && record.early_leaving !== "00:00" ? "text-danger fw-semibold" : ""}>
											{record.early_leaving || "00:00"}
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					) : (
						<div className="text-center py-5 text-muted">
							<i className="i-Calendar-4" style={{ fontSize: 40 }} />
							<p className="mt-2 mb-0">No attendance records found for this month.</p>
						</div>
					)}
				</Card.Body>
			</Card>

			{/* ── Pending Leave Requests ── */}
			<Card className="border-0 shadow-sm mb-4">
				<Card.Body>
					<div className="d-flex justify-content-between align-items-center mb-3">
						<Card.Title className="mb-0">Pending Leave Requests</Card.Title>
						<a href="/leaves" className="text-primary small">View All</a>
					</div>
					{loading ? (
						<div className="placeholder-glow d-flex flex-column gap-2">
							{[1,2,3].map((i) => (
								<span key={i} className="placeholder col-12" style={{ height: 40, borderRadius: 6 }} />
							))}
						</div>
					) : pendingLeaves.length > 0 ? (
						<Table responsive hover className="mb-0 align-middle">
							<thead className="table-light">
								<tr>
									<th>Leave Type</th>
									<th>From</th>
									<th>To</th>
									<th>Days</th>
									<th>Applied On</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{pendingLeaves.map((leave, idx) => (
									<tr key={leave.id || idx}>
										<td className="fw-semibold">{leave.leave_type || "-"}</td>
										<td>{formatDate(leave.start_date)}</td>
										<td>{formatDate(leave.end_date)}</td>
										<td>{leave.total_days ?? "-"}</td>
										<td>{formatDate(leave.created_at || leave.applied_on)}</td>
										<td>
											<Badge bg="warning" text="dark">Pending</Badge>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					) : (
						<div className="text-center py-4 text-muted">
							<i className="i-Check-2" style={{ fontSize: 36 }} />
							<p className="mt-2 mb-0">No pending leave requests.</p>
						</div>
					)}
				</Card.Body>
			</Card>

			<Row className="g-4 mb-4 align-items-start">
				<Col lg={6}>
					<Card className="border-0 shadow-sm">
						<Card.Body>
							<Card.Title className="mb-3">Daily Late Arrivals</Card.Title>
							<p className="text-muted mb-3 small">Employees who clocked in after shift start — current month</p>
							{lateArrivalsData.length > 0 ? (
								<ReactECharts
									style={{ height: 280 }}
									option={{
										tooltip: {
											trigger: "axis",
											formatter: (params) => {
												const point = params?.[0];
												if (!point) return "";
												const minutes = lateArrivalsData[point.dataIndex]?.late || 0;
												return `${point.axisValue}<br/>Late: ${formatMinutesToDuration(minutes)}`;
											},
										},
										grid: { left: 8, right: 8, top: 24, bottom: 48, containLabel: true },
										xAxis: {
											type: "category",
											data: lateArrivalsData.map((item) => item.date.slice(5)),
											axisLabel: { rotate: 45, fontSize: 11 },
										},
										yAxis: {
											type: "value",
											axisLabel: { formatter: (value) => `${value}m` },
										},
										series: [
											{
												name: "Late (minutes)",
												type: "bar",
												data: lateArrivalsData.map((item) => item.late),
												itemStyle: { color: "#f59e0b" },
												barMaxWidth: 20,
												label: { show: false },
											},
										],
									}}
								/>
							) : (
								<div className="text-muted text-center py-5">No late arrivals found this month</div>
							)}
						</Card.Body>
					</Card>
				</Col>

				<Col lg={6}>
					<Card className="border-0 shadow-sm">
						<Card.Body>
							<Card.Title className="mb-3">Daily Early Leaving</Card.Title>
							<p className="text-muted mb-3 small">Employees who clocked out before shift end — current month</p>
							{earlyLeavingData.length > 0 ? (
								<ReactECharts
									style={{ height: 280 }}
									option={{
										tooltip: {
											trigger: "axis",
											formatter: (params) => {
												const point = params?.[0];
												if (!point) return "";
												const minutes = earlyLeavingData[point.dataIndex]?.early || 0;
												return `${point.axisValue}<br/>Early: ${formatMinutesToDuration(minutes)}`;
											},
										},
										grid: { left: 8, right: 8, top: 24, bottom: 48, containLabel: true },
										xAxis: {
											type: "category",
											data: earlyLeavingData.map((item) => item.date.slice(5)),
											axisLabel: { rotate: 45, fontSize: 11 },
										},
										yAxis: {
											type: "value",
											axisLabel: { formatter: (value) => `${value}m` },
										},
										series: [
											{
												name: "Early Leaving (minutes)",
												type: "bar",
												data: earlyLeavingData.map((item) => item.early),
												itemStyle: { color: "#8b5cf6" },
												barMaxWidth: 20,
												label: { show: false },
											},
										],
									}}
								/>
							) : (
								<div className="text-muted text-center py-5">No early leaving found this month</div>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Row className="g-4 mb-4">
				<Col lg={12}>
					<Card className="h-100 border-0 shadow-sm">
						<Card.Body>
							<Card.Title className="mb-3">Last 20 Days Attendance Trend</Card.Title>
							<p className="text-muted mb-3 small">Your attendance pattern over the last 20 days</p>
							{last20DaysTrend.length > 0 ? (
								<ReactECharts
									style={{ height: 300 }}
									option={{
										tooltip: {
											trigger: "axis",
											formatter: (params) => {
												const point = params?.[0];
												if (!point) return "";
												const status = last20DaysTrend[point.dataIndex]?.status || "unknown";
												return `${point.axisValue}<br/>Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
											},
										},
										grid: { left: 8, right: 8, top: 24, bottom: 48, containLabel: true },
										xAxis: {
											type: "category",
											data: last20DaysTrend.map((item) => item.date.slice(5)),
											axisLabel: { rotate: 45, fontSize: 11 },
										},
										yAxis: {
											type: "value",
											show: false,
										},
										series: [
											{
												name: "Attendance Status",
												type: "line",
												data: last20DaysTrend.map((item) => {
													const statusMap = {
														present: 4,
														"half-day": 3,
														late: 3,
														leave: 2,
														holiday: 1,
														weekoff: 1,
														absent: 0,
													};
													return statusMap[item.status] || 0;
												}),
												smooth: true,
												lineStyle: { width: 2 },
												itemStyle: {
													borderRadius: 4,
												},
												areaStyle: {
													color: {
														type: "linear",
														x: 0,
														y: 0,
														x2: 0,
														y2: 1,
														colorStops: [
															{ offset: 0, color: "rgba(34, 197, 94, 0.3)" },
															{ offset: 1, color: "rgba(34, 197, 94, 0.05)" },
														],
													},
												},
												symbolSize: 6,
												markPoint: {
													data: [
														{ type: "max", name: "Max" },
														{ type: "min", name: "Min" },
													],
												},
											},
										],
									}}
								/>
							) : (
								<div className="text-muted text-center py-5">No attendance data for last 20 days</div>
							)}
							<div className="mt-4 pt-3 border-top">
								<Row className="g-3 text-center small">
									<Col xs={6} sm={3}>
										<div className="text-muted mb-1">Present</div>
										<Badge bg="success">{last20DaysTrend.filter((d) => d.status === "present").length}</Badge>
									</Col>
									<Col xs={6} sm={3}>
										<div className="text-muted mb-1">Late</div>
										<Badge bg="warning">{last20DaysTrend.filter((d) => d.status === "late").length}</Badge>
									</Col>
									<Col xs={6} sm={3}>
										<div className="text-muted mb-1">Leave</div>
										<Badge bg="info">{last20DaysTrend.filter((d) => d.status === "leave").length}</Badge>
									</Col>
									<Col xs={6} sm={3}>
										<div className="text-muted mb-1">Absent</div>
										<Badge bg="danger">{last20DaysTrend.filter((d) => d.status === "absent").length}</Badge>
									</Col>
								</Row>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Apply for Leave</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleLeaveSubmit}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Leave Type</Form.Label>
							<Form.Select name="leave_type" value={leaveForm.leave_type} onChange={handleLeaveFormChange} required>
								<option value="">Select leave type</option>
								{leaveTypeOptions.map((type) => (
									<option key={type} value={type}>{type}</option>
								))}
							</Form.Select>
						</Form.Group>

						<Row>
							<Col sm={6}>
								<Form.Group className="mb-3">
									<Form.Label>From Date</Form.Label>
									<Form.Control type="date" name="start_date" value={leaveForm.start_date} onChange={handleLeaveFormChange} required />
								</Form.Group>
							</Col>
							<Col sm={6}>
								<Form.Group className="mb-3">
									<Form.Label>To Date</Form.Label>
									<Form.Control type="date" name="end_date" value={leaveForm.end_date} onChange={handleLeaveFormChange} required />
								</Form.Group>
							</Col>
						</Row>

						<Form.Group className="mb-3">
							<Form.Label>Reason</Form.Label>
							<Form.Control
								as="textarea"
								rows={4}
								name="reason"
								value={leaveForm.reason}
								onChange={handleLeaveFormChange}
								required
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="light" onClick={() => setShowLeaveModal(false)}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" disabled={leaveSubmitting}>
							{leaveSubmitting ? "Submitting..." : "Submit"}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* ── CHECK-IN MODAL ── */}
			<Modal show={showCheckInModal} onHide={() => !checkInLoading && setShowCheckInModal(false)} centered backdrop={checkInLoading ? "static" : true} keyboard={!checkInLoading} onShow={handleCheckIn}>
				<Modal.Header closeButton={!checkInLoading}>
					<Modal.Title>
						{checkInLoading ? "📍 Getting your location..." : checkInError ? "⚠️ Check-In Error" : "✓ Check-In"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{checkInLoading ? (
						<div className="text-center py-4">
							<div className="spinner-border text-danger" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
							<p className="mt-3 text-muted">Retrieving your location...</p>
						</div>
					) : checkInError ? (
						<Alert variant="danger" className="mb-0">
							<strong>Error:</strong> {checkInError}
						</Alert>
					) : (
						<Alert variant="success" className="mb-0">
							✅ Check-in successful! You have been marked present.
						</Alert>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="light" onClick={() => setShowCheckInModal(false)} disabled={checkInLoading}>
						{checkInError || checkInLoading ? "Close" : "Done"}
					</Button>
					{!checkInError && !checkInLoading && (
						<Button variant="danger" disabled>
							✓ Completed
						</Button>
					)}
					{checkInError && (
						<Button variant="danger" onClick={handleCheckIn} disabled={checkInLoading}>
							Retry
						</Button>
					)}
				</Modal.Footer>
			</Modal>
		</div>
	);
}