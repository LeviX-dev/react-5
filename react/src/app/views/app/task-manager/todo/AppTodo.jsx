import { useState } from "react";
import { MdSearch } from "react-icons/md";
import TodoList from "./TodoList";

export default function AppTodo() {
  const [query, setQuery] = useState("");

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  return (
    <div className="todo">
      <div className="todo__search-box-holder">
        <div className="d-flex flex-column justify-content-start mb-4">
          <div className="todo__search-box d-flex align-items-center ps-2 pe-3">
            <MdSearch size="24" className="text-primary search-icon">
              search
            </MdSearch>
            <input
              className="h-100 ps-5 pe-3 flex-grow-1"
              type="text"
              name="query"
              value={query}
              onChange={handleQueryChange}
            />
          </div>
        </div>
      </div>

      <div className="todo__content">
        <TodoList searchValue={query} />
      </div>
    </div>
  );
}
