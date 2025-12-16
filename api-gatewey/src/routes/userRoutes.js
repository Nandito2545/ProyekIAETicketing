import express from "express";
import grpc from "@grpc/grpc-js";
import userClient from "../grpc-clients/userClient.js"; 
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Simpan di folder uploads
  },
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

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

//GET ALL USERS
router.get("/", (req, res) => { 
  userClient.GetAllUsers({}, (err, response) => {
    if (err) {
      console.error("gRPC GetAllUsers error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.json({ success: true, users: response.users });
  });
});

//DELETE USER
router.delete("/:id", (req, res) => { 
  const { id } = req.params;
  userClient.DeleteUser({ id: parseInt(id) }, (err, response) => {
    if (err) {
      console.error("gRPC DeleteUser error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.json(response); // { success: true, message: "..." }
  });
});

// ✅ RUTE BARU: GET PROFILE (Ambil data terbaru)
router.get("/:id", (req, res) => {
  userClient.GetUserById({ id: parseInt(req.params.id) }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
});

// ✅ RUTE BARU: UPDATE PROFILE (Support Upload Gambar)
router.put("/:id", upload.single('profile_picture'), (req, res) => {
  const { id } = req.params;
  const { username, email, phone } = req.body;
  const profile_picture = req.file ? req.file.filename : ""; // Ambil nama file jika ada

  userClient.UpdateProfile({ 
    id: parseInt(id), 
    username, 
    email, 
    phone, 
    profile_picture 
  }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
});

export default router;