import { lazy } from "react";
import todoRoutes from "./todo/todoRoutes";

const TaskManager = lazy(() => import("./TaskManager"));
const TaskManagerList = lazy(() => import("./TaskManagerList"));

const taskManagerRoutes = [
  { path: "/task-manager", element: <TaskManager /> },
  { path: "/task-manager-list", element: <TaskManagerList /> },
  ...todoRoutes
];

export default taskManagerRoutes;
