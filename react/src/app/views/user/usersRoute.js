import { lazy } from "react";

const UserList = lazy(() => import("./UserList"));
const UsersLastLogin = lazy(() => import("./UsersLastLogin"));

const MyProfile = lazy(() => import("./MyProfile"));
const UserDetail = lazy(() => import("./UserDetail"));
const AttendanceCalendarUser = lazy(() => import("./AttendanceCalendarUser.jsx"));

const userRoutes = [
  { path: "/user/UserList", element: <UserList /> },
  { path: "/user/UsersLastLogin", element: <UsersLastLogin /> },
  { path: "/users/:id/:tab?", element: <UserDetail /> },
  { path: "/account/settings/:tab?", element: <MyProfile /> },
  { path: "/user/AttendanceCalendarUser", element: <AttendanceCalendarUser /> },
];

export default userRoutes;
