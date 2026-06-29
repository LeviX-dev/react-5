import { lazy } from "react";

const BasicDataTable = lazy(() => import("./BasicDataTable"));
const SearchInDataTable = lazy(() => import("./SearchInTable"));
const PaginationDataTable = lazy(() => import("./PaginationTable"));
const DifferentVariantDataTable = lazy(() => import("./VariantTable"));

const dataTableRoute = [
  { path: "/data-table/basic", element: <BasicDataTable /> },
  { path: "/data-table/search", element: <SearchInDataTable /> },
  { path: "/data-table/pagination", element: <PaginationDataTable /> },
  { path: "/data-table/variants", element: <DifferentVariantDataTable /> }
];

export default dataTableRoute;
