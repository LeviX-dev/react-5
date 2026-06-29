import { lazy } from "react";

const AppIcon = lazy(() => import("./AppIcon"));

const iconsRoutes = [{ path: "/icons", element: <AppIcon /> }];
export default iconsRoutes;
