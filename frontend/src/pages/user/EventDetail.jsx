import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EventDetail.css";
import { getEventById } from "../../services/eventService";
import { purchaseTicket } from "../../services/ticketService";
import { processPayment } from "../../services/paymentService";
// ✅ 1. Import helper
import { getImageUrl, handleImageError } from "../../utils/imageUtils";

const EventDetail = () => {
  // ... (state dan fungsi lainnya) ...
  // (Tidak ada perubahan di logika)

  if (loading) {
    // ... (kode loading) ...
  }

  if (!event) {
    // ... (kode event not found) ...
  }

  return (
    <div className="event-detail-page py-5 p-5">
      <h3 className="fw-bold mb-4">Event Details</h3>
      <div className="row g-5">
        {/* Left Side - Event Info */}
        <div className="col-md-6">
          {/* ✅ 2. Gunakan helper di sini */}
          <img
            src={getImageUrl(event.imageUrl)}
            alt={event.title}
            className="img-fluid rounded mb-4 shadow-sm"
            style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
            onError={handleImageError}
          />
          {/* ... (Sisa detail event) ... */}
        </div>

        {/* Right Side - Ticket Form */}
        <div className="col-md-6">
          {/* ... (Sisa form tiket) ... */}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;