import { lazy } from "react";

const AppTour = lazy(() => import("./AppTour"));
const AppToastr = lazy(() => import("./AppToastr"));
const AppLoader = lazy(() => import("./AppLoader"));
const UploadForm = lazy(() => import("./UploadForm"));
const AppDropdown = lazy(() => import("./AppDropdown"));
const AppSweetAlert = lazy(() => import("./AppSweetAlert"));
const AppImageCropper = lazy(() => import("./AppImageCropper"));

const extraKitsRoutes = [
  { path: "/extra-kits/upload", element: <UploadForm /> },
  { path: "/extra-kits/toastr", element: <AppToastr /> },
  { path: "/extra-kits/loaders", element: <AppLoader /> },
  { path: "/extra-kits/sweet-alert", element: <AppSweetAlert /> },
  { path: "/extra-kits/image-cropper", element: <AppImageCropper /> },
  { path: "/extra-kits/user-tour", element: <AppTour /> },
  { path: "/extra-kits/dropdown", element: <AppDropdown /> }
];

export default extraKitsRoutes;
