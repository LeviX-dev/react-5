import axios from "axios";

// const api = axios.create({
//   baseURL: "https://react5.myospaz.in/",
// });

const api = axios.create({
  baseURL: "http://localhost:5000/",
});

// const api = axios.create({
//   baseURL: "http://localhost:5000/",
// });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// 🔐 Auto attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const requestUrl = originalRequest.url || "";

    const isRefreshCall = requestUrl.includes("/api/auth/refresh");

    if (status !== 401 || isRefreshCall) {
      return Promise.reject(error);
    }

    // ❌ If logged out, don't try to refresh
    if (!localStorage.getItem("accessToken")) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        " https://react5.myospaz.in/api/auth/refresh",
        {},
        { withCredentials: true },
      );

      const newAccessToken = refreshResponse.data?.accessToken;

      if (!newAccessToken) {
        throw new Error("Refresh response missing accessToken");
      }

      localStorage.setItem("accessToken", newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      window.location.href = "/sessions/signin";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
