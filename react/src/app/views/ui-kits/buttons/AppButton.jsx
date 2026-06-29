import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Breadcrumb from "app/components/Breadcrumb";
import LoadingButton from "app/components/LoadingButton";

export default function AppButton() {
  const variantList = ["primary", "success", "warning", "danger", "info", "light", "dark"];

  const socialButtonList = [
    { name: "facebook", icon: "i-Facebook-2" },
    { name: "google", icon: "i-Google-Plus" },
    { name: "twitter", icon: "i-Twitter" },
    { name: "instagram", icon: "i-Instagram" },
    { name: "linkedin", icon: "i-Linkedin-2" },
    { name: "dribble", icon: "i-Dribble" },
    { name: "youtube", icon: "i-Youtube" }
  ];

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Buttons" }]} />

      <div className="mb-3">
        <Row>
          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Default Buttons</Card.Title>

              {variantList.map((color) => (
                <Button key={color} variant={color} className="m-1 text-capitalize">
                  {color}
                </Button>
              ))}
            </Card>
          </Col>

          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Buttons Rounded</Card.Title>

              {variantList.map((color) => (
                <Button key={color} variant={color} className="btn-rounded m-1 text-capitalize">
                  {color}
                </Button>
              ))}
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-3">
        <Row>
          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Buttons Raised</Card.Title>

              {variantList.map((color) => (
                <Button
                  key={color}
                  variant={color}
                  className={`btn-raised btn-raised-${color} m-1 text-capitalize`}>
                  {color}
                </Button>
              ))}
            </Card>
          </Col>

          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Buttons outline</Card.Title>

              {variantList.map((color) => (
                <Button key={color} variant={`outline-${color}`} className="m-1 text-capitalize">
                  {color}
                </Button>
              ))}
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-3">
        <Row>
          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Button block</Card.Title>

              {variantList.slice(0, 3).map((color) => (
                <Button key={color} variant={color} className="d-block w-100 my-2 text-capitalize">
                  {color}
                </Button>
              ))}
            </Card>
          </Col>

          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Buttons outline</Card.Title>

              <div>
                {variantList.slice(0, 3).map((color) => (
                  <Button key={color} variant={color} size="sm" className="m-1 text-capitalize">
                    {color}
                  </Button>
                ))}
              </div>

              <div>
                {variantList.slice(0, 3).map((color) => (
                  <Button key={color} variant={color} className="m-1 text-capitalize">
                    {color}
                  </Button>
                ))}
              </div>

              <div>
                {variantList.slice(0, 3).map((color) => (
                  <Button key={color} variant={color} size="lg" className="m-1 text-capitalize">
                    {color}
                  </Button>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-3">
        <Row>
          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Styles- Button with Icons</Card.Title>

              <Button variant="primary" className="btn-icon m-1 text-capitalize">
                <span className="ul-btn__icon">
                  <i className="i-Gear-2" />
                </span>

                <span className="ul-btn__text">With Icon</span>
              </Button>

              <Button variant="info" className="btn-icon m-1 text-capitalize">
                <span className="ul-btn__icon">
                  <i className="i-RSS"></i>
                </span>
              </Button>

              <Button variant="success" className="btn-icon m-1 text-capitalize">
                button
              </Button>

              <Button variant="outline-danger" className="btn-icon m-1 text-capitalize">
                <span className="ul-btn__icon">
                  <i className="i-Shutter" />
                </span>
              </Button>

              <Button variant="warning" className="btn-icon m-1 text-capitalize">
                <span className="ul-btn__icon">
                  <i className="i-Atom" />
                </span>

                <span className="ul-btn__text">Atom</span>
              </Button>
            </Card>
          </Col>

          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Buttons Ripple</Card.Title>

              {variantList.map((color) => (
                <Button key={color} variant={color} className="ripple m-1 text-capitalize">
                  {color}
                </Button>
              ))}
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mb-3">
        <Row>
          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body className="mb-3">
              <Card.Title>Social</Card.Title>

              <div className="mb-3">
                {socialButtonList.map((item) => (
                  <Button
                    key={item.name}
                    variant="primary"
                    className={`btn-${item.name} btn-icon m-1 text-capitalize`}>
                    <span className="ul-btn__icon">
                      <i className={item.icon} />
                    </span>

                    <span className="ul-btn__text text-capitalize">{item.name}</span>
                  </Button>
                ))}
              </div>

              <div className="mb-3">
                {socialButtonList.map((item) => (
                  <Button
                    key={item.name}
                    variant="primary"
                    className={`btn-${item.name} btn-icon m-1 text-capitalize`}>
                    <span className="ul-btn__icon">
                      <i className={item.icon} />
                    </span>
                  </Button>
                ))}
              </div>

              <div>
                {socialButtonList.map((item) => (
                  <Button
                    key={item.name}
                    variant="primary"
                    className={`btn-${item.name} rounded-circle btn-icon m-1 text-capitalize`}>
                    <span className="ul-btn__icon">
                      <i className={item.icon} />
                    </span>
                  </Button>
                ))}
              </div>
            </Card>

            <Card body>
              <Card.Title>Button Group</Card.Title>

              <div className="d-flex align-items-center gap-2">
                {variantList.map((color) => (
                  <Button key={color} variant={`outline-${color}`} className="text-capitalize">
                    {color}
                  </Button>
                ))}
              </div>
            </Card>
          </Col>

          <Col lg={6} md={6} sm={6} xs={12}>
            <Card body>
              <Card.Title>Loading Button</Card.Title>

              <div className="mb-3 d-flex flex-wrap">
                {variantList.slice(0, 3).map((color, ind) => (
                  <LoadingButton
                    key={ind}
                    loading={true}
                    variant={color}
                    spinnerSize="sm"
                    animation="border"
                    className="text-capitalize m-1">
                    {color} loader
                  </LoadingButton>
                ))}
              </div>

              <div className="mb-3 d-flex flex-wrap">
                {variantList.slice(0, 3).map((color, ind) => (
                  <LoadingButton
                    key={ind}
                    loading={true}
                    variant={color}
                    animation="grow"
                    spinnerSize="sm"
                    className="text-capitalize m-1">
                    {color} loader
                  </LoadingButton>
                ))}
              </div>

              <div className="d-flex flex-wrap">
                {variantList.slice(0, 3).map((color, ind) => (
                  <LoadingButton
                    key={ind}
                    loading={true}
                    variant={color}
                    buttonSize="lg"
                    spinnerSize="lg"
                    animation="border"
                    className="text-capitalize m-1">
                    {color} loader
                  </LoadingButton>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
