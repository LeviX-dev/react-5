import { lazy } from "react";

const Cart = lazy(() => import("./Cart"));
const Checkout = lazy(() => import("./Checkout"));
const ProductList = lazy(() => import("./ProductList"));
const ProductDetails = lazy(() => import("./ProductDetails"));

const ecommerceRoutes = [
  { path: "/ecommerce/products", element: <ProductList /> },
  { path: "/ecommerce/product-details", element: <ProductDetails /> },
  { path: "/ecommerce/cart", element: <Cart /> },
  { path: "/ecommerce/checkout", element: <Checkout /> }
];

export default ecommerceRoutes;
