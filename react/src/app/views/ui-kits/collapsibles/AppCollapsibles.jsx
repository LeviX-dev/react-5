import { Accordion, Card, Col, Row, useAccordionButton } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppCollapsible() {
  return (
    <div>
      <Breadcrumb
        routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Collapsibles" }]}
      />

      <div className="mb-3">
        <Row>
          <Col lg={4} className="mb-5">
            <Accordion>
              <Card body className="py-3">
                <div className="text-center">
                  <h5 className="heading text-primary">Inline or block element</h5>
                  <p className="mb-3 text-muted">Example of inline text toggler</p>
                  <CustomToggle
                    Tag="span"
                    eventKey={2}
                    className="t-font-boldest ul-cursor--pointer">
                    Toggle Context
                  </CustomToggle>
                </div>

                <Accordion.Collapse eventKey={2}>
                  <div className="mt-3">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry
                    richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor
                    brunch.
                  </div>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Col>

          <Col lg={4} className="mb-5">
            <Accordion>
              <Card body className="py-3">
                <div className="text-center">
                  <h5 className="heading text-primary">Text and other links</h5>
                  <p className="mb-3 text-muted">
                    Example of a simple <code>&lt;a&gt;</code> element
                  </p>
                  <CustomToggle
                    Tag={"a"}
                    eventKey={1}
                    className="font-weight-semibold collapsed typo_link text-primary t-font-boldest cursor-pointer">
                    Toggle Context
                  </CustomToggle>
                </div>

                <Accordion.Collapse eventKey={1}>
                  <div className="mt-3">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry
                    richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor
                    brunch.
                  </div>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Col>

          <Col lg={4} className="mb-5">
            <Accordion>
              <Card body className="py-3">
                <div className="text-center">
                  <h5 className="heading text-primary">Single or multiple icons</h5>
                  <p className="mb-3 text-muted">Icons in block or inline elements</p>

                  <CustomToggle
                    eventKey={2}
                    Tag={"span"}
                    className="text-default collapsed cursor-pointer">
                    <i className="i-Arrow-Down-2 t-font-boldest" />
                  </CustomToggle>
                </div>

                <Accordion.Collapse eventKey={2}>
                  <div className="mt-3">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry
                    richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor
                    brunch.
                  </div>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Col>

          <Col lg={4} className="mb-5">
            <Accordion>
              <Card body className="py-3">
                <div className="text-center">
                  <h5 className="heading text-primary">Button</h5>
                  <p className="mb-3 text-muted">Icons in block or inline elements</p>

                  <CustomToggle
                    eventKey={3}
                    Tag={"button"}
                    className="btn btn-primary collapsed cursor-pointer">
                    Toggle content
                  </CustomToggle>
                </div>

                <Accordion.Collapse eventKey={3}>
                  <div className="mt-3">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry
                    richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor
                    brunch.
                  </div>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function CustomToggle({ children, eventKey, Tag, className }) {
  const decoratedOnClick = useAccordionButton(eventKey);

  return (
    <Tag onClick={decoratedOnClick} className={className}>
      {children}
    </Tag>
  );
}
