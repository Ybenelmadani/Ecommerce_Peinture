import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://ecomerce_back-end.test/api",
  headers: { Accept: "application/json" },
});

// Add Authorization: Bearer <token> automatically if user is logged in.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
