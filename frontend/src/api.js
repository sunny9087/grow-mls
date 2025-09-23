// src/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// create axios instance
const api = axios.create({
  baseURL: BASE,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// optional request interceptor: attach token when present
api.interceptors.request.use(
  (cfg) => {
    try {
      const token = localStorage.getItem("token");
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // localStorage may be blocked in some contexts — swallow errors
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

// optional response interceptor: central error logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // You can centralize error formatting here
    return Promise.reject(err);
  }
);

export default api;

