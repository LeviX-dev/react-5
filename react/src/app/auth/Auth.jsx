import { useEffect } from "react";
import { useDispatch } from "react-redux";

import api from "../services/api";
import { setAuthState, userLoggedOut } from "../redux/auth/authSlice";
import firebaseAuthService from "../services/firebase/firebaseAuthService";

export default function Auth({ children }) {
  const dispatch = useDispatch();

  const bootstrapJwtAuth = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      dispatch(userLoggedOut());
      return;
    }

    try {
      const response = await api.get("/api/auth/me");
      dispatch(
        setAuthState({
          accessToken,
          user: response.data.user,
        }),
      );
    } catch (error) {
      dispatch(userLoggedOut());
    }
  };

  const checkFirebaseAuth = () => {
    firebaseAuthService.checkAuthStatus((user) => {
      if (user) {
        console.log(user.uid);
        console.log(user.email);
        console.log(user.emailVerified);
      } else {
        console.log("not logged in");
      }
    });
  };

  useEffect(() => {
    bootstrapJwtAuth();
    // checkFirebaseAuth();
  }, []);

  return <>{children}</>;
}