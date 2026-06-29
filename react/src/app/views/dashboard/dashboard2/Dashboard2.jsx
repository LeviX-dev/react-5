import Row from "react-bootstrap/Row";
import Breadcrumb from "app/components/Breadcrumb";

import Sales from "./Sales";
import UserList from "./UserList";
import TotalSales from "./TotalSales";
import ActivityCards from "./ActivityCards";
import TopAuthorList from "./TopAuthorList";
import LastMonthSummary from "./LastMonthSummary";

export default function Dashboard2() {
  const routeSegments = [{ name: "Dashboard", path: "/dashboard" }, { name: "Version 2" }];

  return (
    <div>
      <Breadcrumb routeSegments={routeSegments} />

      <Row>
        {/* DIFFERENT ACTIVITY CARDS */}
        <ActivityCards />

        {/* SALES REPORT GRAPH */}
        <Sales />

        {/* LAST MONTH SUMMARY GRAPH */}
        <LastMonthSummary />

        {/* TOP AUTHOR LIST TABLE */}
        <TopAuthorList />
      </Row>

      <Row>
        {/* NEW USER LIST TABLE */}
        <UserList />

        {/* TOTAL SALES LIST TABLE */}
        <TotalSales />
      </Row>
    </div>
  );
}
