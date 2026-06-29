import { lazy } from "react";

const AppWidget = lazy(() => import("./AppWidget"));
const CardWidget = lazy(() => import("./CardWidget"));
const ListWidget = lazy(() => import("./ListWidget"));
const WeatherWidget = lazy(() => import("./WeatherWidget"));
const StatisticsWidget = lazy(() => import("./StatisticsWidget"));

const widgetsRoute = [
  { path: "/widgets/app", element: <AppWidget /> },
  { path: "/widgets/card", element: <CardWidget /> },
  { path: "/widgets/list", element: <ListWidget /> },
  { path: "/widgets/weather-app", element: <WeatherWidget /> },
  { path: "/widgets/statistics", element: <StatisticsWidget /> }
];

export default widgetsRoute;
