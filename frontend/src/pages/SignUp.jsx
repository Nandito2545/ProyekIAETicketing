import React from "react";
import "./SignUp.css";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";

const SignUp = () => {
  return (
    <div className="signup-page d-flex vh-100">
      {/* Left Side */}
      <div className="signup-left d-flex align-items-center justify-content-center flex-grow-1">
        <h1 className="signup-logo">TICKET.ID</h1>
      </div>

      {/* Right Side */}
      <div className="signup-right d-flex align-items-center justify-content-center flex-grow-1">
        <div className="signup-box text-black">
          <h2 className="fw-bold mb-4">Sign up</h2>
          <p className="text-secondary mb-1">
            If you already have an account register
          </p>
          <p className="text-secondary mb-4">
            You can <span className="login-link">Login here !</span>
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
                className="form-control bg-transparent border-0 border-bottom rounded-0"
                placeholder="Enter your email address"
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
                className="form-control bg-transparent border-0 border-bottom rounded-0"
                placeholder="Enter your User name"
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
                className="form-control bg-transparent border-0 border-bottom rounded-0"
                placeholder="Enter your Password"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label small text-secondary">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 text-secondary">
                <FaLock />
              </span>
              <input
                type="password"
                className="form-control bg-transparent border-0 border-bottom rounded-0"
                placeholder="Confirm your Password"
              />
            </div>
          </div>

          {/* Register Button */}
          <button className="btn-register w-100">Register</button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
