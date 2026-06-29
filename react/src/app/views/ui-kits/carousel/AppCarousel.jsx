import { Card, Col, Row, Carousel } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppCarousel() {
  const carouselImageList = [
    "/assets/images/products/iphone-1.jpg",
    "/assets/images/products/headphone-1.jpg",
    "/assets/images/products/iphone-1.jpg"
  ];

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Carousel" }]} />

      <div className="mb-3">
        <Row className="mb-4">
          <Col md={6}>
            <p>
              use a large block of connected links for our pagination, making links hard to miss and
              easily scalable—all while providing large hit areas. Pagination is built with list
              HTML elements so screen readers can announce the number of available links. Use a
              wrapping
              <code>nav</code> element to identify it as a navigation section to screen readers and
              other assistive technologies.
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card body className="text-left">
              <Card.Title className="mb-3">Basic Carousel With Control</Card.Title>
              <p>can also add the indicators to the carousel, alongside the controls, too</p>

              <Carousel indicators={false}>
                {carouselImageList.map((img, ind) => (
                  <Carousel.Item key={ind}>
                    <img className="d-block w-100" src={img} alt="First slide" />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card body className="text-left">
              <Card.Title className="mb-3">Carousel With Indicators</Card.Title>
              <p>Adding in the previous and next controls</p>
              <Carousel>
                {carouselImageList.map((img, ind) => (
                  <Carousel.Item key={ind}>
                    <img className="d-block w-100" src={img} alt="First slide" />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card body className="text-left">
              <Card.Title className="mb-3">Carousel With Caption</Card.Title>
              <p>
                Add captions to your slides easily with the
                <code>{`<Carousel.Caption>`}</code> element within any
                <code>{`<Carousel.Item>`}</code> . They can be easily hidden on smaller viewports,
                as shown below, with optional display utilities.
              </p>

              <Carousel indicators={false}>
                {carouselImageList.map((img, ind) => (
                  <Carousel.Item key={ind}>
                    <img className="d-block w-100" src={img} alt="First slide" />
                    <Carousel.Caption>
                      <h5 className="text-white">Add captions to your slides easily</h5>
                      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                    </Carousel.Caption>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card body className="text-left">
              <Card.Title className="mb-3">Carousel With CrossFade</Card.Title>
              <p>
                Add <code>{`fade={true}`}</code> to your carousel component to animate slides with a
                fade transition instead of a slide.
              </p>

              <Carousel fade={true}>
                {carouselImageList.map((img, ind) => (
                  <Carousel.Item key={ind}>
                    <img className="d-block w-100" src={img} alt="First slide" />
                    <Carousel.Caption>
                      <h5 className="text-white">Add captions to your slides easily</h5>
                      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                    </Carousel.Caption>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
