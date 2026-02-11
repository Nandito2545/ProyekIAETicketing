// frontend/src/pages/auth/SignIn.jsx
import React, { useState } from "react";
import "./SignIn.css";
import { FaFacebookF, FaApple, FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/userService";

const SignIn = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login(username, password);

      // Cek struktur response (sesuaikan dengan backend Anda)
      // Biasanya: res.token ada di root, dan res.user berisi data user
      const user = res.user || res; // Fallback jika struktur berbeda

      if (user) {
        // 1. Simpan Data ke LocalStorage
        // Pastikan path token benar (res.token atau res.user.token)
        localStorage.setItem("token", res.token || user.token); 
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userId", user.id);
        
        // ✅ SIMPAN FOTO PROFIL
        // Jika null/undefined, simpan string kosong agar tidak error
        localStorage.setItem("profile_picture", user.profile_picture || ""); 

        alert(res.message || "Login Berhasil!");

        // 2. Navigasi & RELOAD
        // Kita tentukan tujuan dulu
        const targetPath = user.role === "admin" ? "/admin/Dashboard" : "/Home";

        // ✅ PERBAIKAN UTAMA:
        // Gunakan window.location.href untuk memaksa reload halaman.
        // Ini memastikan Navbar membaca data terbaru dari localStorage.
        navigate(targetPath);
        window.location.reload(); 
        
      } else {
        setError(res.message || "Username atau password salah.");
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      setError(err.response?.data?.message || "Gagal terhubung ke server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex vh-100">
      {/* Left Side */}
      <div className="login-left d-flex align-items-center justify-content-center flex-grow-1">
        <h1 className="login-logo">TICKET.ID</h1>
      </div>

      {/* Right Side */}
      <div className="login-right d-flex align-items-center justify-content-center flex-grow-1">
        <div className="login-box text-dark">
          <h2 className="fw-bold mb-4">Sign in</h2>
          <p className="text-secondary mb-1">
            If you don’t have an account register
          </p>
          <p className="text-secondary mb-4">
            You can{" "}
            <span
              className="register-link"
              onClick={() => navigate("/signup")}
              style={{ cursor: "pointer", color: "#007bff" }}
            >
              Register here !
            </span>
          </p>

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div className="mb-3">
              <label className="form-label small text-secondary">Username</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-secondary">
                  <FaEnvelope />
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent text-dark border-0 border-bottom rounded-0"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="form-label small text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-secondary">
                  <FaLock />
                </span>
                <input
                  type="password"
                  className="form-control bg-transparent text-dark border-0 border-bottom rounded-0"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
              <div>
                <input type="checkbox" className="form-check-input me-2" />
                <small className="text-secondary">Remember me</small>
              </div>
              <small className="text-secondary">Forgot Password?</small>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            {/* Login Button */}
            <button type="submit" className="btn-login w-100 mb-4" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-secondary small mb-3">or continue with</p>
          <div className="d-flex justify-content-center gap-3">
            <div className="social-icon facebook">
              <FaFacebookF />
            </div>
            <div className="social-icon apple">
              <FaApple />
            </div>
            <div className="social-icon google">
              <FaGoogle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;