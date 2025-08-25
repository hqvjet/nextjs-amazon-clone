import axios from "axios";

// -----------------------------------------------------------------------------
// Base URL handling
// -----------------------------------------------------------------------------
// Accept either NEXT_PUBLIC_API_URL (preferred) or legacy NEXT_PUBLIC_API.
// Ensure we always have a protocol and no trailing slash to avoid redirect 307.
const rawBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API ||
  "http://localhost:8000"; // direct FastAPI default

function normalizeBase(url: string) {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) {
    // default to https for bare hostnames (production) else http for localhost
    u = u.startsWith("localhost") || u.startsWith("127.0.0.1")
      ? `http://${u}`
      : `https://${u}`;
  }
  return u.replace(/\/+$/, "");
}

const apiUrl = normalizeBase(rawBase);
const jwtKey = "accessToken";

// -----------------------------------------------------------------------------
// Axios request interceptor: attach Authorization only for same API origin
// -----------------------------------------------------------------------------
axios.interceptors.request.use(
  (config) => {
    try {
      // config.url may already be absolute. new URL will resolve correctly.
      const resolved = new URL(config.url as string, apiUrl);
      const allowedOrigins = [new URL(apiUrl).origin];
      const accessToken = localStorage.getItem(jwtKey);
      if (accessToken && allowedOrigins.includes(resolved.origin)) {
        config.headers = config.headers || {};
        (config.headers as any).authorization = `Bearer ${accessToken}`;
      }
    } catch (e) {
      // If URL parsing fails we just proceed without modifying headers.
      // eslint-disable-next-line no-console
      console.warn("[api-client] URL parse error", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create full URL (ensures exactly one slash between base and endpoint)
export const createUrl = (endpoint: string) => {
  const base = apiUrl; // already without trailing slash
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  // Normalize: collapse multiple slashes and remove single trailing slash (except root)
  let url = base + path;
  // Separate query/hash
  const [beforeQ, afterQ] = url.split(/([?#].*)/, 2); // keep delimiter part
  const normalizedPath = beforeQ.replace(/([^:])\/+/g, (m, g1) => g1 + "/");
  // Remove trailing slash if not root and not followed by another path element
  const finalPath = normalizedPath.replace(/^(.*[^/])\/$/, "$1");
  return finalPath + (afterQ || "");
};

export const isStoredJwt = () => Boolean(localStorage.getItem(jwtKey));
export const setStoredJwt = (accessToken: string) =>
  localStorage.setItem(jwtKey, accessToken);

export const get = axios.get;
export const patch = axios.patch;
export const post = axios.post;
export const axiosDelete = axios.delete;

// Expose base URL for debugging if needed
export const API_BASE_URL = apiUrl;
