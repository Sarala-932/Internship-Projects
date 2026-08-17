import axios from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({resolve, reject});
                })
                    .then(() => {
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshResponse = await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    {},
                    {
                        withCredentials: true,
                        headers: {"Content-Type": "application/json"},
                    },
                );

                isRefreshing = false;
                processQueue(null);

                return apiClient(originalRequest);
            } catch (err) {
                isRefreshing = false;
                processQueue(err, null);

                if (typeof window !== "undefined") {
                    console.error("Token refresh failed. Redirecting to login. Error:", err);
                    toast.error("Session expired. Please log in again.");

                    let lastRole = "patient";
                    try {
                        const userStr = localStorage.getItem("user");
                        if (userStr) {
                            lastRole = JSON.parse(userStr).role;
                            localStorage.setItem("lastRole", lastRole);
                        }
                    } catch (e) {}

                    localStorage.removeItem("user");

                    setTimeout(() => {
                        const redirectUrl =
                            lastRole && lastRole !== "patient" ? "/login?type=staff" : "/login?type=patient";
                        window.location.href = redirectUrl;
                    }, 1000);
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;
