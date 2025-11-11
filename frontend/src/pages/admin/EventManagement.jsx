import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllEvents, deleteEvent } from "../../services/eventService";
import { Edit, Trash2, Plus } from "lucide-react";
import "./EventManagement.css"; // Impor CSS yang baru dibuat

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
      const res = await getAllEvents({ page: 1, limit: 50 }); // Ambil 50 event
      if (res.success) {
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
    // Tampilkan konfirmasi
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      try {
        const res = await deleteEvent(eventId);
        if (res.success) {
          alert("Event deleted successfully");
          // Refresh list event
          fetchEvents(); 
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
        {loading && <p>Loading events...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Price (Rp)</th>
                <th>Tickets Sold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.date} {event.time}</td>
                  <td>{event.location}</td>
                  <td>{event.price.toLocaleString('id-ID')}</td>
                  <td>{event.capacity - event.availableTickets} / {event.capacity}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EventManagement;