import { lazy } from "react";

const AppTodo = lazy(() => import("./AppTodo"));
const TodoEditor = lazy(() => import("./TodoEditor"));

const todoRoutes = [
  { path: "/todo/list", element: <AppTodo /> },
  { path: "/todo/list/:id", element: <TodoEditor /> }
];

export default todoRoutes;
