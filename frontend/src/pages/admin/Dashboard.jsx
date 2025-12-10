import React, { useState, useEffect } from "react";
import "./Dashboard.css"; 
import { getAllEvents } from "../../services/eventService";
// ✅ 1. Import service 'getAllUsers'
import { getAllUsers } from "../../services/userService"; 
import { Spinner, Alert } from "react-bootstrap";

// Komponen Card Statistik (tidak berubah)
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
  
  // ✅ 2. Ubah 'newUser' menjadi 'userActive'
  const [stats, setStats] = useState({
    totalSales: 0,
    ticketsSold: 0,
    userActive: 0, // Diubah dari N/A
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ 3. Panggil KEDUA API secara bersamaan
      const [eventRes, userRes] = await Promise.all([
        getAllEvents({ page: 1, limit: 1000 }), // Ambil data event
        getAllUsers()                             // Ambil data user
      ]);
      
      // --- Logika untuk Event & Penjualan ---
      if (eventRes.success && eventRes.events) {
        setEvents(eventRes.events);
        
        let calculatedSales = 0;
        let calculatedSold = 0;

        eventRes.events.forEach(event => {
          const capacity = Number(event.capacity) || 0;
          const available = Number(event.available_tickets) || 0;
          const price = Number(event.price) || 0;
          
          const sold = capacity - available;
          calculatedSold += sold;
          calculatedSales += sold * price;
        });

        // --- ✅ 4. Logika BARU untuk User Active ---
        let calculatedUserActive = 0;
        if (userRes.success && userRes.users) {
          // Filter untuk menghitung user dengan role 'user'
          const activeUsers = userRes.users.filter(user => user.role === 'user');
          calculatedUserActive = activeUsers.length;
        } else {
          console.error("Failed to fetch users:", userRes.message);
        }

        // ✅ 5. Set state gabungan
        setStats({
          totalSales: calculatedSales,
          ticketsSold: calculatedSold,
          userActive: calculatedUserActive, // Set data baru
        });

      } else {
        setError(eventRes.message || "Failed to fetch event data.");
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
        {/* ✅ 6. PERBAIKAN: Tampilkan 'User Active' */}
        <StatCard 
          title="User Active" 
          value={stats.userActive.toLocaleString('id-ID')} 
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