import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { MdEdit, MdDelete } from "react-icons/md";
import { format } from "date-fns";
import swal from "sweetalert2";

import ContactEditor2 from "./ContactEditor2";
import Breadcrumb from "app/components/Breadcrumb";
import { getAllUser, deleteUser, addNewUser, updateUser } from "./contactService";
import { Card, Col, Row, Table } from "react-bootstrap";

export default function ContactList() {
  const [state, setState] = useState({
    page: 0,
    userList: [],
    rowsPerPage: 10,
    searchQuery: "",
    dialogValues: null,
    showEditorDialog: false
  });

  const updatePageData = () => {
    getAllUser().then(({ data }) =>
      setState((prevState) => ({ ...prevState, userList: [...data] }))
    );
  };

  const handleSearch = ({ target: { value } }) => {
    setState((prevState) => ({ ...prevState, searchQuery: value }));
  };

  const handlePageClick = (data) => {
    let page = data.selected;
    setState((prevState) => ({ ...prevState, page }));
  };

  const toggleEditorDialog = (arg) => {
    if (arg && arg.toString())
      setState((prevState) => ({
        ...prevState,
        dialogValues: null,
        showEditorDialog: arg
      }));
    else
      setState((prevState) => ({
        ...prevState,
        dialogValues: null,
        showEditorDialog: !state.showEditorDialog
      }));
  };

  const handleEditContact = (dialogValues) => {
    setState((prevState) => ({
      ...prevState,
      dialogValues,
      showEditorDialog: true
    }));
  };

  const handleDeleteContact = (values) => {
    deleteUser(values).then(({ data: userList }) => {
      setState((prevState) => ({ ...prevState, userList }));
      swal.fire({
        title: "Deleted!",
        text: "Your file has been deleted.",
        type: "success",
        icon: "success",
        timer: 1500
      });
    });
  };

  const handleFormSubmit = async (values) => {
    let { dialogValues } = state;
    let res;
    if (!dialogValues) {
      res = await addNewUser(values);
    } else {
      res = await updateUser({ ...dialogValues, ...values });
    }
    setState((prevState) => ({ ...prevState, userList: res.data }));
    toggleEditorDialog(false);
  };

  const getBadgeColor = (role) => {
    switch (role) {
      case "developer":
        return "primary";

      case "manager":
        return "success";

      case "designer":
        return "warning";

      default:
        return "primary";
    }
  };

  useEffect(() => {
    updatePageData();
  }, []);

  let { rowsPerPage, page, userList = [], dialogValues, searchQuery, showEditorDialog } = state;

  userList = userList.filter((user) => user.name.toLowerCase().match(searchQuery.toLowerCase()));

  return (
    <div>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
          { name: "Contact List" }
        ]}
      />

      <section className="contact-list">
        <Row>
          <Col md={12} className="mb-4">
            <Card>
              <Card.Header className="text-end bg-transparent">
                <button
                  type="button"
                  className="btn btn-primary btn-md m-1"
                  onClick={toggleEditorDialog}>
                  <i className="i-Add-User text-white me-2" /> Add Contact
                </button>
              </Card.Header>

              <Row className="px-4 mt-3">
                <Col md={6} className="mb-2">
                  <div className="d-flex align-items-center gap-1">
                    <span>Show</span>

                    <div>
                      <select
                        className="form-control"
                        onChange={({ target: { value } }) => {
                          setState((prevState) => ({ ...prevState, rowsPerPage: value }));
                        }}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <span>entries</span>
                  </div>
                </Col>

                <Col md={6} className="mb-2">
                  <div className="d-flex justify-content-lg-end align-items-center gap-1">
                    <span>Search:</span>
                    <div>
                      <input
                        type="search"
                        className="form-control form-control-sm"
                        onChange={handleSearch}
                      />
                    </div>
                  </div>
                </Col>
              </Row>

              <Card.Body className="pt-1">
                <Table className="w-100">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Age</th>
                      <th>Joining Date</th>
                      <th>Salary</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {userList
                      .slice(rowsPerPage * page, rowsPerPage * (page + 1))
                      .map((user, ind) => (
                        <tr key={ind}>
                          <td>
                            <Link to="">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  className="avatar-sm mb-2 rounded-circle img-fluid"
                                  src={user.imgUrl}
                                  alt=""
                                />

                                <span>{user.name}</span>
                              </div>
                            </Link>
                          </td>

                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>
                            <div
                              className={`badge bg-${getBadgeColor(
                                user.role
                              )} p-2 text-capitalize`}>
                              {user.role ? user.role : "Developer"}
                            </div>
                          </td>

                          <td>{user.age}</td>

                          <td>
                            {format(
                              new Date(user.bd ? user.bd : new Date()).getTime(),
                              "dd MMM, yyyy"
                            )}
                          </td>

                          <td>${user.balance}</td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="cursor-pointer">
                                <MdEdit
                                  size={18}
                                  className="text-success"
                                  onClick={() => handleEditContact(user)}
                                />
                              </div>

                              <div className="cursor-pointer">
                                <MdDelete
                                  className="text-danger"
                                  size={18}
                                  onClick={() => {
                                    swal
                                      .fire({
                                        title: "Are you sure?",
                                        text: "You won't be able to revert this!",
                                        icon: "warning",
                                        type: "question",
                                        showCancelButton: true,
                                        confirmButtonColor: "#3085d6",
                                        cancelButtonColor: "#d33",
                                        confirmButtonText: "Yes, delete it!",
                                        cancelButtonText: "No"
                                      })
                                      .then((result) => {
                                        if (result.value) {
                                          handleDeleteContact(user);
                                        } else {
                                          swal.fire({
                                            title: "Cancelled!",
                                            text: "Permission denied.",
                                            type: "error",
                                            icon: "error",
                                            timer: 1500
                                          });
                                        }
                                      });
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-end">
                  <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    pageCount={Math.ceil(userList.length / rowsPerPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination pagination-lg"}
                    subContainerClassName={"pages pagination"}
                    activeClassName={"active"}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <ContactEditor2
        show={showEditorDialog}
        initialValues={dialogValues}
        handleFormSubmit={handleFormSubmit}
        toggleEditorDialog={toggleEditorDialog}
      />
    </div>
  );
}
