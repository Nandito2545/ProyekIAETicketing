import React, { useState } from "react";
import "./EventDetail.css";

const EventDetail = () => {
  const [selectedTicket, setSelectedTicket] = useState("");

  return (
    <div className="event-detail-page py-5 p-5">
      <h3 className="fw-bold mb-4">Event Details</h3>

      <div className="row g-5">
        {/* Left Side - Event Info */}
        <div className="col-md-6">
          <img
            src="event1.jpg"
            alt="Bolivia Fiesta"
            className="img-fluid rounded mb-4 shadow-sm"
          />
          <h4 className="fw-bold">Bolivia Fiesta 2025 – Buy Your Tickets!</h4>
          <p className="fw-semibold mt-2 mb-1">Date: 12–14 March 2025</p>
          <p className="fw-semibold mb-1">Location: La Paz, Bolivia</p>
          <p className="text-secondary">
            Celebrate music, culture & tradition! <br />
            An unforgettable experience awaits.
          </p>
        </div>

        {/* Right Side - Ticket Form */}
        <div className="col-md-6">
          <div className="ticket-options d-flex gap-4 mb-4">
            <label
              className={`ticket-card shadow-sm ${
                selectedTicket === "regular" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="ticketType"
                value="regular"
                checked={selectedTicket === "regular"}
                onChange={() => setSelectedTicket("regular")}
              />
              <div className="ticket-info">
                <h6 className="fw-semibold mb-1">Regular Day 1</h6>
                <p className="mb-0 price">Rp 1.250.000</p>
              </div>
            </label>

            <label
              className={`ticket-card shadow-sm ${
                selectedTicket === "vip" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="ticketType"
                value="vip"
                checked={selectedTicket === "vip"}
                onChange={() => setSelectedTicket("vip")}
              />
              <div className="ticket-info">
                <h6 className="fw-semibold mb-1">VIP Pass</h6>
                <p className="mb-0 price">Rp 2.100.000</p>
              </div>
            </label>
          </div>

          <form className="ticket-form">
            <input
              type="text"
              placeholder="Full Name"
              className="form-control mb-3"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="form-control mb-3"
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="form-control mb-4"
            />
            <button
              type="submit"
              className="btn-buy"
              disabled={!selectedTicket}
            >
              {selectedTicket ? `Buy ${selectedTicket.toUpperCase()} Ticket` : "Choose Ticket Type"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
