import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// import { flat } from "@utils";
import { protectedRoutes } from "app/routes";

import GullLayout from "app/layouts/GullLayout";
import AccessDenied from "app/views/sessions/AccessDenied";

const userHasPermission = (pathname, user, routes) => {
  if (!user) {
    return false;
  }

  const matched = routes.find((r) => r.path === pathname);
  return matched && matched.auth && matched.auth.length
    ? matched.auth.includes(user.role)
    : true;
};

export default function AuthGuard() {
  const { pathname } = useLocation();
  const [previousRoute, setPreviousRoute] = useState(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const hasPermission = userHasPermission(pathname, user, protectedRoutes);

  useEffect(() => {
    if (isAuthenticated) {
      setPreviousRoute(pathname);
    } else {
      // 🔥 Reset previousRoute when logged out to prevent redirect loop
      setPreviousRoute(null);
    }
  }, [isAuthenticated, pathname]);

  // If token exists but user profile is still being restored, avoid flashing AccessDenied.
  if (isAuthenticated && !user) {
    return null;
  }

  return (
    <>
      {isAuthenticated && hasPermission ? (
        <GullLayout>
          <Outlet />
        </GullLayout>
      ) : (
        <>
          {isAuthenticated && !hasPermission ? (
            <AccessDenied />
          ) : (
            <Navigate to={previousRoute || "/sessions/signin"} replace={true} />
          )}
        </>
      )}
    </>
  );
}
