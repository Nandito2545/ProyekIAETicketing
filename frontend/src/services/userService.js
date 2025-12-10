import axios from "axios";

const API_URL = import.meta.env.VITE_USER_API || "http://localhost:5000/api/users";

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  return response.data;
};

export const register = async (username, password, role = "user", email, phone) => {
  const response = await axios.post(`${API_URL}/register`, { 
    username, 
    password, 
    role, 
    email, 
    phone 
  });
  return response.data;
};

// ✅ FUNGSI BARU UNTUK ADMIN
export const getAllUsers = async () => {
  const token = localStorage.getItem('token'); // (Jika Anda implementasi token auth)
  const response = await axios.get(API_URL, {
    // headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data; // Mengharapkan { success: true, users: [...] }
};

// ✅ FUNGSI BARU UNTUK ADMIN
export const deleteUser = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${userId}`, {
    // headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data; // Mengharapkan { success: true, message: "..." }
};