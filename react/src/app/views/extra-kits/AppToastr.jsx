import { Card, Col, Row, Button } from "react-bootstrap";
import { toast } from "react-toastify";

import Breadcrumb from "app/components/Breadcrumb";

export default function AppToastify() {
  return (
    <div>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Extra Kits", path: "/extra-kits" },
          { name: "Toastify" }
        ]}
      />

      <Row>
        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Types</Card.Title>

            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                onClick={() => toast.success("This is success toaster")}>
                Success
              </Button>

              <Button variant="outline-info" onClick={() => toast.info("Info message")}>
                Info
              </Button>

              <Button variant="outline-warning" onClick={() => toast.warning("Warning Message")}>
                Warning
              </Button>

              <Button variant="outline-danger" onClick={() => toast.error("Danger Message")}>
                Danger
              </Button>

              <Button variant="outline-default" onClick={() => toast("Default Message")}>
                Default
              </Button>
            </div>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>With Timeout</Card.Title>

            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                onClick={() => toast.success("This is success toaster", { autoClose: 2000 })}>
                Success (2s)
              </Button>

              <Button
                variant="outline-info"
                onClick={() => toast.info("Info message", { autoClose: 3000 })}>
                Info (3s)
              </Button>

              <Button
                variant="outline-warning"
                onClick={() => toast.warning("Warning Message", { autoClose: 4000 })}>
                Warning (4s)
              </Button>

              <Button
                variant="outline-danger"
                onClick={() => toast.error("Danger Message", { autoClose: 5000 })}>
                Danger (5s)
              </Button>
            </div>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Without Progress</Card.Title>

            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                onClick={() => toast.success("This is success toaster", { hideProgressBar: true })}>
                Success
              </Button>

              <Button
                variant="outline-info"
                onClick={() => toast.info("Info message", { hideProgressBar: true })}>
                Info
              </Button>

              <Button
                variant="outline-warning"
                onClick={() => toast.warning("Warning Message", { hideProgressBar: true })}>
                Warning
              </Button>

              <Button
                variant="outline-danger"
                onClick={() => toast.error("Danger Message", { hideProgressBar: true })}>
                Danger
              </Button>
            </div>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card body>
            <Card.Title>Position</Card.Title>

            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="outline-success"
                onClick={() => toast("Position Top Left", { position: "top-left" })}>
                Top-Left
              </Button>

              <Button
                variant="outline-info"
                onClick={() => toast("Position Top Center", { position: "top-center" })}>
                Top-Center
              </Button>

              <Button
                variant="outline-info"
                onClick={() => toast("Position Bottom Right", { position: "bottom-right" })}>
                Bottom-Right
              </Button>

              <Button
                variant="outline-success"
                onClick={() => toast("Position Bottom Left", { position: "bottom-left" })}>
                Bottom-Left
              </Button>

              <Button
                variant="outline-info"
                onClick={() => toast("Position Bottom Center", { position: "bottom-center" })}>
                Bottom-Center
              </Button>

              <Button
                variant="outline-info"
                onClick={() => toast("Position Bottom Right", { position: "bottom-right" })}>
                Bottom-Right
              </Button>
            </div>
          </Card>
        </Col>

        <Col md={6}>
          <Card body>
            <Card.Title>Custom Icon</Card.Title>

            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                onClick={() => toast.info("Custom Icon Included", { icon: () => <span>🚀</span> })}>
                Custom Icon
              </Button>

              <Button
                variant="outline-success"
                onClick={() =>
                  toast("Custom Icon Included", {
                    icon: () => <i className="i-Sand-watch-2" />
                  })
                }>
                Custom Icon
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
