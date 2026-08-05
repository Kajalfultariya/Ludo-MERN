import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://ludo-game-eta-one.vercel.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ludo_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
