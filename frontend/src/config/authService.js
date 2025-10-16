// src/services/authService.js
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken"; // chỉ dùng nếu backend trả refresh trong body (ít an toàn)

export const setAccessToken = (token) => {
  try { localStorage.setItem(ACCESS_KEY, token); } catch (e) {}
};

export const getAccessToken = () => {
  try { return localStorage.getItem(ACCESS_KEY); } catch (e) { return null; }
};

export const removeTokens = () => {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch (e) {}
};

export const setRefreshToken = (token) => {
  try { localStorage.setItem(REFRESH_KEY, token); } catch (e) {}
};
