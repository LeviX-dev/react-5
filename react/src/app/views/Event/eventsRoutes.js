import { lazy } from "react";

// Lazy loaded pages
const Event = lazy(() => import("./Event"));
const Meeting = lazy(() => import("./Meeting"));

const eventsRoutes = [
  {
    path: "/events",
    element: <Event />
  },
  {
    path: "/meetings",
    element: <Meeting />
  }
];

export default eventsRoutes;
