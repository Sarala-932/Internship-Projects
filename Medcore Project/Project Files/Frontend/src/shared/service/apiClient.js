import axios from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api", // Use HTTPS AWS domain in production
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
  withCredentials: true, // cookies same-origin ab kaam karengi
});

// Handle 401 Unauthorized errors (Token Expiry)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request a new access token using the HttpOnly refresh token
        const refreshResponse = await apiClient.post("/auth/refresh", {}, { withCredentials: true });
        
        // Update localStorage with the fresh token
        const newToken = refreshResponse.data?.accessToken;
        if (newToken) {
          localStorage.setItem("token", newToken);
        }

        isRefreshing = false;
        processQueue(null);
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        
        // Refresh token is also expired or invalid — redirect to login
        if (typeof window !== "undefined") {
          console.error("Token refresh failed. Redirecting to login. Error:", err);
          toast.error("Session expired. Please log in again.");
          // Clear localStorage so we don't get stuck in a loop
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
