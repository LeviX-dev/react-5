import {
  productListAction,
  categoryListAction,
  ratingListAction,
  brandListAction,
  cartListAction,
} from "./ecommerceSlice";
import { apiSlice } from "../api/apiSlice";

export const ecommerceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductList: builder.query({
      query: () => "/api/ecommerce/get-product-list",
      async onQueryStarted({}, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.length > 0) {
            dispatch(productListAction({ productList: result.data }));
          }
        } catch (err) {}
      },
    }),

    getCategoryList: builder.query({
      query: () => "/api/ecommerce/get-category-list",
      async onQueryStarted({}, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.length > 0) {
            dispatch(categoryListAction({ categoryList: result.data }));
          }
        } catch (err) {}
      },
    }),

    getRatingList: builder.query({
      query: () => "/api/ecommerce/get-rating-list",
      async onQueryStarted({}, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.length > 0) {
            dispatch(ratingListAction({ ratingList: result.data }));
          }
        } catch (err) {}
      },
    }),

    getBrandList: builder.query({
      query: () => "/api/ecommerce/get-brand-list",
      async onQueryStarted({}, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.length > 0) {
            dispatch(brandListAction({ brandList: result.data }));
          }
        } catch (err) {}
      },
    }),

    getCartList: builder.query({
      query: () => "/api/ecommerce/get-cart-list",
      async onQueryStarted({}, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.length > 0) {
            dispatch(cartListAction({ cartList: result.data }));
          }
        } catch (err) {}
      },
    }),

    addProductToCart: builder.mutation({
      query: ({ uid, productId }) => ({
        url: "/api/ecommerce/add-to-cart",
        method: "POST",
        body: { uid, productId },
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result?.data) {
            dispatch(cartListAction({ cartList: result.data }));
          }
        } catch (error) {}
      },
    }),

    deleteProductFromCart: builder.mutation({
      query: (bodyData) => ({
        url: "/api/ecommerce/delete-from-cart",
        method: "DELETE",
        body: bodyData,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result?.data) {
            dispatch(cartListAction({ cartList: result.data }));
          }
        } catch (error) {}
      },
    }),

    updateCartAmount: builder.mutation({
      query: (bodyData) => ({
        url: "/api/ecommerce/update-cart-amount",
        method: "PUT",
        body: bodyData,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result?.data) {
            dispatch(cartListAction({ cartList: result.data }));
          }
        } catch (error) {}
      },
    }),
  }),
});

export const {
  useGetProductListQuery,
  useGetCategoryListQuery,
  useGetRatingListQuery,
  useGetBrandListQuery,
  useGetCartListQuery,
  useAddProductToCartMutation,
  useDeleteProductFromCartMutation,
  useUpdateCartAmountMutation,
} = ecommerceApi;
