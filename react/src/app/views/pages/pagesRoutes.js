import { lazy } from "react";

const PricingTable = lazy(() => import("./PricingTable"));
const SearchResults = lazy(() => import("./SearchResults"));
const UserProfile = lazy(() => import("./UserProfile"));
const BlankPage = lazy(() => import("./BlankPage"));
const FAQ = lazy(() => import("./FAQ"));

const pagesRoutes = [
  {
    path: "/pages/pricing-table",
    element: <PricingTable />,
  },
  {
    path: "/pages/search-results",
    element: <SearchResults />,
  },
  {
    path: "/pages/user-profile",
    element: <UserProfile />,
  },
  {
    path: "/pages/faq",
    element: <FAQ />,
  },
  {
    path: "/pages/blank-page",
    element: <BlankPage />,
  },
];

export default pagesRoutes;
