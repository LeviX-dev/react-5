import clsx from "clsx";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import ReactPaginate from "react-paginate";

const formatDisplayDate = (value) => {
  if (!value) return "—";

  const rawValue = String(value).trim();
  const dateOnly = rawValue.includes("T") ? rawValue.split("T")[0] : rawValue;
  const parsedDate = /^\d{2}-\d{2}-\d{4}$/.test(dateOnly)
    ? (() => {
        const [day, month, year] = dateOnly.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day));
      })()
    : new Date(dateOnly);

  if (Number.isNaN(parsedDate.getTime())) return dateOnly;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PRODUCT_LIST = [
  { name: "Watch", date: "12-10-2019", price: 30, status: "delivered" },
  { name: "Iphone", date: "24-10-2019", price: 350, status: "pending" },
  { name: "Headphone", date: "11-11-2019", price: 10, status: "not delivered" }
];

export default function TotalSales() {
  return (
    <Col lg={6}>
      <Card className="o-hidden mb-4">
        <Card.Header>
          <Card.Title as="h3" className="mb-0">
            Total Sales
          </Card.Title>
        </Card.Header>

        <Table hover responsive className="dataTable-collapse text-center">
          <thead>
            <tr>
              {["#", "Product", "Date", "Price", "Status", "Action"].map((item) => (
                <th scope="col" className="py-3" key={item}>
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {PRODUCT_LIST.map((product, index) => (
              <tr key={index}>
                <th className="py-3" scope="row">
                  {index + 1}
                </th>
                <td className="py-3">{product.name}</td>
                <td className="py-3">{formatDisplayDate(product.date)}</td>
                <td className="py-3">${product.price}</td>
                <td className="py-3">
                  <span
                    className={clsx("badge", {
                      "bg-success": product.status === "delivered",
                      "bg-warning": product.status === "not delivered",
                      "bg-primary": product.status === "pending"
                    })}>
                    {product.status}
                  </span>
                </td>

                <td className="py-3">
                  <div className="d-flex justify-content-center gap-2">
                    <span className="cursor-pointer text-success">
                      <i className="nav-icon i-Pen-2 font-weight-bold" />
                    </span>

                    <span className="cursor-pointer text-danger">
                      <i className="nav-icon i-Close-Window font-weight-bold" />
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="px-3 pb-3 mt-3 d-flex flex-row justify-content-end">
          <ReactPaginate
            nextLabel="Next"
            breakLabel="..."
            previousLabel="Previous"
            breakClassName="break-me"
            pageCount={5}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={() => {}}
            containerClassName="pagination"
            subContainerClassName="pages pagination"
            activeClassName="active"
          />
        </div>
      </Card>
    </Col>
  );
}
