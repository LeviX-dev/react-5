import { lazy } from "react";
import AllPaySlips from "./AllPaySlips";

const ManageHoliday = lazy(() => import("./ManageHoliday"));
const ManageLeave = lazy(() => import("./ManageLeave"));

const hrcal = [
  {
    path: "/HRCal/Manage Holiday",
    element: <ManageHoliday />,
  },
  {
    path: "/HRCal/Manage Leave",
    element: <ManageLeave />,
  },
    {
    path: "/pay-slips",
    element: <AllPaySlips />,
  },
];

export default hrcal;
