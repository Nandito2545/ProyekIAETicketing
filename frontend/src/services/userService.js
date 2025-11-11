// frontend/src/services/userService.js
import axios from "axios";

// ✅ PERBAIKAN: Menggunakan VITE_USER_API agar URL menjadi .../api/users
// Ini akan memperbaiki error 404 saat login.
const API_URL = import.meta.env.VITE_USER_API || "http://localhost:5000/api/users";

export const login = async (username, password) => {
  // Sekarang URL akan menjadi http://localhost:5000/api/users/login
  const response = await axios.post(`${API_URL}/login`, { username, password });
  return response.data;
};

export const register = async (username, password, role = "user") => {
  // Sekarang URL akan menjadi http://localhost:5000/api/users/register
  const response = await axios.post(`${API_URL}/register`, { username, password, role });
  return response.data;
};