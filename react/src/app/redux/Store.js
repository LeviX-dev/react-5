import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "./api/apiSlice";
import authSliceReducer from "./auth/authSlice";
import layoutSliceReducer from "./layout/layoutSlice";
import ecommerceSliceReducer from "./ecommerce/ecommerceSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSliceReducer,
    layout: layoutSliceReducer,
    ecommerce: ecommerceSliceReducer
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddlewares) => getDefaultMiddlewares().concat(apiSlice.middleware)
});
