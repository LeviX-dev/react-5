import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Col, ListGroup, ListGroupItem, Row } from "react-bootstrap";

export default function AppCard() {
  const state = {
    cardList1: [
      { icon: "i-Add-User", title: "205", subtitle: "new leads" },
      { icon: "i-Financial", title: "4021", subtitle: "sales" },
      { icon: "i-Checkout-Basket", title: "80", subtitle: "checkout" },
      { icon: "i-Money-2", title: "120", subtitle: "expense" }
    ],
    cardList2: [
      { icon: "i-Data-Download", subtitle: "Today's Upload", title: "21" },
      { icon: "i-Add-User", subtitle: "new users", title: "53" },
      { icon: "i-Money-2", subtitle: "total sales", title: "4031" },
      { icon: "i-Money-2", title: "4031" },
      { icon: "i-Gear", title: "4031" },
      { icon: "i-Bell", title: "4031" }
    ],
    bigImageCard: [
      {
        title: "card title",
        subtitle: "Last updated 3 mins ago",
        date: "03.12.2018",
        comment: 12,
        photoUrl: "/assets/images/photo-long-1.jpg"
      },
      {
        title: "card title",
        subtitle: "Last updated 3 mins ago",
        date: "09.11.2019",
        comment: 22,
        photoUrl: "/assets/images/photo-long-2.jpg"
      },
      {
        title: "card title",
        subtitle: "Last updated 3 mins ago",
        date: "09.11.2019",
        comment: 22,
        photoUrl: "/assets/images/photo-long-2.jpg"
      }
    ]
  };

  let { cardList1 = [], cardList2 = [], bigImageCard = [] } = state;

  return (
    <Fragment>
      <Row>
        {cardList1.map((card, index) => (
          <Col lg={3} sm={6} key={index}>
            <Card className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
              <Card.Body>
                <i className={card.icon} />
                <div className="content">
                  <p className="text-muted mb-0 text-capitalize">{card.subtitle}</p>
                  <p className="lead text-primary text-24 mb-2 text-capitalize">{card.title}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col lg={6}>
          <Row>
            {cardList2.map((card, index) => (
              <Col md={4} key={index}>
                <Card body className="card-icon-big mb-4 text-center">
                  <i className={card.icon} />
                  <p className="text-muted mt-2 mb-0 text-capitalize">{card.subtitle}</p>
                  <p className="lead text-18 mt-2 mb-0 text-capitalize">{card.title}</p>
                </Card>
              </Col>
            ))}

            <Col md={6}>
              <Card body className="card-profile-1 text-center mb-4">
                <div className="avatar box-shadow-2 mb-3">
                  <img src="/assets/images/faces/16.jpg" alt="" />
                </div>

                <h5 className="m-0">Jassica Hike</h5>
                <p className="mt-0">UI/UX Designer</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae cumque.</p>
                <button className="btn btn-primary btn-rounded">Contact Jassica</button>

                <div className="card-socials-simple mt-4">
                  <span className="cursor-pointer px-1">
                    <i className="i-Linkedin-2" />
                  </span>
                  <span className="cursor-pointer px-1">
                    <i className="i-Facebook-2" />
                  </span>
                  <span className="cursor-pointer px-1">
                    <i className="i-Twitter" />
                  </span>
                </div>
              </Card>

              <Card className="mb-4">
                <Card.Header>Featured</Card.Header>
                <Card.Body className="card-body">
                  <Card.Title>Card title text</Card.Title>
                  <Card.Text>
                    With supporting text below as a natural lead-in to additional content.
                  </Card.Text>

                  <Button as={Link} variant="primary" to="/" className="btn-rounded">
                    Go somewhere
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="bg-dark text-white o-hidden mb-4">
                <Card.Img src="/assets/images/photo-wide-2.jpg" alt="Card" />

                <div className="card-img-overlay">
                  <Card.Title className="text-white">Card title</Card.Title>

                  <Card.Text>
                    This is a wider card with supporting text below as a natural lead-in to
                    additional content. This content is a little bit longer.
                  </Card.Text>

                  <Card.Text>Last updated 3 mins ago</Card.Text>
                </div>
              </Card>

              <Card body className="mb-4">
                <Card.Title>Card title</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of the
                  card's content.
                </Card.Text>

                <Card.Link as={Link} to="/">
                  Card link
                </Card.Link>

                <Card.Link as={Link} to="/">
                  Another link
                </Card.Link>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col lg={6}>
          <Row>
            {/* BG IMAGE CARDS */}
            {bigImageCard.map((card, index) => (
              <Col md={6} key={index}>
                <Card className="bg-dark text-white o-hidden mb-4">
                  <Card.Img src={card.photoUrl} alt="Card" />

                  <Card.ImgOverlay>
                    <div className="text-center pt-4">
                      <Card.Title className="mb-2 text-white text-capitalize">
                        {card.title}
                      </Card.Title>

                      <div className="separator border-top mb-2" />
                      <p className="text-small font-italic">{card.subtitle}</p>
                    </div>

                    <div className="p-1 text-left card-footer font-weight-light d-flex gap-3">
                      <span className="gap-1 d-flex align-items-center">
                        <i className="i-Speach-Bubble-6" />
                        {card.comment}
                      </span>

                      <span className="d-flex align-items-center gap-1">
                        <i className="i-Calendar-4" />
                        {card.date}
                      </span>
                    </div>
                  </Card.ImgOverlay>
                </Card>
              </Col>
            ))}

            <Col md={6}>
              <Card className="mb-4 o-hidden">
                <Card.Img src="/assets/images/photo-wide-2.jpg" alt="" />
                <Card.Body>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illum, cumque!</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4 o-hidden">
                <Card.Img src="/assets/images/photo-wide-3.jpg" alt="" />

                <Card.Body>
                  <Card.Title>Card title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make up the bulk of the
                    card's content.
                  </Card.Text>
                </Card.Body>

                <ListGroup variant="flush">
                  <ListGroupItem>Cras justo odio</ListGroupItem>
                  <ListGroupItem>Dapibus ac facilisis in</ListGroupItem>
                  <ListGroupItem>Vestibulum at eros</ListGroupItem>
                </ListGroup>

                <Card.Body>
                  <Card.Link as={Link} to="/">
                    Card link
                  </Card.Link>
                  <Card.Link as={Link} to="/">
                    Another link
                  </Card.Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Fragment>
  );
}
