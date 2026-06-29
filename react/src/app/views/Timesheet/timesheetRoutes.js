import { lazy } from "react";

const AddAndUpdate = lazy(() => import("./AddAndUpdate"));
const ManageHoliday = lazy(() => import("./ManageHoliday"));
const ManageLeave = lazy(() => import("./ManageLeave"));
const Importattendance = lazy(() => import("./ImportAttendance"));
const OfficeShift = lazy(() => import("./OfficeShift"));
const OfficeShift1 = lazy(() => import("./OfficeShift1"));
const AttendanceRequests = lazy(() => import("./AttendanceRequests"));
const OfficeShiftForm = lazy(() => import("./OfficeShiftForm"));
const DailyAttendance = lazy(() => import("./DailyAttendance"));
const DateWiseAttendance = lazy(() => import("./DateWiseAttendance"));
const MonthlyAttendance = lazy(() => import("./MonthlyAttendance"));
const LiveTrackingMap = lazy(() => import("./LiveTrackingMap"));
const timesheetRoutes = [
  {
    path: "/Timesheet/Add And Update",
    element: <AddAndUpdate />,
  },
   {
    path: "/Timesheet/Manage Holiday",
    element: <ManageHoliday />,
  },
  {
    path: "/Timesheet/Manage Leave",
    element: <ManageLeave />,
  },
  {
    path: "/Timesheet/Import Attendance",
    element: <Importattendance />,
  },
  {
    path: "/Timesheet/Office Shift",
    element: <OfficeShift />,
  },
 
   {
     path: "/timesheet/office-shift1",
  element: <OfficeShift1 />,
  },
   {
     path: "/timesheet/Attendance Requests",
  element: <AttendanceRequests />,
  },
  {
  path: "/timesheet/office-shift-form",
  element: <OfficeShiftForm />,
},
  {
  path: "/timesheet/Daily Attendance",
  element: <DailyAttendance />,
},
{
  path: "/timesheet/date-wise-attendance",
  element: <DateWiseAttendance />,
},
{
  path: "/timesheet/monthly-attendance",
  element: <MonthlyAttendance />,
},
{
  path: "/Timesheet/Live Location Tracking",
  element: <LiveTrackingMap />,
},


];

export default timesheetRoutes;
