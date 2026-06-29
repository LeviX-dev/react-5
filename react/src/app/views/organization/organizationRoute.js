import { lazy } from "react";

const Location = lazy(() => import("./Location"));
const GeoLocation = lazy(() => import("./GeoLocation"));
const Company = lazy(() => import("./Company"));
const Department = lazy(() => import("./Department"));
const Designation = lazy(() => import("./Designation"));
const Announcements = lazy(() => import("./Announcements"));
const Policy = lazy(() => import("./Policy"));
const OfficeShift = lazy(() => import("./OfficeShift"));
const ManageShift = lazy(() => import("./ManageShift"));
const EditShift = lazy(() => import("./EditShift"));
const Roles = lazy(() => import("./roles")); // ✅ FIXED
const Calendar1 = lazy(() => import("./Calendar1"));
const SalaryPolicy = lazy(() => import("./SalaryPolicy"));
const LeavePolicy = lazy(() => import("./LeavePolicy"));

const organizationRoute = [
  {
    path: "/organization/location",
    element: <Location />,
  },
{ path: "/organization/salary-policy", element: <SalaryPolicy /> },
  //    { path: "/user/UserRole", element: <UserRole /> },
  { path: "/organization/geo-location", element: <GeoLocation /> },

  { path: "/organization/company", element: <Company /> },

  { path: "/organization/department", element: <Department /> },

  { path: "/organization/designation", element: <Designation /> },

  { path: "/organization/officeshift", element: <OfficeShift /> },

  { path: "/organization/manageshift", element: <ManageShift /> },

  { path: "/organization/editshift", element: <EditShift /> },

  { path: "/organization/roles", element: <Roles /> },

  { path: "/organization/announcements", element: <Announcements /> },

  { path: "/organization/company-policy", element: <Policy /> },

  { path: "/organization/calendar1", element: <Calendar1 /> },
  { path: "/organization/leave-policy", element: <LeavePolicy /> }
];

export default organizationRoute;
