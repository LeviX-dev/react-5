import { Card, Col, Row } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { iconList } from "./iconsMind";

export default function AppIcon() {
  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "Home", path: "/" }, { name: "Icons" }]} />
      <Card body title="Usage" className="mb-4">
        <code>&lt;i className="i-Add-Cart" /&gt;</code>
      </Card>

      <Card body>
        <Row>
          {iconList.map((i) => (
            <Col sm={2} key={i} className="text-center mb-3">
              <i className={`text-20 i-${i}`} />
              <p>i-{i}</p>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
