import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Event.css";
import { FaSearch } from "react-icons/fa";
import { getAllEvents } from "../../services/eventService";
// ✅ 1. Import helper gambar
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import { Spinner, Alert } from "react-bootstrap"; // Import
 
// ✅ 2. FUNGSI BARU: Untuk menentukan status event
const getEventStatus = (event) => {
  // Gunakan snake_case (available_tickets) sesuai data dari backend
  if (event.available_tickets === 0) {
    return { text: "Sold Out", class: "bg-danger text-white" };
  }
  
  try {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    if (eventDateTime < new Date()) {
      return { text: "Event Ended", class: "bg-secondary text-white" };
    }
  } catch (e) {
    console.error("Invalid date format for event:", event.id, e);
  }

  return null; // null berarti "Available" dan tidak perlu badge
};


const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, [category, search]); // fetch ulang saat kategori atau pencarian berubah

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error setiap kali fetch
      const response = await getAllEvents({
        page: 1,
        limit: 20,
        category: category,
        search: search
      });

      if (response.success) {
        setEvents(response.events || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  if (loading) {
    return (
      <div className="event-page p-5" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" text="primary" />
          <p className="mt-2">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-page p-5" style={{ minHeight: '60vh' }}>
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="event-page p-5">
      <div className="event-content container">
        <div className="event-header">
          <h2>Events</h2>
          <form onSubmit={handleSearch} className="search-box">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <select 
            className="form-select w-auto"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="event-grid">
            {events.map((event) => {
              // ✅ 3. Tentukan status untuk setiap event
              const status = getEventStatus(event);
              
              return (
                <Link 
                  to={`/event/${event.id}`} 
                  key={event.id}
                  // ✅ 4. Buat kartu non-available tidak bisa diklik
                  className={`text-decoration-none ${status ? 'pe-none' : ''}`}
                  style={status ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                  onClick={(e) => { if (status) e.preventDefault(); }} // Mencegah navigasi
                >
                  <div className="event-card">
                    {/* ✅ 5. Tampilkan badge status jika tidak available */}
                    {status && (
                      <span className={`badge ${status.class} event-card-status`}>
                        {status.text}
                      </span>
                    )}
                    <img 
                      src={getImageUrl(event.image_url)} // Gunakan snake_case
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;