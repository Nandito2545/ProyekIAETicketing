import axios from "axios";

// Pastikan port backend benar (5000)
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

export const getAllUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data; 
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/${userId}`);
  return response.data; 
};

// ✅ PERBAIKAN: Ubah nama 'getUserById' menjadi 'getUserProfile'
export const getUserProfile = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data; 
};

// ✅ PERBAIKAN: Kirim sebagai JSON (tanpa header multipart/form-data)
// Karena kita menggunakan Base64, Axios akan otomatis menganggapnya JSON.
export const updateUserProfile = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};