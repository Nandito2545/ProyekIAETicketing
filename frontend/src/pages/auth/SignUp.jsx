import React, { useState } from "react";
import "./SignUp.css";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ✅ 1. Import useNavigate
import { register } from "../../services/userService"; // ✅ 2. Import fungsi register

const SignUp = () => {
  // ✅ 3. Tambahkan useNavigate untuk pindah halaman
  const navigate = useNavigate();

  // ✅ 4. Tambahkan state untuk menyimpan data form
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 5. Buat fungsi untuk handle perubahan input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ 6. Buat fungsi untuk handle submit form
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi Sederhana
    if (!formData.username || !formData.password) {
      setError("Username and Password are required.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Panggil API register
      // Catatan: Backend Anda saat ini hanya menerima username & password,
      // email diabaikan sesuai desain service Anda.
      const res = await register(formData.username, formData.password, "user");

      if (res.user) {
        alert(res.message || "Registration successful! Please login.");
        navigate("/SignIn"); // Arahkan ke halaman login
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Register error:", err.response || err);
      setError(err.response?.data?.message || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page d-flex vh-100">
      {/* Left Side */}
      <div className="signup-left d-flex align-items-center justify-content-center flex-grow-1">
        <h1 className="signup-logo">TICKET.ID</h1>
      </div>

      {/* Right Side */}
      <div className="signup-right d-flex align-items-center justify-content-center flex-grow-1">
        {/* ✅ 7. Ubah div menjadi <form> dan tambahkan onSubmit */}
        <form className="signup-box text-black" onSubmit={handleRegister}>
          <h2 className="fw-bold mb-4">Sign up</h2>
          <p className="text-secondary mb-1">
            If you already have an account register
          </p>
          <p className="text-secondary mb-4">
            You can{" "}
            {/* ✅ 8. Buat link "Login here" fungsional */}
            <span
              className="login-link"
              onClick={() => navigate("/SignIn")}
              style={{ cursor: "pointer" }}
            >
              Login here !
            </span>
          </p>

          {/* Menampilkan error jika ada */}
          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small text-secondary">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 text-secondary">
                <FaEnvelope />
              </span>
              <input
                type="email"
                name="email" // ✅ 9. Tambahkan name
                className="form-control bg-transparent border-0 border-bottom rounded-0"
                placeholder="Enter your email address"
                value={formData.email} // ✅ 10. Hubungkan ke state
                onChange={handleChange} // ✅ 11. Hubungkan ke handler
              />
            </div>
          </div>

          {/* Username */}
          <div className="mb-3">
            <label className="form-label small text-secondary">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 text-secondary">
                <FaUser />
              </span>
              <input
                type="text"
                name="username" // ✅ 9. Tambahkan name
                className="form-control bg-transparent border-0 border-bottom rounded-0"
                placeholder="Enter your User name"
                value={formData.username} // ✅ 10. Hubungkan ke state
                onChange={handleChange} // ✅ 11. Hubungkan ke handler
                required // ✅ 12. Tambahkan required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label small text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 text-secondary">
                <FaLock />
              </span>
              <input
                type="password"
                name="password" // ✅ 9. Tambahkan name
                className="form-control bg-transparent border-0 border-bottom rounded-0"
                placeholder="Enter your Password"
                value={formData.password} // ✅ 10. Hubungkan ke state
                onChange={handleChange} // ✅ 11. Hubungkan ke handler
                required // ✅ 12. Tambahkan required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label small text-secondary">
              Confirm Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 text-secondary">
                <FaLock />
              </span>
              <input
                type="password"
                name="confirmPassword" // ✅ 9. Tambahkan name
                className="form-control bg-transparent border-0 border-bottom rounded-0"
                placeholder="Confirm your Password"
                value={formData.confirmPassword} // ✅ 10. Hubungkan ke state
                onChange={handleChange} // ✅ 11. Hubungkan ke handler
                required // ✅ 12. Tambahkan required
              />
            </div>
          </div>

          {/* ✅ 13. Ganti <button> menjadi <button type="submit"> */}
          <button type="submit" className="btn-register w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;