import { lazy, Suspense } from "react";

const Signup = lazy(() => import("./Signup"));
const Signin = lazy(() => import("./Signin"));
const Error404 = lazy(() => import("./Error"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const ResetPassword = lazy(() => import("./ResetPassword"));
const ChangePassword = lazy(() => import("./ChangePassword"));

const sessionsRoutes = [
  {
    path: "/sessions/signup",
    element: (
      <Suspense>
        <Signup />
      </Suspense>
    )
  },
  {
    path: "/sessions/signin",
    element: (
      <Suspense>
        <Signin />
      </Suspense>
    )
  },
  {
    path: "/sessions/forgot-password",
    element: (
      <Suspense>
        <ForgotPassword />
      </Suspense>
    )
  },
  {
    path: "/sessions/reset-password",
    element: (
      <Suspense>
        <ResetPassword />
      </Suspense>
    )
  },
  {
    path: "/reset-password",
    element: (
      <Suspense>
        <ResetPassword />
      </Suspense>
    )
  },
  {
    path: "/sessions/404",
    element: (
      <Suspense>
        <Error404 />
      </Suspense>
    )
  },
  {
    path: "/sessions/change-password",
    element: (
      <Suspense>
        <ChangePassword />
      </Suspense>
    )
  }
];

export default sessionsRoutes;