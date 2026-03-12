import axios from "axios";

const api = axios.create({
  baseURL: "https://bursana-backend-production.up.railway.app",
  withCredentials: true,
});

// Request interceptor adds Authorization header
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage for Authorization header
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Remove CSRF headers to avoid preflight OPTIONS requests
    delete config.headers["X-CSRF-Token"];
    delete config.headers["x-csrf-token"];

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
