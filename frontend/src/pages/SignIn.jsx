import React from "react";
import "./SignIn.css";
import { FaFacebookF, FaApple, FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";

const SignIn = () => {
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
            You can <span className="register-link">Register here !</span>
          </p>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small text-secondary">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 text-secondary">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control bg-transparent text-white border-0 border-bottom rounded-0"
                placeholder="Enter your email address"
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
                className="form-control bg-transparent text-white border-0 border-bottom rounded-0"
                placeholder="Enter your Password"
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
            <div>
              <input type="checkbox" className="form-check-input me-2" />
              <small className="text-secondary">Remember me</small>
            </div>
            <small className="text-secondary">Forgot Password ?</small>
          </div>

          {/* Login Button */}
          <button className="btn-login w-100 mb-4">Login</button>

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
