import axios from "axios";
import localStorageService from "./localStorageService";

class JwtAuthService {
  user = {
    age: 25,
    userId: "1",
    role: "ADMIN",
    displayName: "Watson Joyce",
    email: "watsonjoyce@gmail.com",
    photoURL: "/assets/images/face-7.jpg",
    token: "faslkhfh423oiu4h4kj432rkj23h432u49ufjaklj423h4jkhkjh"
  };

  async loginWithEmailAndPassword({ email, password }) {
    if (email === "watson@example.com") {
      const data = await new Promise((resolve) => {
        setTimeout(() => resolve(this.user), 1000);
      });

      this.setSession(data.token);
      this.setUser(data);
      return data;
    } else {
      throw new Error("Wrong email or password");
    }
  }

  async loginWithToken() {
    const data = await new Promise((resolve) => {
      setTimeout(() => resolve(this.user), 1000);
    });

    this.setSession(data.token);
    this.setUser(data);
    return data;
  }

  logout() {
    this.setSession(null);
    this.removeUser();
  }

  setSession(token) {
    if (token) {
      localStorage.setItem("jwt_token", token);
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    } else {
      localStorage.removeItem("jwt_token");
      delete axios.defaults.headers.common["Authorization"];
    }
  }

  setUser(user) {
    localStorageService.setItem("auth_user", user);
  }

  removeUser() {
    localStorage.removeItem("auth_user");
  }
}

const service = new JwtAuthService();
export default service;
