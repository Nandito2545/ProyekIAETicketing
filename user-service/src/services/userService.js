import db from "../config/db.js";
import bcrypt from "bcrypt";

// REGISTER USER (Sudah ada)
export const registerUser = async (username, password, role = "user", email, phone) => {
  const [existing] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
  if (existing.length > 0) throw new Error("Username already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    "INSERT INTO users (username, password, role, email, phone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
    [username, hashedPassword, role, email, phone]
  );

  const [userRows] = await db.query(
    "SELECT id, username, role, email, phone FROM users WHERE id = ?",
    [result.insertId]
  );

  return userRows[0];
};

// LOGIN USER (Sudah ada)
export const loginUser = async (username, password) => {
  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
  if (rows.length === 0) throw new Error("User not found");

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return { 
    id: user.id, 
    username: user.username, 
    role: user.role, 
    email: user.email, 
    phone: user.phone 
  };
};

// ✅ FUNGSI BARU: Get All Users
export const getAllUsers = async () => {
  const [rows] = await db.query("SELECT id, username, role, email, phone, createdAt FROM users");
  return rows;
};

// ✅ FUNGSI BARU: Delete User
export const deleteUser = async (userId) => {
  // Database Anda sudah diatur dengan ON DELETE CASCADE,
  // jadi menghapus user akan otomatis menghapus tiket & pembayaran terkait.
  
  // Pertama, cek apakah user adalah 'admin'
  const [userRows] = await db.query("SELECT role FROM users WHERE id = ?", [userId]);
  if (userRows.length > 0 && userRows[0].role === 'admin') {
    throw new Error("Cannot delete an admin account.");
  }

  const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);
  
  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }
  return { success: true, message: "User deleted successfully" };
};

// ... (fungsi registerUser, loginUser, getAllUsers, deleteUser yang sudah ada) ...

// ✅ FUNGSI BARU: Get User By ID
export const getUserById = async (id) => {
  const [rows] = await db.query("SELECT id, username, role, email, phone, profile_picture FROM users WHERE id = ?", [id]);
  return rows[0];
};

// ✅ FUNGSI BARU: Update Profile
export const updateUserProfile = async (id, username, email, phone, profilePicture) => {
  // Jika profilePicture ada (di-upload), update kolom itu juga
  // Jika tidak, biarkan yang lama (logic di query bisa disesuaikan)
  
  let query = "UPDATE users SET username = ?, email = ?, phone = ?";
  let params = [username, email, phone];

  if (profilePicture) {
    query += ", profile_picture = ?";
    params.push(profilePicture);
  }

  query += " WHERE id = ?";
  params.push(id);

  await db.query(query, params);

  // Kembalikan data terbaru
  return await getUserById(id);
};