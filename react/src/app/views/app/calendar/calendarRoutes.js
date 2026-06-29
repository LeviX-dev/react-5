import { lazy } from "react";

const AppCalendar = lazy(() => import("./AppCalendar"));

const calendarRoutes = [{ path: "/calendar", element: <AppCalendar /> }];
export default calendarRoutes;
