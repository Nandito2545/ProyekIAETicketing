import express from "express";
import grpc from "@grpc/grpc-js";
import userClient from "../grpc-clients/userClient.js"; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Setup path untuk ES Modules (agar bisa akses folder uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Helper Function: Simpan Base64 ke File
const saveBase64Image = (base64String) => {
  // Regex untuk memisahkan header data uri (data:image/png;base64,...)
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    return null; // String tidak valid
  }

  const imageBuffer = Buffer.from(matches[2], 'base64');
  const extension = matches[1].split('/')[1]; // misal: png, jpeg
  const fileName = `user-${Date.now()}.${extension}`;
  
  // Folder uploads (mundur 2 level dari routes/userRoutes.js ke root api-gateway)
  const uploadDir = path.join(__dirname, '../../uploads');
  
  // Pastikan folder ada
  if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Tulis file
  fs.writeFileSync(path.join(uploadDir, fileName), imageBuffer);
  
  return fileName;
};

// REGISTER
router.post("/register", (req, res) => {
  const { username, password, role = "user", email, phone } = req.body; 
  userClient.Register({ username, password, role, email, phone }, (err, response) => {
    if (err) {
      console.error("gRPC Register error:", err);
      return res.status(500).json({ success: false, message: err.message || "Internal server error" });
    }
    return res.json(response);
  });
});

// LOGIN
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  userClient.Login({ username, password }, (err, response) => {
    if (err) {
      console.error("gRPC Login error:", err);
      const status = err.code === grpc.status.UNAUTHENTICATED ? 401 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
    res.json(response);
  });
});

// GET ALL USERS
router.get("/", (req, res) => { 
  userClient.GetAllUsers({}, (err, response) => {
    if (err) {
      console.error("gRPC GetAllUsers error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.json({ success: true, users: response.users });
  });
});

// DELETE USER
router.delete("/:id", (req, res) => { 
  const { id } = req.params;
  userClient.DeleteUser({ id: parseInt(id) }, (err, response) => {
    if (err) {
      console.error("gRPC DeleteUser error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.json(response); 
  });
});

// ✅ GET PROFILE
router.get("/:id", (req, res) => {
  userClient.GetUserById({ id: parseInt(req.params.id) }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response); // response biasanya berisi { user: { ... } }
  });
});

// ✅ UPDATE PROFILE (Tanpa Multer / Menggunakan Base64)
router.put("/:id", (req, res) => {
  const { id } = req.params;
  // Tangkap profile_picture_base64 dari body JSON
  const { username, email, phone, password, profile_picture_base64 } = req.body;

  let profile_picture = ""; // Default kosong jika tidak ada gambar baru

  // Logika simpan gambar manual
  if (profile_picture_base64) {
    try {
      const savedFilename = saveBase64Image(profile_picture_base64);
      if (savedFilename) {
        profile_picture = savedFilename;
      }
    } catch (e) {
      console.error("Error saving image:", e);
      return res.status(400).json({ success: false, message: "Invalid image data" });
    }
  }

  // Data yang dikirim ke gRPC Service
  const updatePayload = { 
    id: parseInt(id), 
    username, 
    email, 
    phone,
    password, // Opsional: kirim jika user mengubah password
    profile_picture // Kirim string nama file (contoh: "user-123456.png")
  };

  userClient.UpdateProfile(updatePayload, (err, response) => {
    if (err) {
      console.error("gRPC UpdateProfile error:", err);
      return res.status(500).json({ message: err.message });
    }
    
    // Kembalikan nama file baru ke frontend agar state bisa diupdate
    res.json({
        ...response,
        data: {
            ...updatePayload,
            profile_picture: profile_picture || undefined // Kirim balik nama file
        }
    });
  });
});

export default router;