import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Event.css";
import { FaSearch } from "react-icons/fa";
import { getAllEvents } from "../../services/eventService";
// ✅ 1. Import helper
import { getImageUrl, handleImageError } from "../../utils/imageUtils";

const Event = () => {
  const [events, setEvents] = useState([]);
  // ... (state lainnya) ...

  // ... (fungsi fetchEvents, handleSearch, loading, error) ...
  // (Tidak ada perubahan di logika)

  return (
    <div className="event-page p-5">
      <div className="event-content container">
        {/* ... (Header dan filter) ... */}

        {events.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No events found.</p>
          </div>
        ) : (
          <div className="event-grid">
            {events.map((event) => (
              <Link 
                to={`/event/${event.id}`} 
                key={event.id}
                className="text-decoration-none"
              >
                <div className="event-card">
                  {/* ✅ 2. Gunakan helper di sini */}
                  <img 
                    src={getImageUrl(event.imageUrl)} 
                    alt={event.title}
                    onError={handleImageError}
                  />
                  <div className="event-info">
                    <h5>{event.title}</h5>
                    <p className="text-muted small">{event.date} • {event.time}</p>
                    <p className="text-muted small">{event.location}</p>
                    <p className="fw-bold text-primary">
                      Rp {event.price.toLocaleString('id-ID')}
                    </p>
                    <span className="badge bg-secondary">{event.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;