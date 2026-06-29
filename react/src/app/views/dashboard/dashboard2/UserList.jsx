import clsx from "clsx";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import ReactPaginate from "react-paginate";

const USER_LIST = [
  {
    name: "David Hopkins",
    email: "hopkins@gmail.com",
    photoUrl: "/assets/images/faces/2.jpg",
    status: "active"
  },
  {
    name: "James Mitchell",
    email: "petter@gmail.com",
    photoUrl: "/assets/images/faces/3.jpg",
    status: "pending"
  },
  {
    name: "Jessica Mitchell",
    email: "johndoe@gmail.com",
    photoUrl: "/assets/images/faces/4.jpg",
    status: "inactive"
  }
];

export default function UserList() {
  return (
    <Col lg={6}>
      <Card className="o-hidden mb-4">
        <Card.Header>
          <Card.Title as="h3" className="mb-0">
            New Users
          </Card.Title>
        </Card.Header>

        <Table hover responsive id="user_table" className="table dataTable-collapse text-center">
          <thead>
            <tr>
              {["#", "Name", "Avatar", "Email", "Status", "Action"].map((item) => (
                <th className="py-3" scope="col" key={item}>
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {USER_LIST.map((user, index) => (
              <tr key={index}>
                <th className="py-3" scope="row">
                  {index + 1}
                </th>

                <td className="py-3">{user.name}</td>

                <td className="py-3">
                  <img className="rounded-circle m-0 avatar-sm-table" src={user.photoUrl} alt="" />
                </td>

                <td className="py-3">{user.email}</td>

                <td className="py-3">
                  <span
                    className={clsx("badge", {
                      "bg-success": user.status === "active",
                      "bg-warning": user.status === "inactive",
                      "bg-primary": user.status === "pending"
                    })}>
                    {user.status}
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
            previousLabel="Previous"
            nextLabel="Next"
            breakLabel="..."
            breakClassName="break-me"
            pageCount={5}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={() => {}}
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activeClassName={"active"}
          />
        </div>
      </Card>
    </Col>
  );
}
