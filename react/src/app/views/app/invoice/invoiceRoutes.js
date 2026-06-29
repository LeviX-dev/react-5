import { lazy } from "react";

const InvoiceList = lazy(() => import("./InvoiceList"));
const InvoiceDetails = lazy(() => import("./InvoiceDetails"));

const invoiceRoutes = [
  { path: "/invoice/list", element: <InvoiceList /> },
  { path: "/invoice/:id", element: <InvoiceDetails /> }
];

export default invoiceRoutes;
