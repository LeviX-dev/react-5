import { Link } from "react-router-dom";
import { Card, Dropdown, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import Breadcrumb from "app/components/Breadcrumb";

export default function TaskManagerList() {
  const taskList = [
    { title: "Update User profile page", link: "/" },
    { title: "Not Update User profile page", link: "/" }
  ];

  const handlePageClick = (data) => {};

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "Home", path: "/" }, { name: "Task Manager List" }]} />

      <div id="task-manager-list">
        <div className="content">
          <Card id="card">
            <Card.Header className="bg-transparent ul-task-manager__header-inline">
              <Card.Title className="py-2 mb-0">Task Manager</Card.Title>
            </Card.Header>

            <Card.Body id="card-body">
              <div className="search ul-task-manager__search-inline align-items-center">
                <nav className="navbar">
                  <form className="d-flex">
                    <label htmlFor="inputEmail3" className="col-sm-2 col-form-label me-2">
                      Filter:
                    </label>
                    <input
                      className="form-control me-sm-2"
                      id="filterInput"
                      type="search"
                      placeholder="type to filter"
                      aria-label="Search"
                    />
                  </form>
                </nav>

                <label>
                  <span>Show:</span>
                  <select>
                    <option value="15">15</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                  </select>
                </label>
              </div>

              <Table responsive bordered id="names" className="custom-sm-width">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Task Description</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Latest Update</th>
                    <th scope="col">Status</th>
                    <th scope="col">Assigned Users</th>
                    <th scope="col">
                      <span className="checkmarks">
                        <div className="checkmark_stem" />
                        <div className="checkmark_kick" />
                      </span>
                    </th>
                  </tr>
                </thead>

                <thead className="bg-light">
                  <tr>
                    <th colSpan="7">Last Week</th>
                  </tr>
                </thead>

                <tbody id="names">
                  {taskList.map((task, ind) => (
                    <tr key={ind} id="names">
                      <th scope="row" className="head-width">
                        #{ind + 1}
                      </th>

                      <td className="collection-item">
                        <div className="font-weight-bold">
                          <Link to={task.link}>{task.title}</Link>
                        </div>

                        <div className="text-muted">
                          A small river named Duden flows by their place and supplies it..
                        </div>
                      </td>

                      <td className="custom-align">
                        <div className="btn-group ">
                          <Dropdown>
                            <Dropdown.Toggle as="div" className="toggle-hidden">
                              <button
                                className="btn btn-danger text-white custom-btn  btn-sm dropdown-toggle"
                                type="button">
                                Blocker
                              </button>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item>
                                <span className="ul-task-manager__dot bg-primary me-2"></span>
                                Blocker
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <span className="ul-task-manager__dot bg-danger me-2"></span>
                                High Priority
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <span className="ul-task-manager__dot bg-warning me-2"></span>
                                Normal Priority
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <span className="ul-task-manager__dot bg-success me-2 "></span>
                                Low Priority
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </td>

                      <td className="custom-align">
                        <div className="d-inline-flex align-items-center calendar align-middle">
                          <i className="i-Calendar-4"></i>
                          <span className="">12 January 2015</span>
                        </div>
                      </td>
                      <td className="custom-align">
                        <select
                          className="form-control custom-select task-manager-list-select"
                          id="inputGroupSelect01">
                          <option disabled>Choose...</option>
                          <option value="1">Open</option>
                          <option value="2">On hold</option>
                          <option value="3">Resolved</option>
                          <option value="3">Duplicate</option>
                          <option value="3">Invalid</option>
                          <option value="3">Wontfix</option>
                          <option value="3">Closed</option>
                        </select>
                      </td>
                      <td className="custom-align">
                        <img
                          className="rounded-circle m-1 ul-task-manager__avatar "
                          src="/assets/images/faces/1.jpg"
                          alt=""
                        />
                        <img
                          className="rounded-circle m-1 ul-task-manager__avatar "
                          src="/assets/images/faces/1.jpg"
                          alt=""
                        />
                        <i className="i-Add text-24 m-1 text-primary font-weight-500 cursor-pointer align-middle font-custom-table"></i>
                      </td>
                      <td className="custom-align" valign="middle">
                        <Dropdown>
                          <Dropdown.Toggle as="div" className="toggle-hidden cursor-pointer">
                            <i
                              data-toggle="dropdown"
                              className="i-Align-Right custom-font-down-arrow"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item>Check In</Dropdown.Item>
                            <Dropdown.Item>Attach Screenshot</Dropdown.Item>
                            <Dropdown.Item>Reassign</Dropdown.Item>
                            <Dropdown.Item>Edit Task</Dropdown.Item>
                            <Dropdown.Item>Remove</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-light">
                    <th colSpan="12">10 Days Ago</th>
                  </tr>

                  {/* <!-- table row 3 --> */}
                  <tr>
                    <th scope="row">#3</th>
                    <td className="collection-item">
                      <div className="font-weight-bold">
                        <Link to="/">Update User profile page</Link>
                      </div>
                      <div className="text-muted">
                        A small river named Duden flows by their place and supplies it..
                      </div>
                    </td>
                    <td className="custom-align">
                      <Dropdown>
                        <Dropdown.Toggle as="div" className="toggle-hidden">
                          <button
                            className="btn btn-warning custom-btn  btn-sm dropdown-toggle"
                            type="button">
                            High
                          </button>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item>
                            <span className="ul-task-manager__dot bg-primary me-2" />
                            Blocker
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <span className="ul-task-manager__dot bg-danger me-2" />
                            High Priority
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <span className="ul-task-manager__dot bg-warning me-2" />
                            Normal Priority
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <span className="ul-task-manager__dot bg-success me-2 " />
                            Low Priority
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>

                    <td className="custom-align">
                      <div className="d-inline-flex align-items-center calendar">
                        <i className="i-Calendar-4" />
                        <span>12 January 2015</span>
                      </div>
                    </td>

                    <td className="custom-align">
                      <select
                        className="form-control custom-select task-manager-list-select"
                        id="inputGroupSelect01">
                        <option disabled>Choose...</option>
                        <option value="1">Open</option>
                        <option value="2">On hold</option>
                        <option value="3">Resolved</option>
                        <option value="3">Duplicate</option>
                        <option value="3">Invalid</option>
                        <option value="3">Wontfix</option>
                        <option value="3">Closed</option>
                      </select>
                    </td>

                    <td className="custom-align">
                      <img
                        className="rounded-circle m-0 ul-task-manager__avatar "
                        src="/assets/images/faces/1.jpg"
                        alt=""
                      />

                      <img
                        className="rounded-circle m-0 ul-task-manager__avatar "
                        src="/assets/images/faces/1.jpg"
                        alt=""
                      />

                      <i className="i-Add text-24 text-primary font-weight-500 cursor-pointer align-middle font-custom-table" />
                    </td>

                    <td className="custom-align">
                      <Dropdown>
                        <Dropdown.Toggle as="div" className="toggle-hidden cursor-pointer">
                          <i
                            data-toggle="dropdown"
                            className="i-Align-Right custom-font-down-arrow"
                          />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item>Check In</Dropdown.Item>
                          <Dropdown.Item>Attach Screenshot</Dropdown.Item>
                          <Dropdown.Item>Reassign</Dropdown.Item>
                          <Dropdown.Item>Edit Task</Dropdown.Item>
                          <Dropdown.Item>Remove</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>

            <Card.Footer className="text-muted">
              <div className="d-flex flex-wrap justify-content-between align-items-center py-1">
                <span> Showing 1 to 25 of 25 entries</span>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Next"
                  previousLabel="Previous"
                  breakClassName="break-me"
                  pageCount={5}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={2}
                  onPageChange={handlePageClick}
                  activeClassName="active"
                  subContainerClassName="pages pagination"
                  containerClassName="pagination pagination-lg"
                />
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
}
