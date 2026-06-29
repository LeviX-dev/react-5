import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import Breadcrumb from "app/components/Breadcrumb";

import SimpleAccordion from "./SimpleAccordion";
import IconAccordion from "./IconAccordion";
import ArrowLessAccordion from "./ArrowLessAccordion";

export default function AppAccordion() {
  const prevLocation = useRef();
  const location = useLocation();

  useEffect(() => {
    if (prevLocation.current !== location.pathname) {
      window.scrollTo(0, 0);
      prevLocation.current = location.pathname;
    }
  }, [location]);

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Accordions" }]} />

      <Row className="mb-4">
        <Col md={6}>
          <SimpleAccordion />
        </Col>

        <Col md={6} className="mt-4 mt-md-0">
          <IconAccordion />
        </Col>

        <Col md={6} className="mt-4 mt-md-0">
          <ArrowLessAccordion />
        </Col>
      </Row>
    </div>
  );
}
