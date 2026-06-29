import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Dropdown,
  FormGroup,
  FormLabel,
  FormControl,
  Badge,
  Row
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Formik } from "formik";
import * as yup from "yup";
import {
  MdError,
  MdStar,
  MdLabel,
  MdClose,
  MdDrafts,
  MdDelete,
  MdArrowBack,
  MdLibraryAdd,
  MdStarBorder,
  MdMarkunread,
  MdErrorOutline
} from "react-icons/md";

import TagDialog from "./TagDialog";
import GullTooltip from "app/components/GullTooltip";

import { getTodoById, getAllTodoTag, updateTodoById, deleteTodo, addTodo } from "./todoService";

export default function TodoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const todoId = parseInt(id);

  const [state, setState] = useState({
    tagList: [],
    shouldOpenTagDialog: false,
    todo: {
      tag: [],
      note: "",
      title: "",
      done: false,
      read: false,
      starred: false,
      important: false,
      dueDate: new Date(),
      startDate: new Date()
    }
  });

  useEffect(() => {
    getAllTodoTag().then(({ data: tagList }) => {
      if (todoId !== "add") {
        getTodoById(todoId).then(({ data }) => {
          if (!data) return;

          setState((prevState) => ({ ...prevState, todo: { ...data }, tagList: [...tagList] }));
        });
      } else {
        setState((prevState) => ({ ...prevState, tagList }));
      }
    });
  }, [todoId]);

  const addNewTodo = async (values) => {
    try {
      await addTodo({ ...values });
      navigate("/todo/list");
    } catch (error) {
      console.log(error);
    }
  };

  const updateTodo = (todo) => {
    updateTodoById(todo);
    setState((prevState) => ({ ...prevState, todo: { ...state.todo, ...todo } }));
  };

  const reloadTagList = async () => {
    try {
      const { data } = await getAllTodoTag();
      setState((prevState) => ({ ...prevState, tagList: [...data] }));
    } catch (error) {
      console.log(error);
    }
  };

  const addTagInTodo = (id) => {
    const { tag } = state.todo;

    if (!tag.includes(id)) {
      tag.push(id);
      setState((prevState) => ({ ...prevState, todo: { ...state.todo, tag } }));
    }
  };

  const handleTagDelete = (tagId) => {
    let { tag: tagList = [] } = state.todo;
    tagList = tagList.filter((id) => id !== tagId);
    setState((prevState) => ({ ...prevState, todo: { ...state.todo, tag: [...tagList] } }));
  };

  const handleTodoDelete = async () => {
    try {
      await deleteTodo({ ...state.todo });
      navigate("/todo/list");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (values) => {
    if (todoId === "add") {
      addNewTodo(values);
    } else {
      updateTodoById({ ...state.todo, ...values }).then(() => navigate("/todo/list"));
    }
  };

  const handleTagDialogToggle = () => {
    setState((prevState) => ({ ...prevState, shouldOpenTagDialog: !state.shouldOpenTagDialog }));
  };

  let { done, read, starred, important, tag: tagIdList = [] } = state.todo;
  let { tagList } = state;

  return (
    <Card className="todo-editor position-relative m-sm-30">
      <div className="editor__topbar bg-light-gray p-2 d-flex flex-wrap card-header justify-content-between align-items-center">
        <div className="d-flex flex-wrap align-items-center">
          <Link to="/todo/list">
            <div className="p-2 rounded-circle btn-hover">
              <MdArrowBack size={24} />
            </div>
          </Link>

          <div className="ms-4">
            <label className="checkbox checkbox-primary mb-0">
              <input
                type="checkbox"
                name="agree"
                checked={done}
                onChange={() => updateTodo({ ...state, done: !done })}
              />
              <span>{`Mark As ${done ? "Und" : "D"}one`}</span>
              <span className="checkmark" />
            </label>
          </div>
        </div>

        <div className="d-flex flex-wrap">
          <GullTooltip title={`Mark As ${read ? "Unr" : "R"}ead`} fontSize="large">
            <div
              className="p-2 rounded-circle btn-hover cursor-pointer me-2"
              onClick={() => updateTodo({ ...state, read: !read })}>
              {read ? <MdDrafts size={24} /> : <MdMarkunread size={24} />}
            </div>
          </GullTooltip>

          <GullTooltip title={`Mark As ${important ? "Uni" : "I"}mportant`} fontSize="large">
            <div
              className="p-2 rounded-circle btn-hover  cursor-pointer me-2"
              onClick={() => updateTodo({ ...state, important: !important })}>
              {important ? (
                <MdError className="text-danger" size={24} />
              ) : (
                <MdErrorOutline size={24} />
              )}
            </div>
          </GullTooltip>

          <GullTooltip title={`Mark As ${starred ? "Uns" : "S"}tarred`} fontSize="large">
            <div
              className="p-2 rounded-circle btn-hover cursor-pointer me-2"
              onClick={() => updateTodo({ ...state, starred: !starred })}>
              {starred ? <MdStar className="text-warning" size={24} /> : <MdStarBorder size={24} />}
            </div>
          </GullTooltip>

          <GullTooltip title="Manage tags" fontSize="large">
            <div
              className="p-2 rounded-circle btn-hover cursor-pointer me-2"
              onClick={handleTagDialogToggle}>
              <MdLibraryAdd size={24} />
            </div>
          </GullTooltip>

          <Dropdown>
            <Dropdown.Toggle as="span" className="cursor-pointer toggle-hidden">
              <GullTooltip title="Add tags" fontSize="large">
                <div className="p-2 rounded-circle btn-hover">
                  <MdLabel size={24} />
                </div>
              </GullTooltip>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {state.tagList.map((tag) => (
                <Dropdown.Item
                  key={tag.id}
                  className="text-capitalize"
                  onClick={() => addTagInTodo(tag.id)}>
                  {tag.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <GullTooltip title="Delete" fontSize="large">
            <div
              className="p-2 rounded-circle btn-hover  cursor-pointer me-2"
              onClick={handleTodoDelete}>
              <MdDelete size={24} />
            </div>
          </GullTooltip>
        </div>
      </div>

      <div className="editor__form p-3">
        <div className="my-3">
          {tagIdList.map((tagId) => {
            let tagName = (tagList.find((tag) => tag.id === tagId) || {}).name;
            if (!tagName) return null;
            else
              return (
                <Badge pill className="text-capitalize me-2" key={tagId}>
                  <div className=" d-flex align-items-center">
                    <span className="text-12">{tagName}</span>
                    <span
                      className="rounded-circle btn-hover px-1"
                      onClick={() => handleTagDelete(tagId)}>
                      <MdClose size="16" />
                    </span>
                  </div>
                </Badge>
              );
          })}
        </div>

        <Formik
          initialValues={state.todo}
          validationSchema={todoSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel>Title</FormLabel>
                <FormControl
                  className="mb-3 w-100"
                  label="Title*"
                  type="text"
                  name="title"
                  value={values.title}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  isInvalid={errors.title && touched.title}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Put your notes</FormLabel>
                <FormControl
                  as="textarea"
                  className="mb-3 w-100"
                  type="text"
                  name="note"
                  value={values.note}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  isInvalid={errors.note && touched.note}
                />
              </FormGroup>

              <Row className="mb-5">
                <FormGroup className="d-flex mb-3 align-items-center gap-2">
                  <FormLabel className="mb-0">Start date</FormLabel>
                  <DatePicker
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Start date"
                    selected={new Date(values.startDate)}
                    onChange={(date) => setFieldValue("startDate", date)}
                  />
                </FormGroup>

                <FormGroup className="d-flex align-items-center gap-2">
                  <FormLabel className="mb-0">Due date</FormLabel>
                  <DatePicker
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Start date"
                    selected={new Date(values.dueDate)}
                    onChange={(date) => setFieldValue("dueDate", date)}
                  />
                </FormGroup>
              </Row>

              <div className="d-flex align-items-center gap-2">
                <Link to="/todo/list">
                  <Button variant="outline-danger" type="button">
                    Cancel
                  </Button>
                </Link>

                <Button variant="primary" type="submit">
                  Save
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </div>

      <TagDialog
        reloadTagList={reloadTagList}
        open={state.shouldOpenTagDialog}
        handleClose={handleTagDialogToggle}
      />
    </Card>
  );
}

const todoSchema = yup.object().shape({
  title: yup.string().required("title is required"),
  note: yup.string().required("note is required")
});
