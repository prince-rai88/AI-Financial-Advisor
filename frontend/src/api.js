import axios from "axios";
import { ACCESS_TOKEN_KEY, clearAuthStorage, isGuestMode } from "./utils/auth";
import {
  DEMO_ANOMALIES,
  DEMO_BUDGET,
  DEMO_INSIGHTS,
  DEMO_SUMMARY,
  DEMO_TRANSACTIONS,
  DEMO_USER,
} from "./utils/demoData";
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

    if (status === 401 && !isGuestMode()) {
      clearAuthStorage();
      if (!window.location.pathname.startsWith("/login")) {
        notify("Session expired. Please login again.", "error");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Safe helper to fetch demo endpoint with client-side deterministic fallback
async function fetchWithDemoFallback(demoPath, fallbackData) {
  try {
    const res = await API.get(demoPath);
    return res;
  } catch {
    // If backend is unreachable or sleeping, serve deterministic demo data
    return { data: fallbackData };
  }
}

export const authApi = {
  login: (payload) => API.post("login/", payload),
  register: (payload) => API.post("register/", payload),
  fetchUser: () => {
    if (isGuestMode()) {
      return fetchWithDemoFallback("demo/user/", DEMO_USER);
    }
    return API.get("user/");
  },
};

export const financeApi = {
  fetchTransactions: () => {
    if (isGuestMode()) {
      return fetchWithDemoFallback("demo/transactions/", DEMO_TRANSACTIONS);
    }
    return API.get("transactions/");
  },
  fetchSummary: () => {
    if (isGuestMode()) {
      return fetchWithDemoFallback("demo/summary/", DEMO_SUMMARY);
    }
    return API.get("summary/");
  },
  fetchInsights: () => {
    if (isGuestMode()) {
      return fetchWithDemoFallback("demo/insights/", DEMO_INSIGHTS);
    }
    return API.get("insights/");
  },
  fetchBudget: () => {
    if (isGuestMode()) {
      return fetchWithDemoFallback("demo/budget/", DEMO_BUDGET);
    }
    return API.get("budget/");
  },
  fetchAnomalies: () => {
    if (isGuestMode()) {
      return fetchWithDemoFallback("demo/anomalies/", DEMO_ANOMALIES);
    }
    return API.get("anomalies/");
  },
  uploadStatement: (file, onUploadProgress) => {
    if (isGuestMode()) {
      return Promise.reject({
        response: {
          data: {
            error: "File upload is disabled in Demo Mode. Please sign in or create an account.",
          },
          status: 403,
        },
      });
    }
    const formData = new FormData();
    formData.append("file", file);
    return API.post("upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
  },
};

export default API;
