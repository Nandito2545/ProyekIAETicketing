import React from "react";
import "./Footer.css"; // Tambahkan baris ini untuk CSS tambahan
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <footer className="footer-container text-white text-center">
      <h2 className="footer-title">TICKET.ID</h2>
      <div className="footer-links d-flex justify-content-center gap-5">
        <Link to="/" className="text-decoration-none text-white mx-2">Home</Link>
        <Link to="/event" className="text-decoration-none text-white mx-2">Event</Link>
        <Link to="/MyTickets" className="text-decoration-none text-white mx-2">My Tickets</Link>
      </div>
      <hr className="footer-line border-secondary mx-auto" />
      <small className="footer-copy text-secondary">
        © 2024 TICKET.ID. All rights reserved.
      </small>
    </footer>
  );
};

export default Footer;
