import db from "../config/db.js";
import bcrypt from "bcrypt";

// 1. REGISTER USER
export const registerUser = async (username, password, role = "user", email, phone) => {
  // Cek username ada atau tidak
  const [existing] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
  if (existing.length > 0) throw new Error("Username already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert Data (Profile picture default null/kosong)
  const [result] = await db.query(
    "INSERT INTO users (username, password, role, email, phone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
    [username, hashedPassword, role, email, phone]
  );

  // ✅ PERBAIKAN: Ambil kolom profile_picture juga setelah register
  const [userRows] = await db.query(
    "SELECT id, username, role, email, phone, profile_picture FROM users WHERE id = ?",
    [result.insertId]
  );

  const newUser = userRows[0];

  // Return dengan format yang aman
  return {
    ...newUser,
    profile_picture: newUser.profile_picture || "" 
  };
};

// 2. LOGIN USER
export const loginUser = async (username, password) => {
  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
  if (rows.length === 0) throw new Error("User not found");

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // ✅ PERBAIKAN UTAMA: Sertakan profile_picture di return object
  return { 
    id: user.id, 
    username: user.username, 
    role: user.role, 
    email: user.email, 
    phone: user.phone,
    profile_picture: user.profile_picture || "" // Penting agar frontend membacanya
  };
};

// 3. GET ALL USERS
export const getAllUsers = async () => {
  // Opsional: Boleh tambahkan profile_picture di sini jika admin butuh melihatnya
  const [rows] = await db.query("SELECT id, username, role, email, phone, profile_picture, createdAt FROM users");
  return rows;
};

// 4. DELETE USER
export const deleteUser = async (userId) => {
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

// 5. GET USER BY ID
export const getUserById = async (id) => {
  // Query ini sudah benar, mengambil profile_picture
  const [rows] = await db.query("SELECT id, username, role, email, phone, profile_picture FROM users WHERE id = ?", [id]);
  
  if (rows.length === 0) return null;

  const user = rows[0];
  return {
    ...user,
    profile_picture: user.profile_picture || ""
  };
};

// 6. UPDATE PROFILE
export const updateUserProfile = async (id, username, email, phone, profilePicture) => {
  let query = "UPDATE users SET username = ?, email = ?, phone = ?";
  let params = [username, email, phone];

  // Hanya update kolom gambar jika ada data gambar baru (tidak kosong/null)
  if (profilePicture && profilePicture !== "") {
    query += ", profile_picture = ?";
    params.push(profilePicture);
  }

  query += " WHERE id = ?";
  params.push(id);

  await db.query(query, params);

  // Kembalikan data terbaru menggunakan fungsi getUserById yang sudah diperbaiki
  return await getUserById(id);
};