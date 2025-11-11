import React, { useState, useEffect } from "react";
import "./Dashboard.css"; 
import { getAllEvents } from "../../services/eventService";
import { Spinner, Alert } from "react-bootstrap";

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
  const [error, setError] = useState(null);
  
  // ✅ State baru untuk statistik
  const [stats, setStats] = useState({
    totalSales: 0,
    ticketsSold: 0,
    newUser: "N/A", // Tidak bisa diimplementasikan
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Ambil SEMUA event (limit tinggi) untuk kalkulasi
      const res = await getAllEvents({ page: 1, limit: 1000 }); 
      
      if (res.success && res.events) {
        setEvents(res.events);
        
        // ✅ KALKULASI STATISTIK (Anti-NaN)
        let calculatedSales = 0;
        let calculatedSold = 0;

        res.events.forEach(event => {
          // Pastikan semua nilai adalah angka
          const capacity = Number(event.capacity) || 0;
          const available = Number(event.available_tickets) || 0;
          const price = Number(event.price) || 0;
          
          const sold = capacity - available;
          calculatedSold += sold;
          calculatedSales += sold * price;
        });

        setStats({
          totalSales: calculatedSales,
          ticketsSold: calculatedSold,
          newUser: "N/A", // Service 'GetAllUsers' tidak ada di backend
        });

      } else {
        setError(res.message || "Failed to fetch event data.");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <div className="text-center p-5"><Spinner animation="border" /></div>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Baris Card Statistik */}
      <div className="row g-4 stat-card-row">
        <StatCard 
          title="Total Sales" 
          value={`Rp ${stats.totalSales.toLocaleString('id-ID')}`} 
          colorClass="text-success" 
        />
        <StatCard 
          title="Tickets Sold" 
          value={stats.ticketsSold.toLocaleString('id-ID')} 
          colorClass="text-primary" 
        />
        <StatCard 
          title="New User" 
          value={stats.newUser} 
        />
      </div>

      {/* Tabel Upcoming Event */}
      <div className="admin-section-title">Recent Events</div>
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
            {/* Tampilkan 5 event pertama */}
            {events.slice(0, 5).map((event) => {
              // Kalkulasi aman untuk anti-NaN
              const capacity = Number(event.capacity) || 0;
              const available = Number(event.available_tickets) || 0;
              const price = Number(event.price) || 0;
              const sold = capacity - available;
              const total = sold * price;

              return (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.date} {event.time}</td>
                  <td>{sold} / {capacity}</td>
                  <td>{total.toLocaleString('id-ID')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;