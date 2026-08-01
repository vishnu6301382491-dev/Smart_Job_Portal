import axios from "axios";
import { toast } from "react-hot-toast";

const LOCAL_API_BASE_URL = "http://localhost:5000/api";
const PRODUCTION_API_BASE_URL = "https://smart-job-portal-api.onrender.com/api";

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return import.meta.env.PROD ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Authorization: Bearer <TOKEN>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("smart_job_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor: Handle 401 Session Expired, 403 Forbidden, 500 Server Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      console.warn("[AXIOS_401_INTERCEPTED] Session expired or invalid token.");
      localStorage.removeItem("token");
      localStorage.removeItem("smart_job_token");
      localStorage.removeItem("user");
      localStorage.removeItem("smart_job_user");

      toast.error("Session expired. Please login again.", { id: "session-expired-toast" });

      if (window.location.hash !== "#/login" && window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = import.meta.env.BASE_URL === "/" ? "/login" : "#/login";
        }, 1000);
      }
    } else if (status === 403) {
      toast.error(message || "You don't have permission to perform this action.");
    } else if (status >= 500) {
      toast.error("Something went wrong on the server. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default api;
