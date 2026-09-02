import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";

const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type":
      "application/json"
  },

  timeout: 15000
});

/* Attach JWT token */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "attendance_token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/* Handle unauthorized requests */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "attendance_token"
      );

      localStorage.removeItem(
        "attendance_employee"
      );

      /*
       * Avoid redirecting if already
       * on login page.
       */
      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.href =
          "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;