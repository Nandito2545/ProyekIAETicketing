import React from "react";
import "./Footer.css"; // Tambahkan baris ini untuk CSS tambahan

const Footer = () => {
  return (
    <footer className="footer-container text-white text-center">
      <h2 className="footer-title">TICKET.ID</h2>
      <div className="footer-links d-flex justify-content-center gap-5">
        <a href="#" className="text-white text-decoration-none small">Home</a>
        <a href="#" className="text-white text-decoration-none small">Event</a>
        <a href="#" className="text-white text-decoration-none small">My Tickets</a>
      </div>
      <hr className="footer-line border-secondary mx-auto" />
      <small className="footer-copy text-secondary">
        © 2024 TICKET.ID. All rights reserved.
      </small>
    </footer>
  );
};

export default Footer;
