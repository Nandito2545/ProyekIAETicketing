import bcrypt from 'bcrypt';
import { User } from '../config/db.js'; // ⚠️ Pastikan path ini mengarah ke Model User Anda

// 1. REGISTER
export const register = async (call, callback) => {
  try {
    const { username, password, role, email, phone } = call.request;
    
    // Cek apakah user sudah ada
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return callback({ code: 6, message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke Database
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      phone,
      profile_picture: '' // Default kosong
    });

    callback(null, {
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
        phone: newUser.phone,
        profile_picture: newUser.profile_picture || ""
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    callback({ code: 13, message: error.message });
  }
};

// 2. LOGIN (Perbaikan Utama: Kembalikan profile_picture)
export const login = async (call, callback) => {
  try {
    const { username, password } = call.request;

    // Cari user di DB
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return callback({ code: 5, message: "User not found" });
    }

    // Cek Password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return callback({ code: 16, message: "Invalid password" });
    }

    // ✅ PENTING: Sertakan profile_picture dari DB ke response
    callback(null, {
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture || "" // Ambil dari DB
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    callback({ code: 13, message: error.message });
  }
};

// 3. GET USER BY ID (Penting untuk reload halaman)
export const getUserById = async (call, callback) => {
  try {
    const { id } = call.request;
    const user = await User.findByPk(id);

    if (!user) {
      return callback({ code: 5, message: "User not found" });
    }

    callback(null, {
      success: true,
      message: "User found",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture || "" // Pastikan ini terkirim
      }
    });

  } catch (error) {
    console.error("Get User Error:", error);
    callback({ code: 13, message: error.message });
  }
};

// 4. UPDATE PROFILE
export const updateProfile = async (call, callback) => {
  try {
    const { id, username, email, phone, profile_picture } = call.request;
    
    const user = await User.findByPk(id);
    if (!user) return callback({ code: 5, message: "User not found" });

    // Update field
    user.username = username;
    user.email = email;
    user.phone = phone;
    
    // Hanya update gambar jika ada nama file baru yang dikirim
    if (profile_picture && profile_picture.trim() !== "") {
      user.profile_picture = profile_picture;
    }

    await user.save();

    callback(null, {
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture || ""
      }
    });

  } catch (error) {
    console.error("Update Error:", error);
    callback({ code: 13, message: error.message });
  }
};