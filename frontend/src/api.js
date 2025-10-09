import axios from "axios";

const API_URL = "http://localhost:5000/api";


export const signup = (data) => axios.post(`${API_URL}/signup`, data);
export const login = (data) => axios.post(`${API_URL}/login`, data);
export const getProfile = (token) =>
  axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
