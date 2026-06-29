import { useState } from "react";
import Rating from "react-rating";
import { Card, Col, Row } from "react-bootstrap";
import { MdStar, MdFavorite, MdStarBorder, MdFavoriteBorder } from "react-icons/md";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppRating() {
  const [rate, setRate] = useState(3);
  const handleRatingChange = (value) => setRate(value);

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Rating" }]} />
      <Row>
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Star Rating</Card.Title>

            <Rating
              initialRating={rate}
              onChange={handleRatingChange}
              emptySymbol={<MdStarBorder size={22} />}
              fullSymbol={<MdStar className="text-warning" size={22} />}
            />

            <div className="mt-3">Rate: {rate}</div>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Heart Rating</Card.Title>

            <Rating
              stop={7}
              start={0}
              initialRating={rate}
              onChange={handleRatingChange}
              emptySymbol={<MdFavoriteBorder size={22} />}
              fullSymbol={<MdFavorite className="text-primary" size={22} />}
            />
            <div className="mt-3">Rate: {rate}</div>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Rating</Card.Title>

            <Rating
              initialRating={rate}
              emptySymbol={<MdStarBorder size={16} />}
              fullSymbol={<MdStar className="text-primary" size={16} />}
            />

            <br />

            <Rating
              initialRating={rate}
              emptySymbol={<MdStarBorder size={22} />}
              fullSymbol={<MdStar className="text-warning" size={22} />}
            />
            <br />

            <Rating
              initialRating={rate}
              emptySymbol={<MdStarBorder size={28} />}
              fullSymbol={<MdStar className="text-success" size={28} />}
            />
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Decimal Rating</Card.Title>

            <Rating
              fractions={2}
              initialRating={rate}
              onChange={handleRatingChange}
              emptySymbol={<MdFavoriteBorder size={22} />}
              fullSymbol={<MdFavorite className="text-primary" size={22} />}
            />

            <div className="mt-3">Rate: {rate}</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
