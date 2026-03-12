import axios from "axios";

const api = axios.create({
  baseURL: "https://bursana-backend-production.up.railway.app",
  withCredentials: true, // Important: allows cookies to be sent
});

// Request interceptor adds Authorization header AND sets token as cookie
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    
    if (token) {
      // Send in Authorization header
      config.headers["Authorization"] = `Bearer ${token}`;
      
      // Also set as cookie for backend (backend expects req.cookies?.token)
      // Note: We can't directly set cookies from frontend for cross-origin
      // So we rely on the Authorization header and need to modify backend
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

// Helper function to set token as cookie (called after login)
export const setTokenCookie = (token) => {
  // This won't work for cross-origin, but we keep the token in localStorage
  // The backend needs to be updated to check Authorization header
  localStorage.setItem("token", token);
};

// Helper function to clear token
export const clearToken = () => {
  localStorage.removeItem("token");
};

export default api;
