import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

const TOP_AUTHOR_LIST = [
  {
    name: "David Hopkins",
    description: "Lorem ipsum dolor sit amet consectetur.",
    photoUrl: "/assets/images/faces/2.jpg"
  },
  {
    name: "James Mitchell",
    description: "Lorem ipsum dolor sit amet consectetur.",
    photoUrl: "/assets/images/faces/3.jpg"
  },
  {
    name: "Jessica Mitchell",
    description: "Lorem ipsum dolor sit amet consectetur.",
    photoUrl: "/assets/images/faces/4.jpg"
  }
];

export default function TopAuthorList() {
  return (
    <Col lg={6}>
      <Card className="card-body mb-4">
        <Card.Title>Top Authors</Card.Title>

        <div className="d-flex flex-column gap-4">
          {TOP_AUTHOR_LIST.map((author, index) => (
            <div key={index} className="d-flex gap-3 align-items-center">
              <img className="avatar-md rounded" src={author.photoUrl} alt="" />

              <div className="flex-grow-1">
                <h6 className="mb-1">{author.name}</h6>
                <p className="m-0 text-small text-muted">{author.description}</p>
              </div>

              <button className="btn btn-outline-primary btn-rounded btn-sm">Follow</button>
            </div>
          ))}
        </div>
      </Card>
    </Col>
  );
}
