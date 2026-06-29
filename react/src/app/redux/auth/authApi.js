import { apiSlice } from "../api/apiSlice";
import { userLoggedIn } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({ url: "/login", method: "POST", body: data }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const { accessToken, user } = result.data || {};

          localStorage.setItem("auth_user", JSON.stringify({ accessToken, user }));
          dispatch(userLoggedIn({ accessToken, user }));
        } catch (err) {
          // do nothing
        }
      }
    }),

    register: builder.mutation({
      query: (data) => ({ url: "/register", method: "POST", body: data }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const { accessToken, user } = result.data || {};

          localStorage.setItem("auth_user", JSON.stringify({ accessToken, user }));
          dispatch(userLoggedIn({ accessToken, user }));
        } catch (err) {
          // do nothing
        }
      }
    })
  })
});

export const { useLoginMutation, useRegisterMutation } = authApi;
