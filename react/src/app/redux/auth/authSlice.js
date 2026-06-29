// // import history from "@history.js";
// import { createSlice } from "@reduxjs/toolkit";

// import jwtAuthService from "app/services/jwtAuthService";
// import localStorageService from "app/services/localStorageService";
// import FirebaseAuthService from "app/services/firebase/firebaseAuthService";

// // Retrieve the auth_user from localStorage
// const storedUser = localStorageService.getItem("auth_user");
// // Check if storedUser has accessToken property
// const isAuthenticated = storedUser && storedUser.accessToken ? true : false;
// const initialState = {
//   loading: false,
//   success: false,
//   user: storedUser ? storedUser.user : undefined,
//   errorMessage: null,
//   accessToken: storedUser ? storedUser.accessToken : undefined,
//   isAuthenticated,
//   error: { username: null, password: null }
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setUserData: (state, action) => {
//       const user = action.payload;
//       state = { ...state, ...user };
//     },

//     userLoggedIn: (state, action) => {
//       state.isAuthenticated = true;
//       state.accessToken = action.payload.accessToken;
//       state.user = action.payload.user;
//       localStorageService.setItem("auth_user", { accessToken: action.payload.accessToken, user: action.payload.user });
//     },

//     userLoggedOut: (state) => {
//       state.isAuthenticated = false;
//       state.accessToken = undefined;
//       state.user = undefined;
//       localStorage.removeItem("auth_user");
//     },

//     resetPassword: (state, action) => {
//       state.success = true;
//       state.loading = false;
//       console.log(action.payload.email);
//     },

//     requestStart: (state, action) => {
//       state.loading = true;
//     },

//     loginWithEmailAndPassword: (state, action) => {
//       try {
//         const user = action.payload;
//         state = {
//           ...state,
//           user,
//           success: true,
//           loading: false,
//           isAuthenticated: true,
//           accessToken: user.token
//         };

//         localStorageService.setItem("auth_user", { accessToken: user.token, user });
//       } catch (error) {
//         console.log(error);
//       }
//     },

//     firebaseLoginEmailPassword: (state, action) => {
//       const { email, password } = action.payload;
//       state.loading = true;

//       FirebaseAuthService.signInWithEmailAndPassword(email, password)
//         .then((user) => {
//           if (user) {
//             state.user = {
//               ...user,
//               userId: "1",
//               role: "ADMIN",
//               displayName: "Watson Joyce",
//               email: "watsonjoyce@gmail.com",
//               photoURL: "/assets/images/face-7.jpg",
//               age: 25,
//               token: "faslkhfh423oiu4h4kj432rkj23h432u49ufjaklj423h4jkhkjh"
//             };

//             // history.push({ pathname: "/" });

//             state.success = true;
//             state.loading = false;
//           } else {
//             state.success = false;
//             state.loading = false;
//           }
//         })
//         .catch((error) => {
//           state.success = false;
//           state.loading = false;
//           state.error = error.data;
//         });
//     },

//     logoutJWTUser: (state) => {
//       jwtAuthService.logout();
//       state.user = undefined;
//       state.isAuthenticated = false;
//     }
//   }
// });

// export const {
//   setUserData,
//   userLoggedIn,
//   userLoggedOut,
//   resetPassword,
//   logoutJWTUser,
//   loginWithEmailAndPassword,
//   firebaseLoginEmailPassword
// } = authSlice.actions;

// export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

import localStorageService from "app/services/localStorageService";

// Get stored auth from localStorage using consistent keys
const user = JSON.parse(localStorage.getItem("user")) || null;
const accessToken = localStorage.getItem("accessToken") || null;

// Check authentication
const isAuthenticated = user && accessToken ? true : false;

const initialState = {
  loading: false,
  success: false,
  user,
  accessToken,
  errorMessage: null,
  isAuthenticated,
  error: { username: null, password: null },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },

    // LOGIN
    userLoggedIn: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;

      localStorageService.setItem("auth_user", {
        user: action.payload.user,
      });
    },

    // LOGOUT
    userLoggedOut: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
    },

    resetPassword: (state, action) => {
      state.success = true;
      state.loading = false;
      console.log(action.payload.email);
    },

    requestStart: (state) => {
      state.loading = true;
    },
  },
});

export const {
  setUserData,
  userLoggedIn,
  userLoggedOut,
  resetPassword,
  requestStart,
} = authSlice.actions;

export default authSlice.reducer;
