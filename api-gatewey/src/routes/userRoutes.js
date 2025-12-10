import express from "express";
import grpc from "@grpc/grpc-js";
import userClient from "../grpc-clients/userClient.js"; 

const router = express.Router();

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

export default router;