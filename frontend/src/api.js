import axios from "axios";
import { ACCESS_TOKEN_KEY, clearAuthStorage } from "./utils/auth";
import { notify } from "./utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuthStorage();
      if (!window.location.pathname.startsWith("/login")) {
        notify("Session expired. Please login again.", "error");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => API.post("login/", payload),
  register: (payload) => API.post("register/", payload),
  fetchUser: () => API.get("user/"),
};

export const financeApi = {
  fetchTransactions: () => API.get("transactions/"),
  fetchSummary: () => API.get("summary/"),
  fetchInsights: () => API.get("insights/"),
  fetchBudget: () => API.get("budget/"),
  fetchAnomalies: () => API.get("anomalies/"),
  uploadStatement: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post("upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
  },
};

export default API;
