import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllEvents, deleteEvent } from "../../services/eventService";
import { Edit, Trash2, Plus } from "lucide-react";
import { Spinner, Alert } from "react-bootstrap";
import "./EventManagement.css";
// ✅ 1. Import helper gambar
import { getImageUrl, handleImageError } from "../../utils/imageUtils";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllEvents({ page: 1, limit: 50 });
      if (res.success && res.events) {
        setEvents(res.events);
      } else {
        setError(res.message || "Failed to fetch events");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      try {
        const res = await deleteEvent(eventId);
        if (res.success) {
          alert("Event deleted successfully");
          fetchEvents(); // Refresh list event
        } else {
          alert(res.message || "Failed to delete event");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("An error occurred while deleting.");
      }
    }
  };

  return (
    <div>
      <div className="event-management-header">
        <h1>Event Management</h1>
        <Link to="/admin/add-event" className="btn-add-event">
          <Plus size={18} style={{ marginRight: '5px' }} />
          Add Event
        </Link>
      </div>

      <div className="admin-table-wrapper">
        {loading && <div className="text-center p-5"><Spinner animation="border" /></div>}
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                {/* ✅ 2. Tambahkan kolom header 'Image' */}
                <th>Image</th>
                <th>Event Name</th>
                <th>Date</th>
                <th>Price (Rp)</th>
                <th>Tickets Sold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                
                const capacity = Number(event.capacity) || 0;
                const available = Number(event.available_tickets) || 0;
                const price = Number(event.price) || 0;
                const sold = capacity - available;

                return (
                  <tr key={event.id}>
                    {/* ✅ 3. Tambahkan <td> untuk gambar */}
                    <td>
                      <img 
                        src={getImageUrl(event.image_url)}
                        alt={event.title}
                        className="event-table-image"
                        onError={handleImageError}
                      />
                    </td>
                    <td>{event.title}</td>
                    <td>{event.date} {event.time}</td>
                    <td>{price.toLocaleString('id-ID')}</td>
                    <td>{sold} / {capacity}</td>
                    <td className="action-buttons">
                      <Link 
                        to={`/admin/edit-event/${event.id}`} 
                        className="btn-action edit" 
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        className="btn-action delete" 
                        title="Delete"
                        onClick={() => handleDelete(event.id, event.title)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EventManagement;