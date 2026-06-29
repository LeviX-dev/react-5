import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const DashboardV1 = lazy(() => import("./dashboard1/Dashboard1"));
const DashboardV2 = lazy(() => import("./dashboard2/Dashboard2"));
const UserDashboard = lazy(() => import("./dashboard1/userDashboard"));

const dashboardRoutes = [
  {
    path: "/dashboard/v1",
    element: <DashboardV1 />,
    // auth: authRoles.admin,
  },
  {
    path: "/dashboard/v2",
    element: <DashboardV2 />,
    // auth: authRoles.admin,
  },
  {
    path: "/dashboard/user",
    element: <UserDashboard />,
  }
];

export default dashboardRoutes;
