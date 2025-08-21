import axios from "axios";

// Use env var when available, fallback to localhost for dev
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const jwtKey = "accessToken";

axios.interceptors.request.use(
  (config) => {
  const url = new URL(config.url as string, apiUrl);
  const origin = url.origin;
  const allowedOrigins = [new URL(apiUrl).origin];
    const accessToken = localStorage.getItem(jwtKey);
    if (allowedOrigins.includes(origin)) {
      config.headers.authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createUrl = (endpoint: string) => new URL(endpoint, apiUrl).href;
export const isStoredJwt = () => Boolean(localStorage.getItem(jwtKey));
export const setStoredJwt = (accessToken: string) =>
  localStorage.setItem(jwtKey, accessToken);

export const get = axios.get;
export const patch = axios.patch;
export const post = axios.post;
export const axiosDelete = axios.delete;
