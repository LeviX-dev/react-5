import { createBrowserRouter, redirect } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";

import dashboardRoutes from "./views/dashboard/dashboardRoutes";
import pagesRoutes from "./views/pages/pagesRoutes";
import iconsRoutes from "./views/icons/iconsRoutes";
import formsRoutes from "./views/forms/formsRoutes";
import chartsRoute from "./views/charts/chartsRoute";
import uiKitsRoutes from "./views/ui-kits/uiKitsRoutes";
import widgetsRoute from "./views/widgets/widgetsRoute";
import dataTableRoute from "./views/data-table/dataTableRoute";
import extraKitsRoutes from "./views/extra-kits/extraKitsRoutes";
import chatRoutes from "./views/app/chat/chatRoutes";
import inboxRoutes from "./views/app/inbox/inboxRoutes";
import invoiceRoutes from "./views/app/invoice/invoiceRoutes";
import contactRoutes from "./views/app/contact/contactRoutes";
import calendarRoutes from "./views/app/calendar/calendarRoutes";
import ecommerceRoutes from "./views/app/ecommerce/ecommerceRoutes";
import taskManagerRoutes from "./views/app/task-manager/taskManagerRoutes";
import timesheetRoutes from "./views/Timesheet/timesheetRoutes";
import hrcal from "./views/HR Cal/hrcalRoutes";
import usersRoute from "./views/user/usersRoute";                         // <--- user route
import organizationRoute from "./views/organization/organizationRoute";    // <--- organization route
import assetRoutes from "./views/assets/assetRoute";
import employeeRoutes from './views/employees/employeeRoutes';
import eventsRoutes from "./views/events/eventsRoutes";
import Error404 from "./views/sessions/Error";
import sessionsRoutes from "./views/sessions/sessionsRoutes";

const getHomeRoute = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const role = String(storedUser?.role || "").toLowerCase();
    return role === "admin" ? "/dashboard/v1" : "/dashboard/user";
  } catch {
    return "/dashboard/user";
  }
};



export const protectedRoutes = [
  ...dashboardRoutes,
  ...usersRoute,                           // <--- user route
  ...employeeRoutes,
  ...organizationRoute,                    // <--- organization Route
  ...assetRoutes,                      // AssetRoutes
  ...timesheetRoutes,
  ...uiKitsRoutes,
  ...formsRoutes,
  ...widgetsRoute,
  ...chartsRoute,
  ...dataTableRoute,
  ...extraKitsRoutes,
  ...pagesRoutes,
  ...iconsRoutes,
  ...invoiceRoutes,
  ...inboxRoutes,
  ...calendarRoutes,
  ...taskManagerRoutes,
  ...ecommerceRoutes,
  ...contactRoutes,
  ...chatRoutes,
  ...hrcal,
  ...eventsRoutes,
  
  
];
const routes = createBrowserRouter([
  {
    element: <AuthGuard />,
    children: protectedRoutes
  },
  ...sessionsRoutes,
  { path: "/", loader: () => redirect(getHomeRoute()) },
  { path: "*", element: <Error404 /> }
]);

export default routes;
