import axios from "axios";

/**
 * Production backend URL
 */
const BACKEND_URL = "https://bursana-backend-production.up.railway.app";

/**
 * CORS Proxy for requests that get blocked
 */
const CORS_PROXY = "https://corsproxy.io/?";

/**
 * Main API - Direct connection to backend
 */
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

/**
 * Proxy API - For endpoints that get blocked by CORS
 */
const proxyApi = axios.create({
  baseURL: CORS_PROXY + encodeURIComponent(BACKEND_URL),
  withCredentials: false,
});

/**
 * Smart API request - tries direct, falls back to proxy on CORS error
 */
const smartRequest = async (method, url, data = null, options = {}) => {
  try {
    // Try direct first
    return await api({ method, url, data, ...options });
  } catch (error) {
    // Check if it's a CORS error (no response received)
    if (!error.response) {
      console.log("CORS blocked, trying proxy...");
      // Use proxy for CORS-blocked requests
      return await proxyApi({ method, url: encodeURIComponent(url), data, ...options });
    }
    throw error;
  }
};

/**
 * Cached CSRF token
 */
let csrfToken = null;

/**
 * REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase();

    if (["post", "put", "delete", "patch"].includes(method)) {
      if (!csrfToken) {
        try {
          const res = await api.get("/csrf/token");
          csrfToken = res.data.csrfToken;
        } catch (err) {
          // CSRF fetch failed - continue without it
        }
      }
      
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
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

// Export both APIs
export default api;
export { proxyApi, smartRequest, BACKEND_URL };
