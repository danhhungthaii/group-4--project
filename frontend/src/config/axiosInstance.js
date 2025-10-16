// src/services/axiosInstance.js
import axios from "axios";
import { API_URL } from "../config/api";
import { getAccessToken, setAccessToken, removeTokens } from "./authService";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // nếu backend dùng cookie cho refresh
});

// response interceptor: tự động refresh khi 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // nếu 401 và chưa thử refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Gọi API refresh
      try {
        // Nếu refresh token lưu trong cookie, backend đọc cookie; call no body
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken); // cập nhật nơi lưu
        axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // optional: logout client
        removeTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
