import axios from "axios";
import { tokenStore } from "../../auth/tokenStore";
import { env } from "../env";
import { refreshClient } from "./refreshClient";

export const client = axios.create({
  baseURL: env.VITE_API_BASE_URL + "/api/v1",
  withCredentials: true,
  timeout: 10_000
});

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single-flight refresh on 401
let isRefreshing = false;
let refreshQueue = [];

client.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
  return config;
});

client.interceptors.response.use(
  (res) => {
    console.log(`[API Response] ${res.status} ${res.config.url}`, res.data);
    return res;
  },
  async (error) => {
    console.error(`[API Error] ${error.response?.status || 'Network'} ${error.config?.url}`, error);
    const original = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === "TOKEN_EXPIRED" &&
      !original._retry
    ) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      isRefreshing = true;
      try {
        const { data } = await refreshClient.post("/auth/refresh");
        tokenStore.set(data.data.accessToken);
        refreshQueue.forEach((p) => p.resolve(data.data.accessToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return client(original);
      } catch (err) {
        refreshQueue.forEach((p) => p.reject());
        refreshQueue = [];
        tokenStore.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
