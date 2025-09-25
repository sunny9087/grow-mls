// src/api.js
import axios from "axios";

/**
 * Build BASE from Vite env var:
 * - Vite exposes env vars as import.meta.env.VITE_*.
 * - We'll strip trailing slashes to avoid double slashes when composing URLs.
 */
const raw = import.meta.env.VITE_API_BASE_URL || "";
const cleaned = raw ? raw.replace(/\/+$/, "") : "";

const BASE = cleaned || "http://127.0.0.1:8000";

if (!cleaned) {
  // Friendly runtime hint for debugging in browser console
  // (Only printed in dev / when no env set)
  // eslint-disable-next-line no-console
  console.warn(
    "[api.js] VITE_API_BASE_URL is not set — falling back to local backend:",
    BASE
  );
} else {
  // eslint-disable-next-line no-console
  console.info("[api.js] Using API base:", BASE);
}

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  // headers: { 'Content-Type': 'application/json' } // optionally set defaults
});

// Optional: interceptors to catch errors globally (useful for debugging)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log network/CORS failures in console for easier debugging
    // eslint-disable-next-line no-console
    console.error("[api] Request failed:", err?.message || err);
    return Promise.reject(err);
  }
);

export default api;
