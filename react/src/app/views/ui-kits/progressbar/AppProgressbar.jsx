import { Card, Col, ProgressBar, Row } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppProgressbar() {
  const variantList = ["primary", "success", "info", "warning", "danger"];

  return (
    <div>
      <Breadcrumb
        routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Progress Bar" }]}
      />

      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Basic Progress Bar</Card.Title>

            {[25, 50, 75, 100].map((value) => (
              <ProgressBar key={value} now={value} className="mb-3" />
            ))}
          </Card>
        </Col>

        <Col md={6}>
          <Card body>
            <Card.Title>Basic Progress Bar With Label</Card.Title>

            {[25, 50, 75, 100].map((value) => (
              <ProgressBar key={value} now={value} label={`${value}%`} className="mb-3" />
            ))}
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Basic Progress Bar With diff. Background</Card.Title>

            {[10, 25, 50, 75, 100].map((value, i) => (
              <ProgressBar key={value} now={value} variant={variantList[i]} className="mb-3" />
            ))}
          </Card>
        </Col>

        <Col md={6}>
          <Card body>
            <Card.Title>Labeled Progress Bar With diff. background</Card.Title>

            {[10, 25, 50, 75, 100].map((value, i) => (
              <ProgressBar
                key={value}
                now={value}
                className="mb-3"
                label={`${value}%`}
                variant={variantList[i]}
              />
            ))}
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Progress Bar With Multiple bars</Card.Title>

            <ProgressBar className="mb-3">
              <ProgressBar variant="" now={10} key={1} />
              <ProgressBar variant="success" now={25} key={2} />
              <ProgressBar variant="info" now={50} key={3} />
            </ProgressBar>

            <ProgressBar className="mb-3">
              <ProgressBar variant="" now={20} label="20%" key={1} />
              <ProgressBar variant="" now={35} label="35%" key={2} />
              <ProgressBar variant="danger" now={40} label="40%" key={3} />
            </ProgressBar>

            <ProgressBar className="mb-3">
              <ProgressBar variant="success" now={15} label="15%" key={1} />
              <ProgressBar variant="info" now={25} label="25%" key={2} />
              <ProgressBar variant="warning" now={30} label="30%" key={3} />
            </ProgressBar>

            <ProgressBar className="mb-3">
              <ProgressBar variant="warning" now={20} label="20%" key={1} />
              <ProgressBar variant="" now={20} label="20%" key={2} />
              <ProgressBar variant="danger" now={50} label="50%" key={3} />
            </ProgressBar>

            <ProgressBar className="mb-3">
              <ProgressBar striped variant="success" now={15} label="15%" key={1} />
              <ProgressBar striped variant="info" now={25} label="25%" key={2} />
              <ProgressBar striped variant="warning" now={30} label="30%" key={3} />
            </ProgressBar>
          </Card>
        </Col>

        <Col md={6}>
          <Card body>
            <Card.Title>Striped Progress Bar</Card.Title>

            {[10, 25, 50, 75, 100].map((value, i) => (
              <ProgressBar
                striped
                key={value}
                now={value}
                className="mb-3"
                label={`${value}%`}
                variant={variantList[i]}
              />
            ))}
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Animated stripes Progress Bar</Card.Title>

            {[10, 25, 50, 75, 100].map((value, i) => (
              <ProgressBar
                striped
                animated
                key={value}
                now={value}
                className="mb-3"
                variant={variantList[i]}
              />
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
