import { lazy } from "react";

const AppEchart = lazy(() => import("./echarts/AppEchart"));
const AppRechart = lazy(() => import("./recharts/AppRechart"));
const AppVictoryChart = lazy(() => import("./victory-charts/AppVictoryChart"));
const ApexAreaChart = lazy(() => import("./apex/ApexAreaChart"));
const ApexBarChart = lazy(() => import("./apex/ApexBarChart"));
const ApexLineChart = lazy(() => import("./apex/ApexLineChart"));
const ApexBubbleChart = lazy(() => import("./apex/ApexBubbleChart"));
const ApexMixChart = lazy(() => import("./apex/ApexMixChart"));
const ApexDoughnutChart = lazy(() => import("./apex/ApexDoughnutChart"));
const ApexRadialBarChart = lazy(() => import("./apex/ApexRadialBarChart"));
const ApexScatterChart = lazy(() => import("./apex/ApexScatterChart"));
const ApexSparkLineChart = lazy(() => import("./apex/ApexSparkLineChart"));
const ApexRadarChart = lazy(() => import("./apex/ApexRadarChart"));
const ApexColumnChart = lazy(() => import("./apex/ApexColumnChart"));

const chartsRoute = [
  { path: "/charts/echart", element: <AppEchart /> },
  { path: "/charts/recharts", element: <AppRechart /> },
  { path: "/charts/victory-chart", element: <AppVictoryChart /> },
  { path: "/charts/apex-chart/area", element: <ApexAreaChart /> },
  { path: "/charts/apex-chart/bar", element: <ApexBarChart /> },
  { path: "/charts/apex-chart/bubble", element: <ApexBubbleChart /> },
  { path: "/charts/apex-chart/mix", element: <ApexMixChart /> },
  { path: "/charts/apex-chart/doughnut", element: <ApexDoughnutChart /> },
  { path: "/charts/apex-chart/radial-bar", element: <ApexRadialBarChart /> },
  { path: "/charts/apex-chart/scatter", element: <ApexScatterChart /> },
  { path: "/charts/apex-chart/spark-line", element: <ApexSparkLineChart /> },
  { path: "/charts/apex-chart/radar", element: <ApexRadarChart /> },
  { path: "/charts/apex-chart/column", element: <ApexColumnChart /> },
  { path: "/charts/apex-chart/line", element: <ApexLineChart /> }
];

export default chartsRoute;
