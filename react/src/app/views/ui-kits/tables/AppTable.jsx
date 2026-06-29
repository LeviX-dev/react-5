import { Card, Col, Row, Table } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppTable() {
  const newUserList = [
    {
      name: "Smith Doe",
      email: "Smith@gmail.com",
      status: "active",
      photoUrl: "/assets/images/faces/1.jpg"
    },
    {
      name: "Jhon Doe",
      email: "Jhon@gmail.com",
      status: "pending",
      photoUrl: "/assets/images/faces/2.jpg"
    },
    {
      name: "Alex",
      email: "Otttio@gmail.com",
      status: "inactive",
      photoUrl: "/assets/images/faces/3.jpg"
    }
  ];

  const getUserStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "inactive":
        return "bg-warning";
      case "pending":
        return "bg-primary";
      default:
        break;
    }
  };

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Table" }]} />

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Basic Table</Card.Title>

            <Table className="text-center">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table"
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Basic Dark Table</Card.Title>
            <Table variant="dark" className="text-center">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table"
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Light Table Head</Card.Title>
            <p>
              Similar to tables and dark tables, use the modifier classes
              <code>.table-light</code> to make <code>thead</code> appear light
            </p>

            <Table className="text-center">
              <thead className="table-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table"
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Dark Table head</Card.Title>
            <p>
              Similar to tables and dark tables, use the modifier classes
              <code>.table-dark</code> to make <code>thead</code> appear Dark
            </p>

            <Table className="text-center">
              <thead className="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table "
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold"></i>
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold"></i>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Striped Rows</Card.Title>
            <Card.Title>
              Use <code>.table-striped</code> to add zebra-striping to any table rowwithin the{" "}
              <code>&lt;tbody&gt;</code>.
            </Card.Title>

            <Table responsive striped className="text-center">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table"
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Dark Table head</Card.Title>
            <p>
              Use <code>.table-striped</code> to add zebra-striping to any table rowwithin the{" "}
              <code>&lt;tbody&gt;</code>.
            </p>

            <Table responsive striped variant="dark" className="text-center">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table"
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Light Bordered Table</Card.Title>
            <Card.Text>
              Add <code>.table-bordered</code> for borders on all sides of the table and cells.
            </Card.Text>

            <Table bordered className="text-center">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table "
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Dark Bordered Table</Card.Title>
            <Card.Text>
              Add <code>.table-bordered</code> for borders on all sides of the table and cells.
            </Card.Text>

            <Table bordered variant="dark">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table"
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Light Borderless Table</Card.Title>
            <Card.Text>
              Add <code>.table-borderless</code> for a table without borders.
            </Card.Text>

            <Table borderless className="text-center">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table "
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Dark Borderless Table</Card.Title>
            <p>
              Add <code>.table-borderless</code> for a table without borders.
            </p>
            <Table variant="dark" borderless>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table "
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Light hoverable Table</Card.Title>

            <p>
              Add <code>.table-hover</code> to enable a hover state on table rows within a{" "}
              <code>&lt;tbody&gt;</code>.
            </p>

            <Table hover className="text-center">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table "
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Dark hoverable Table</Card.Title>
            <p>
              Add <code>.table-hover</code> to enable a hover state on table rows within a{" "}
              <code>&lt;tbody&gt;</code>.
            </p>

            <Table hover variant="dark">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table "
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Light Small Table</Card.Title>
            <Card.Text>
              Add <code>.table-sm</code> to make tables more compact by cutting cell padding in
              half.
            </Card.Text>

            <div className="table-responsive">
              <Table dark size="sm" className="text-center">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Avatar</th>
                    <th scope="col">Email</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {newUserList.map((user, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{user.name}</td>
                      <td>
                        <img
                          className="rounded-circle m-0 avatar-sm-table "
                          src={user.photoUrl}
                          alt=""
                        />
                      </td>

                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${getUserStatusClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <span className="cursor-pointer text-success me-2">
                          <i className="nav-icon i-Pen-2 font-weight-bold" />
                        </span>
                        <span className="cursor-pointer text-danger me-2">
                          <i className="nav-icon i-Close-Window font-weight-bold" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Dark Small Table</Card.Title>
            <p>
              Add <code>.table-sm</code> to make tables more compact by cutting cell padding in
              half.
            </p>

            <Table responsive variant="dark" size="sm">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table "
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Light Table With Contextual classes</Card.Title>
            <Card.Text>Use contextual classes to color table rows or individual cells.</Card.Text>

            <Table responsive>
              <thead className="">
                <tr className="table-primary">
                  <th scope="col">#</th>
                  <th scope="col">First</th>
                  <th scope="col">Last</th>
                  <th scope="col">Handle</th>
                  <th scope="col">Handle 2</th>
                  <th scope="col">Handle 3</th>
                  <th scope="col">Handle 4</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-success">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr className="table-active">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr className="table-info">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr className="table-warning">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr className="table-dark">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr>
                  <td className="table-active">...</td>

                  <td className="table-primary">...</td>
                  <td className="table-secondary">...</td>
                  <td className="table-success">...</td>
                  <td className="table-danger">...</td>
                  <td className="table-warning">...</td>
                  <td className="table-info">...</td>
                </tr>
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Dark Table With Background</Card.Title>
            <p>
              Regular table background variants are not available with the dark table, however, you
              may use text or background utilities to achieve similar styles.
            </p>

            <Table responsive variant="dark">
              <thead>
                <tr className="bg-primary">
                  <th scope="col">#</th>
                  <th scope="col">First</th>
                  <th scope="col">Last</th>
                  <th scope="col">Handle</th>
                  <th scope="col">Handle 2</th>
                  <th scope="col">Handle 3</th>
                  <th scope="col">Handle 4</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-success">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr className="bg-active">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr className="bg-info">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr className="bg-warning">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr className="bg-dark">
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                  <td>@mdo</td>
                </tr>
                <tr>
                  <td className="bg-active">...</td>

                  <td className="bg-primary">...</td>
                  <td className="bg-secondary">...</td>
                  <td className="bg-success">...</td>
                  <td className="bg-danger">...</td>
                  <td className="bg-warning">...</td>
                  <td className="bg-info">...</td>
                </tr>
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Light Table with Caption</Card.Title>
            <p>
              A <code>&lt;caption&gt;</code> functions like a heading for a table. It helps users
              with screen readers to find a table and understand what it’s about and decide if they
              want to read it.
            </p>

            <Table responsive className="text-center">
              <caption>List of users</caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table "
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card body>
            <Card.Title>Dark Table with caption</Card.Title>
            <p>
              A <code>&lt;caption&gt;</code> functions like a heading for a table. It helps users
              with screen readers to find a table and understand what it’s about and decide if they
              want to read it.
            </p>

            <Table responsive variant="dark" className="text-center">
              <caption>List of users</caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Avatar</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newUserList.map((user, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>
                      <img
                        className="rounded-circle m-0 avatar-sm-table"
                        src={user.photoUrl}
                        alt=""
                      />
                    </td>

                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getUserStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="cursor-pointer text-success me-2">
                        <i className="nav-icon i-Pen-2 font-weight-bold" />
                      </span>
                      <span className="cursor-pointer text-danger me-2">
                        <i className="nav-icon i-Close-Window font-weight-bold" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
