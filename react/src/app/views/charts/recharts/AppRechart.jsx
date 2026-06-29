import Card from "react-bootstrap/Card";
import Breadcrumb from "app/components/Breadcrumb";

import SimpleBarChart from "./SimpleBarChart";
import SimpleLineChart from "./SimpleLineChart";
import StackedAreaChart from "./StackedAreaChart";
import LineBarAreaComposedChart from "./LineBarAreaComposedChart";
import SimpleScatterChart from "./SimpleScatterChart";
import TwoSimplePieChart from "./TwoSimplePieChart";
import SimpleRadarChart from "./SimpleRadarChart";
import SimpleRadialBar from "./SimpleRadialBar";

export default function AppRechart() {
  return (
    <section>
      <Breadcrumb routeSegments={[{ name: "Charts", path: "/charts" }, { name: "Recharts" }]} />

      <Card body className="mb-4">
        <Card.Title>Simple Line Chart</Card.Title>
        <SimpleLineChart />
      </Card>

      <Card body className="mb-4">
        <Card.Title>Stacked Area Chart</Card.Title>
        <StackedAreaChart />
      </Card>

      <Card body className="mb-4">
        <Card.Title>Simple Bar Chart</Card.Title>
        <SimpleBarChart />
      </Card>

      <Card body className="mb-4">
        <Card.Title>Line Bar Area Composed Chart</Card.Title>
        <LineBarAreaComposedChart />
      </Card>

      <Card body className="mb-4">
        <Card.Title>Simple Scatter Chart</Card.Title>
        <SimpleScatterChart />
      </Card>

      <Card body className="mb-4">
        <Card.Title>Two Simple Pie Chart</Card.Title>
        <TwoSimplePieChart />
      </Card>

      <Card body className="mb-4">
        <Card.Title>Simple Radar Chart</Card.Title>
        <SimpleRadarChart />
      </Card>

      <Card body className="mb-4">
        <Card.Title>Simple Radar Bar Chart</Card.Title>
        <SimpleRadialBar />
      </Card>
    </section>
  );
}
