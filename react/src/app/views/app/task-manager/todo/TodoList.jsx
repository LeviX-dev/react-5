import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Dropdown } from "react-bootstrap";
import { MdArrowDropDown, MdLabel } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TodoItem from "./TodoItem";
import { getAllTodo, updateTodoById, reorderTodoList, getAllTodoTag } from "./todoService";

export default function TodoList({ searchValue }) {
  const navigate = useNavigate();
  const [filterTag, setFilterTag] = useState("all");
  const [todoStatus, setTodoStatus] = useState({ key: "all", value: true });
  const [state, setState] = useState({ tagList: [], todoList: [] });

  const updateTodo = async (todo) => {
    try {
      const { data } = await updateTodoById(todo);
      setState((prev) => ({ ...prev, todoList: [...data] }));
    } catch (error) {
      console.log(error);
    }
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const todoList = reorder(state.todoList, result.source.index, result.destination.index);

    try {
      const { data } = await reorderTodoList(todoList);
      setState((prev) => ({ ...prev, todoList: [...data] }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTodo().then(({ data }) => {
      getAllTodoTag().then(({ data: tagList }) => {
        setState({ tagList, todoList: [...data] });
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = (key, value) => () => {
    setTodoStatus({ key, value });
  };

  const filteredTodoList = state.todoList
    .filter((todo) => {
      return filterTag === "all" ? todo : todo.tag.includes(filterTag);
    })
    .filter((todo) => {
      return todoStatus.key === "all" ? todo : todo[todoStatus.key] === todoStatus.value;
    })
    .filter((todo) => {
      return todo.title.toLowerCase().includes(searchValue.toLowerCase());
    });

  return (
    <Card className="todo position-relative">
      <div className="todo-list__topbar card-header py-2 d-flex flex-wrap justify-content-between align-items-center">
        <div className="d-flex gap-1">
          <Dropdown>
            <Dropdown.Toggle as="div" className="toggle-hidden cursor-pointer">
              <div className="p-2 btn-hover rounded-circle">
                <MdArrowDropDown size={24} />
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleUpdateStatus("all", true)}>All</Dropdown.Item>
              <Dropdown.Item onClick={handleUpdateStatus("read", true)}>Read</Dropdown.Item>
              <Dropdown.Item onClick={handleUpdateStatus("read", false)}>Unread</Dropdown.Item>
              <Dropdown.Item onClick={handleUpdateStatus("done", true)}>Done</Dropdown.Item>
              <Dropdown.Item onClick={handleUpdateStatus("done", false)}>Undone</Dropdown.Item>
              <Dropdown.Item onClick={handleUpdateStatus("important", true)}>
                Important
              </Dropdown.Item>
              <Dropdown.Item onClick={handleUpdateStatus("important", false)}>
                Unimportant
              </Dropdown.Item>
              <Dropdown.Item onClick={handleUpdateStatus("starred", true)}>Starred</Dropdown.Item>
              <Dropdown.Item onClick={handleUpdateStatus("starred", false)}>
                Unstarred
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle as="div" className="toggle-hidden cursor-pointer">
              <div className="p-2 btn-hover rounded-circle">
                <MdLabel size={24} />
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item className="text-capitalize" onClick={() => setFilterTag("all")}>
                all
              </Dropdown.Item>

              {state.tagList.map((tag) => (
                <Dropdown.Item
                  key={tag.id}
                  className="text-capitalize"
                  onClick={() => setFilterTag(tag.id)}>
                  {tag.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="pe-3">
          <Button variant="primary" onClick={() => navigate("/todo/list/add")}>
            Create Todo
          </Button>
        </div>
      </div>

      <div className="todo-list">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {filteredTodoList.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}>
                        <TodoItem
                          key={index}
                          todo={todo}
                          tagList={state.tagList}
                          updateTodo={updateTodo}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </Card>
  );
}
