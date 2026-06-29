import ReactPaginate from "react-paginate";
import { Card, Col, Row } from "react-bootstrap";

import Breadcrumb from "app/components/Breadcrumb";

export default function AppPagination() {
  const handlePageClick = (data) => {
    // let pageNumber = data.selected;
  };

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Pagination" }]} />

      <Row>
        <Col md={6} className="mb-4">
          <p>
            use a large block of connected links for our pagination, making links hard to miss and
            easily scalable—all while providing large hit areas. Pagination is built with list HTML
            elements so screen readers can announce the number of available links. Use a wrapping
            <code>nav</code> element to identify it as a navigation section to screen readers and
            other assistive technologies.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card body>
            <Card.Title>Basic pagination</Card.Title>
            <ReactPaginate
              nextLabel="Next"
              breakLabel="..."
              previousLabel="Previous"
              pageCount={5}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              breakClassName="break-me"
              onPageChange={handlePageClick}
              activeClassName="active"
              containerClassName="pagination"
              subContainerClassName="pages pagination"
            />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body>
            <Card.Title>Pagination with Icons</Card.Title>

            <ReactPaginate
              previousLabel={<i className="i-Previous" />}
              nextLabel={<i className="i-Next1" />}
              breakLabel="..."
              breakClassName="break-me"
              pageCount={5}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              activeClassName="active"
              containerClassName="pagination"
              subContainerClassName="pages pagination"
            />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body>
            <Card.Title>Pagination with Initial State</Card.Title>

            <ReactPaginate
              breakLabel="..."
              nextLabel="Next"
              previousLabel="Previous"
              breakClassName="break-me"
              pageCount={5}
              initialPage={2}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              onPageChange={handlePageClick}
              activeClassName="active"
              containerClassName="pagination"
              subContainerClassName="pages pagination"
            />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body>
            <Card.Title>Large Pagination</Card.Title>

            <ReactPaginate
              breakLabel="..."
              nextLabel="Next"
              previousLabel="Previous"
              breakClassName="break-me"
              pageCount={5}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              onPageChange={handlePageClick}
              activeClassName="active"
              subContainerClassName="pages pagination"
              containerClassName="pagination pagination-lg"
            />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body>
            <Card.Title>Small Pagination</Card.Title>

            <ReactPaginate
              breakLabel="..."
              nextLabel="Next"
              previousLabel="Previous"
              breakClassName="break-me"
              pageCount={5}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              onPageChange={handlePageClick}
              activeClassName="active"
              subContainerClassName="pages pagination"
              containerClassName="pagination pagination-sm"
            />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body>
            <Card.Title>Pagination Align Left</Card.Title>

            <ReactPaginate
              breakLabel="..."
              nextLabel="Next"
              previousLabel="Previous"
              breakClassName="break-me"
              pageCount={5}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              onPageChange={handlePageClick}
              activeClassName="active"
              containerClassName="pagination pagination-sm"
            />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body>
            <Card.Title>Pagination Align Center</Card.Title>

            <div className="d-flex justify-content-center">
              <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                previousLabel="Previous"
                breakClassName="break-me"
                pageCount={5}
                pageRangeDisplayed={5}
                marginPagesDisplayed={2}
                onPageChange={handlePageClick}
                activeClassName="active"
                containerClassName="pagination pagination-sm"
              />
            </div>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card body>
            <Card.Title>Pagination Align Right</Card.Title>

            <div className="d-flex justify-content-end">
              <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                previousLabel="Previous"
                breakClassName="break-me"
                pageCount={5}
                pageRangeDisplayed={5}
                marginPagesDisplayed={2}
                onPageChange={handlePageClick}
                activeClassName="active"
                containerClassName="pagination pagination-sm"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
