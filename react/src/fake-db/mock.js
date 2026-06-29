import MockAdapter from "axios-mock-adapter";
import Axios from "axios";
// import axios from "axios";

export const axios = Axios.create({
  //   baseURL: "http://localhost:3000",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Accept: "application/json",
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  //     "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  //     "X-Requested-With": "XMLHttpRequest"
  //   },
  //   withCredentials: true,
  //   timeout: 10000,
  //   responseType: "json"
});

const Mock = new MockAdapter(axios);
export default Mock;
