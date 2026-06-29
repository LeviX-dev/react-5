import { lazy } from "react";

const Inbox = lazy(() => import("./AppInbox"));

const inboxRoutes = [{ path: "/inbox", element: <Inbox /> }];
export default inboxRoutes;
