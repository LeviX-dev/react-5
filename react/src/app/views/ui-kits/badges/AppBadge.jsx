import { Link } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

import Breadcrumb from "app/components/Breadcrumb";

export default function AppBadge() {
  const variantList = [
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark"
  ];

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Badges" }]} />

      <div className="mb-3">
        <Row>
          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Badge outline</Card.Title>

              {variantList.map((color) => (
                <Badge
                  key={color}
                  className={`bg-white text-${color} rounded-pill p-2 m-1 text-capitalize`}
                  variant={`outline-${color}`}>
                  {color}
                </Badge>
              ))}
            </Card>
          </Col>

          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Regular Badges</Card.Title>

              {variantList.map((color) => (
                <Badge key={color} className={`bg-${color} text-white p-1 m-1`}>
                  {color}
                </Badge>
              ))}
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-3">
        <Row>
          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Badge Pill</Card.Title>

              {variantList.map((color) => (
                <Badge key={color} className={`bg-${color} rounded-pill text-white p-1 m-1`}>
                  {color}
                </Badge>
              ))}
            </Card>
          </Col>

          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Badge Pill with Padding</Card.Title>

              {variantList.map((color) => (
                <Badge key={color} className={`bg-${color} rounded-pill text-white p-2 m-1`}>
                  {color}
                </Badge>
              ))}
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-3">
        <Row>
          <Col sm={6} xs={12}>
            <Card body>
              <Card.Title>Badge Link</Card.Title>

              {variantList.map((color, ind) => (
                <Link to="/uikits/badges" key={ind}>
                  <Badge className={`bg-${color} rounded-pill text-white p-1 m-1`}>{color}</Badge>
                </Link>
              ))}
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-3">
        <Row>
          <Col sm={6} xs={12}>
            <Card body className="mb-3">
              <Card.Title>Badge liSizing & Styles</Card.Title>

              <ul className="list-group list-group-flush">
                <h6 className="card-subtitle mt-2 mb-2 text-muted">Medium Size</h6>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge
                      key={i}
                      className={`badge-square-${color} bg-${color} rounded-circle text-white p-2 m-1`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge
                      key={i}
                      className={`badge-square-${color} bg-${color} text-white p-2 m-1`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>

                <h6 className="card-subtitle mt-2 mb-2 text-muted">Large Size</h6>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge
                      key={i}
                      className={`badge-square-${color} lg bg-${color} rounded-circle text-white p-2 m-1`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge
                      key={i}
                      className={`badge-square-${color} lg bg-${color} text-white p-2 m-1`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>

                <h6 className="card-subtitle mt-2 mb-2 text-muted">Extra Large Size</h6>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge
                      key={i}
                      className={`badge-square-${color} xl bg-${color} rounded-circle text-white p-2 m-1`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge
                      key={i}
                      className={`badge-square-${color} xl bg-${color} text-white p-2 m-1`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>
              </ul>
            </Card>

            <Card body>
              <Card.Title>More Styles & Options</Card.Title>

              <ul className="list-group list-group-flash">
                <h6 className="card-subtitle mt-2 mb-2 text-muted">Wide badges for longer text:</h6>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge key={i} className={`bg-${color} rounded-0 text-white p-1 m-1`}>
                      {color}
                    </Badge>
                  ))}
                </li>

                <h6 className="card-subtitle mt-2 mb-2 text-muted">Rounded badges examples:</h6>
                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge key={i} className={`bg-${color} text-white p-1 m-1`}>
                      {color}
                    </Badge>
                  ))}
                </li>
              </ul>
            </Card>
          </Col>

          <Col sm={6} xs={12}>
            <Card body className="mb-3">
              <Card.Title>Unified Styles</Card.Title>

              <ul className="list-group list-group-flash">
                <h6 className="card-subtitle mt-2 mb-2 text-muted">
                  Circle and Square Unified Styles
                </h6>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge key={i} className={`badge-round badge-round-opacity-${color} m-1`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>
              </ul>
            </Card>

            <Card body className="mb-3">
              <Card.Title>Basic Examples</Card.Title>

              <ul className="list-group list-group-flash">
                <h6 className="card-subtitle mt-2 mb-2 text-muted">
                  Circle and Square Unified Styles
                </h6>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge
                      key={i}
                      variant={color}
                      className={`badge-round-${color} bg-${color} text-white sm  m-1`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>
              </ul>

              <ul className="list-group list-group-flash">
                <h6 className="card-subtitle mt-2 mb-2 text-muted">Dot Styles Examples:</h6>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <span key={i} variant={color} className={`badge-dot-${color} me-1`}></span>
                  ))}
                </li>

                <li className="list-group-item border-0">
                  Pending <span className="badge-dot-primary me-1"></span>
                  Caption
                  <span className="badge-dot-secondary mr-1"></span> Heading
                  <span className="badge-dot-success mr-1"></span> Status
                  <span className="badge-dot-danger mr-1"></span>
                </li>
              </ul>
            </Card>

            <Card body>
              <Card.Title>Outline Badges</Card.Title>

              <ul className="list-group list-group-flash">
                <h6 className="card-subtitle mt-2 mb-2 text-muted">Basic state color badges:</h6>

                <li className="list-group-item border-0">
                  {variantList.map((color, i) => (
                    <Badge
                      key={i}
                      className={`outline-round-${color} bg-white text-${color} m-1`}
                      variant={`outline-${color}`}>
                      {String.fromCharCode(65 + i)}
                    </Badge>
                  ))}
                </li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
