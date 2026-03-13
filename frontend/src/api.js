import axios from "axios";

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: "https://bursana-backend-production.up.railway.app",
  withCredentials: true, // REQUIRED for cookies + CSRF
});

/**
 * Cached CSRF token
 */
let csrfToken = null;

/**
 * REQUEST INTERCEPTOR
 * - Automatically fetches CSRF token
 * - Attaches it ONLY to state-changing requests
 */
api.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase();

    // Only protect state-changing requests
    if (["post", "put", "delete", "patch"].includes(method)) {
      if (!csrfToken) {
        const res = await api.get("/csrf/token");
        csrfToken = res.data.csrfToken;
      }

      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * - Clears CSRF token if server rejects it
 * - Allows auto re-fetch on next request
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      csrfToken = null;
    }
    return Promise.reject(error);
  }
);

export default api;
