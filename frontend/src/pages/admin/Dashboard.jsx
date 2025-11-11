import React, { useState, useEffect } from "react";
import "./Dashboard.css"; // Impor CSS yang baru dibuat
import { getAllEvents } from "../../services/eventService";

// Komponen Card Statistik
const StatCard = ({ title, value, colorClass = "text-dark" }) => (
  <div className="col-md-4">
    <div className="stat-card">
      <h5>{title}</h5>
      <div className={`value ${colorClass}`}>{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Panggil API untuk mendapatkan event
      const res = await getAllEvents({ page: 1, limit: 5 }); // Ambil 5 event terbaru
      if (res.success) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // CATATAN: Backend Anda belum memiliki service 'GetStats'
  // Data ini adalah MOCK (data palsu) untuk keperluan UI.
  const stats = {
    totalSales: "Rp 7,124,800",
    ticketsSold: "1,204",
    newUser: "98",
  };

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Baris Card Statistik */}
      <div className="row g-4 stat-card-row">
        <StatCard title="Total Sales" value={stats.totalSales} colorClass="text-success" />
        <StatCard title="Tickets Sold" value={stats.ticketsSold} colorClass="text-primary" />
        <StatCard title="New User" value={stats.newUser} />
      </div>

      {/* Tabel Upcoming Event */}
      <div className="admin-section-title">Upcoming Event</div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Tickets Sold</th>
              <th>Total (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">Loading...</td></tr>
            ) : (
              events.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.date} {event.time}</td>
                  <td>{event.capacity - event.availableTickets}</td>
                  <td>{( (event.capacity - event.availableTickets) * event.price ).toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;