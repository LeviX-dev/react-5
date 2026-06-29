import { lazy } from "react";

const AppChat = lazy(() => import("./AppChat"));

const chatRoutes = [{ path: "/chat", element: <AppChat /> }];

export default chatRoutes;
