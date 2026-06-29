import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productList: [],
  categoryList: [],
  ratingList: [],
  brandList: [],
  cartList: [],
};

const ecommerceSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    productListAction: (state, action) => {
      state.productList = [...state.productList, ...action.payload.productList];
    },
    categoryListAction: (state, action) => {
      state.categoryList = [
        ...state.categoryList,
        ...action.payload.categoryList,
      ];
    },
    ratingListAction: (state, action) => {
      state.ratingList = [...state.ratingList, ...action.payload.ratingList];
    },
    brandListAction: (state, action) => {
      state.brandList = [...state.brandList, ...action.payload.brandList];
    },
    cartListAction: (state, action) => {
      state.cartList = [...state.cartList, ...action.payload.cartList];
    },
  },
});

export const {
  productListAction,
  categoryListAction,
  ratingListAction,
  brandListAction,
  cartListAction,
} = ecommerceSlice.actions;
export default ecommerceSlice.reducer;
