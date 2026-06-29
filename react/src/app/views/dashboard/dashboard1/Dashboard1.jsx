import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Breadcrumb from "app/components/Breadcrumb";

// Page section components
import ThisYearSales        from "./ThisYearSales";
import SalesGraphs          from "./SalesGraphs";
import UserList             from "./UserList";
import TopSellingProducts   from "./TopSellingProducts";
import DepartmentEmployeeChart from "./DepartmentEmployeeChart";
import LastDaysLead         from "./LastDaysLead";

export default function Dashboard1() {
  const routeSegments = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "HR Dashboard" },
  ];

  return (
    <div>
      <Breadcrumb routeSegments={routeSegments} />

      {/* ── Row 1: HR metric summary cards ── */}
      <ThisYearSales />

      {/* ── Row 2: Two-column section ── */}
      <Row className="align-items-start">

        {/* Left column: attendance bar charts + employee table */}
        <Col lg={6}>
          {/* Daily late arrivals & early leaving bar charts */}
          <SalesGraphs />

          {/* Recently added employees table */}
          <UserList />
        </Col>

        {/* Right column: upcoming holidays + department headcount */}
        <Col lg={6}>
          {/* Upcoming public / company holidays */}
          <TopSellingProducts />

          {/* Employees by department donut chart */}
          <DepartmentEmployeeChart />
        </Col>

      </Row>

      {/* ── Row 3: Full-width attendance trend line chart ── */}
      <Row>
        <LastDaysLead />
      </Row>
    </div>
  );
}