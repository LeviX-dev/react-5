import { useState } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import {
  Dropdown,
  Accordion,
  Row,
  Col,
  Card,
  ProgressBar,
  ListGroup,
  Badge
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";

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

export default function TaskManager() {
  const [state, setState] = useState({
    notificationList: [
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      },
      {
        title: "#23. New icons set for an iOS app",
        text: "corruptedcorrupted 2corrupted 2 20 January, 2015 ",
        date: "20 January, 2015"
      }
    ],
    itemPerPage: 6,
    currentPage: 0
  });

  const handlePageClick = (data) => {
    let currentPage = data.selected;
    setState((prevState) => ({ ...prevState, currentPage }));
  };

  let { notificationList, currentPage, itemPerPage } = state;

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "Home", path: "/" }, { name: "Task Manager" }]} />

      <Row className="mb-4">
        <Col xl={10}>
          <div className="navbar navbar-expand-lg navbar-light navbar-component rounded">
            <div className="text-center d-lg-none w-100">
              <button
                type="button"
                className="task-manager-button navbar-toggler text-white"
                data-toggle="collapse"
                data-target="#navbar-filter">
                <i className="i-Filter-2" />
              </button>
            </div>

            <div className="navbar-collapse collapse" id="navbar-filter">
              <div className="filter-mobile">
                <span className="navbar-text fw-semibold ">Filter:</span>
              </div>

              <ul className="navbar-nav flex-wrap">
                <Dropdown className="nav-item mx-2">
                  <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
                    <Link className="navbar-nav-link" to="#">
                      <i className="i-Time-Window " /> By date
                    </Link>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Show all</Dropdown.Item>
                    <Dropdown.Divider></Dropdown.Divider>
                    <Dropdown.Item>Today</Dropdown.Item>
                    <Dropdown.Item>Yesterday</Dropdown.Item>
                    <Dropdown.Item>This week</Dropdown.Item>
                    <Dropdown.Item>This month</Dropdown.Item>
                    <Dropdown.Item>This year</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className="nav-item mx-2">
                  <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
                    <Link className="navbar-nav-link" to="#">
                      <i className="i-Bar-Chart-2 "></i> By status
                    </Link>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Show all</Dropdown.Item>
                    <Dropdown.Divider></Dropdown.Divider>
                    <Dropdown.Item>Open</Dropdown.Item>
                    <Dropdown.Item>On hold</Dropdown.Item>
                    <Dropdown.Item>Resolved</Dropdown.Item>
                    <Dropdown.Item>Closed</Dropdown.Item>
                    <Dropdown.Item>Duplicate</Dropdown.Item>
                    <Dropdown.Item>Invalid</Dropdown.Item>
                    <Dropdown.Item>Wontfix</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className="nav-item mx-2">
                  <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
                    <Link className="navbar-nav-link" to="#">
                      <i className="i-Arrow-Turn-Right "></i> By priority
                    </Link>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Show all</Dropdown.Item>
                    <Dropdown.Divider></Dropdown.Divider>
                    <Dropdown.Item>Highest</Dropdown.Item>
                    <Dropdown.Item>High</Dropdown.Item>
                    <Dropdown.Item>Normal</Dropdown.Item>
                    <Dropdown.Item>Low</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </ul>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={9}>
          <Row>
            {notificationList
              .slice(currentPage * itemPerPage, (currentPage + 1) * itemPerPage)
              .map((item, ind) => (
                <Col xl={6} key={ind}>
                  <Card className="mb-4">
                    <Card.Body>
                      <div className="d-sm-flex align-item-sm-center flex-sm-nowrap">
                        <div>
                          <h6>
                            <Link to="#">{item.title}</Link>
                          </h6>
                          <p className="ul-task-manager__paragraph mb-3">{item.text}</p>

                          <Link to="#">
                            <img
                              src="/assets/images/faces/1.jpg"
                              className="rounded-circle"
                              width="36"
                              height="36"
                              alt="corrupted"
                            />
                          </Link>

                          <Link to="#">
                            <img
                              src="/assets/images/faces/1.jpg"
                              className="rounded-circle"
                              width="36"
                              height="36"
                              alt="corrupted 2"
                            />
                          </Link>

                          <Link to="#">
                            <img
                              src="/assets/images/faces/1.jpg"
                              className="rounded-circle"
                              width="36"
                              height="36"
                              alt="corrupted 2"
                            />
                          </Link>

                          <Link to="#">
                            <i className="ml-1 ul-task-manager__fonts i-Add text-32 align-middle"></i>
                          </Link>
                        </div>

                        <ul className="list list-unstyled mb-0 mt-3 mt-sm-0 ms-auto">
                          <li>
                            <small className="ul-task-manager__font-date text-muted">
                              {formatDisplayDate(item.date)}
                            </small>
                          </li>

                          <Dropdown className="list-inline-item my-1">
                            <Dropdown.Toggle
                              as="span"
                              className="toggle-hidden cursor-pointer d-flex flex-wrap align-items-center">
                              <span>Priority: &nbsp;</span>
                              <Link
                                className="badge bg-danger align-top dropdown-toggle"
                                data-toggle="dropdown"
                                to="#">
                                Blocker
                              </Link>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>
                                <span className="badge bg-mark mr-2 border-danger"></span>
                                Blocker
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <span className="badge bg-mark mr-2 border-warning-400"></span>
                                High priority
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <span className="badge bg-mark mr-2 border-success"></span>
                                Normal priority
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <span className="badge bg-mark mr-2 border-grey-300"></span>
                                Low priority
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>

                          <li>
                            <Link to="#">Eternity app</Link>
                          </li>
                        </ul>
                      </div>
                    </Card.Body>

                    <Card.Footer className="d-sm-flex justify-content-sm-between align-items-sm-center">
                      <span>
                        Due:
                        <span className="fw-semibold">18 hours</span>
                      </span>

                      <ul className="list-inline mb-0 mt-2 mt-sm-0">
                        <Dropdown className="list-inline-item">
                          <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
                            On Hold
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item>Open</Dropdown.Item>
                            <Dropdown.Item>On hold</Dropdown.Item>
                            <Dropdown.Item>Resolved</Dropdown.Item>
                            <Dropdown.Item>Closed</Dropdown.Item>
                            <Dropdown.Divider></Dropdown.Divider>
                            <Dropdown.Item>Dublicate</Dropdown.Item>
                            <Dropdown.Item>Invalid</Dropdown.Item>
                            <Dropdown.Item>Wontfix</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown className="list-inline-item">
                          <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
                            <i className="i-Gear-2" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <i className="i-Bell" /> Check in
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <i className="i-Favorite-Window" /> Attach screenshot
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <i className="i-Medal-3" /> Reassign
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <i className="i-Edit" /> Edit task
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <i className="i-Paint-Brush" /> Remove
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </ul>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
          </Row>

          <Row className="mt-4">
            <div className="d-flex justify-content-center">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                pageCount={Math.ceil(notificationList.length / itemPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={itemPerPage}
                onPageChange={handlePageClick}
                containerClassName={"pagination pagination-lg"}
                subContainerClassName={"pages pagination"}
                activeClassName={"active"}
              />
            </div>
          </Row>
        </Col>

        <Col xl={3}>
          <Accordion className="mb-3" defaultActiveKey="search">
            <Accordion.Item eventKey="search">
              <Accordion.Header className="w-100" eventKey="search">
                Search Task
              </Accordion.Header>
              <Accordion.Body eventKey="search">
                <input type="text" placeholder="type & hit enter" className="form-control" />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Accordion className="mb-3" defaultActiveKey="actions">
            <Accordion.Item eventKey="actions">
              <Accordion.Header className="w-100" eventKey="search">
                Actions
              </Accordion.Header>

              <Accordion.Body eventKey="actions">
                <Card.Title>Light card title</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of the
                  card's content.
                </Card.Text>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Accordion className="mb-3" defaultActiveKey="navigation">
            <Accordion.Item eventKey="navigation">
              <Accordion.Header className="w-100" eventKey="search">
                Navigation
              </Accordion.Header>
              <Accordion.Body eventKey="navigation">
                <div id="custom-toggle3">
                  <p className="card-text">Actions</p>

                  <ListGroup variant="flush">
                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Add-Window" />
                      Create Task
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Empty-Box" />
                      Create Project
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Edit" />
                      Edit Task List
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Add-User" />
                      Assign User
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Business-Mens" />
                      Create Team
                    </ListGroup.Item>
                  </ListGroup>

                  <div className="mb-4" />

                  <p className="card-text">Tasks</p>

                  <ListGroup variant="flush">
                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Folders" />
                      All Tasks
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Add-File" />
                      Active Tasks
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Close-Window" />
                      Closed Tasks
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Administrator" />
                      Assigned To Me
                      <Badge pill bg="primary">
                        14
                      </Badge>
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Conference" />
                      Assigned To My Team
                      <Badge pill bg="primary">
                        14
                      </Badge>
                    </ListGroup.Item>

                    <ListGroup.Item
                      action
                      to="#"
                      as={Link}
                      className="d-flex align-items-center gap-1">
                      <i className="i-Gears" />
                      Settings
                    </ListGroup.Item>
                  </ListGroup>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Accordion className="mb-3" defaultActiveKey="Assigners">
            <Accordion.Item eventKey="Assigners">
              <Accordion.Header className="w-100" eventKey="search">
                Assigners
              </Accordion.Header>

              <Accordion.Body eventKey="Assigners">
                <div id="custom-toggle4">
                  <ul className="media-list list-unstyled mb-0">
                    <li className="media mb-3 d-flex align-items-center gap-3">
                      <Link to="#">
                        <img
                          src="../assets/images/faces/1.jpg"
                          className="rounded-circle"
                          width="36"
                          alt="asd"
                          srcSet=""
                        />
                      </Link>

                      <div className="ul-task-manager__media">
                        <Link to="#">James Alexander gull</Link>
                        <div className="font-size-sm text-muted">Santa Ana,CA</div>
                      </div>

                      <div className="ml-3 align-self-center">
                        <span className="badge bg-mark"></span>
                      </div>
                    </li>

                    <li className="media mb-3 d-flex align-items-center gap-3">
                      <Link to="#">
                        <img
                          src="../assets/images/faces/1.jpg"
                          className="rounded-circle"
                          width="36"
                          alt="asd"
                          srcSet=""
                        />
                      </Link>
                      <div className="ul-task-manager__media">
                        <Link to="#">James Alexander</Link>
                        <div className="font-size-sm text-muted">Santa Ana,CA</div>
                      </div>
                      <div className="ml-3 align-self-center">
                        <span className="badge bg-mark "></span>
                      </div>
                    </li>

                    <li className="media d-flex align-items-center gap-3">
                      <Link to="#">
                        <img
                          src="../assets/images/faces/1.jpg"
                          className="rounded-circle"
                          width="36"
                          alt="asd"
                          srcSet=""
                        />
                      </Link>
                      <div className="ul-task-manager__media">
                        <Link to="#">James Alexander</Link>
                        <div className="font-size-sm text-muted">Santa Ana,CA</div>
                      </div>
                      <div className="ml-3 align-self-center">
                        <span className="badge bg-mark"></span>
                      </div>
                    </li>
                  </ul>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Accordion className="mb-3" defaultActiveKey="Revisions">
            <Accordion.Item eventKey="Revisions">
              <Accordion.Header className="w-100" eventKey="search">
                Revisions
              </Accordion.Header>
              <Accordion.Body eventKey="Revisions">
                <ul className="list-unstyled mb-0">
                  <li className="media mb-4">
                    <Link to="#" className="revision-font mt-1">
                      <i className="i-Arrow-Down-in-Circle mr-2 text-28" />
                    </Link>

                    <div className="ul-task-manager__media mt-1">
                      <p className="revisions-p mb-0">
                        Add full font overrides for popovers and tooltips
                      </p>
                      <div className="font-size-sm text-muted">24 minutes ago</div>
                    </div>
                  </li>

                  <li className="media mb-4">
                    <Link to="#" className="revision-font">
                      <i className="i-Arrow-Down-in-Circle text-28" />
                    </Link>

                    <div className="ul-task-manager__media mt-1">
                      <p className="revisions-p mb-0">
                        Add full font overrides for popovers and tooltips
                      </p>

                      <div className="font-size-sm text-muted">24 minutes ago</div>
                    </div>
                  </li>

                  <li className="media">
                    <Link to="#" className="revision-font">
                      <i className="i-Arrow-Down-in-Circle mr-2 text-28"></i>
                    </Link>

                    <div className="ul-task-manager__media mt-1">
                      <p className="revisions-p mb-0">Chris Arney created a new Design branch</p>
                      <div className="font-size-sm text-muted">2 hours ago</div>
                    </div>

                    <div className="ml-3 align-self-center">
                      <span className="badge bg-mark" />
                    </div>
                  </li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Accordion className="mb-3" defaultActiveKey="Completeness">
            <Accordion.Item eventKey="Completeness">
              <Accordion.Header className="w-100" eventKey="search">
                Completeness Stats
              </Accordion.Header>

              <Accordion.Body eventKey="Completeness">
                <div id="custom-toggle6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        Blockers
                        <span className="text-muted">50%</span>
                      </div>

                      <ProgressBar variant="danger" now={50} style={{ height: "0.25rem" }} />
                    </li>

                    <li className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        High priority
                        <span className="text-muted">70%</span>
                      </div>

                      <ProgressBar now={70} style={{ height: "0.25rem" }} />
                    </li>

                    <li className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        Normal priority
                        <span className="text-muted">80%</span>
                      </div>

                      <ProgressBar now={80} variant="success" style={{ height: "0.25rem" }} />
                    </li>

                    <li>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        Low priority
                        <span className="text-muted">60%</span>
                      </div>

                      <ProgressBar now={60} style={{ height: "0.25rem" }} />
                    </li>
                  </ul>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
    </div>
  );
}
