import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserTickets } from "../../services/ticketService";
// ✅ 1. Import helper gambar
import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      // ✅ 2. PERBAIKAN: Ambil 'userId' (angka) dari localStorage
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        navigate("/SignIn"); // Jika belum login, paksa ke SignIn
        return;
      }

      setLoading(true);
      
      // ✅ 3. PERBAIKAN: Gunakan 'userId' (angka) untuk memanggil API
      const response = await getUserTickets(userId);

      if (response.success) {
        setTickets(response.tickets || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      if (err.response && err.response.status === 401) {
        // Token mungkin tidak valid, paksa login ulang
        navigate("/SignIn");
      } else {
        setError("Failed to load tickets. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk menentukan warna badge status
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      paid: 'bg-success text-white',
      used: 'bg-secondary text-white',
      cancelled: 'bg-danger text-white'
    };
    return badges[status] || 'bg-secondary text-white';
  };
  
  // Fungsi dummy untuk tombol download
  const handleDownload = (ticketCode) => {
    alert(`Fungsi download untuk tiket ${ticketCode} belum terimplementasi.\n(Ini memerlukan service backend baru untuk generate PDF/gambar).`);
  };

  if (loading) {
    return (
      <div className="container py-5" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5" style={{ minHeight: '60vh' }}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ minHeight: '60vh' }}>
      <h2 className="mb-4 fw-bold">My Tickets</h2>

      {tickets.length === 0 ? (
        <div className="alert alert-info text-center">
          <p className="mb-2 fs-5">You don't have any tickets yet.</p>
          <p>Why not find your next great event?</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={() => navigate("/Event")}
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100">
                {/* ✅ 4. PERBAIKAN: Gunakan helper gambar */}
                <img 
                  src={getImageUrl(ticket.event?.imageUrl)} 
                  className="card-img-top" 
                  alt={ticket.event?.title || 'Event Image'}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={handleImageError}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{ticket.event?.title}</h5>
                  <p className="card-text text-muted small">
                    {ticket.event?.date} • {ticket.event?.time}
                  </p>
                  <p className="card-text text-muted small mb-1">
                    {ticket.event?.location}
                  </p>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Ticket Code:</span>
                    <strong className="text-primary">{ticket.ticketCode}</strong>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Quantity:</span>
                    <strong>{ticket.quantity}x</strong>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Total:</span>
                    <strong className="text-success">
                      Rp {ticket.totalPrice.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Status:</span>
                    <span className={`badge ${getStatusBadge(ticket.status)}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-muted small mt-2 mb-0">
                    Purchased: {new Date(ticket.purchaseDate).toLocaleDateString('id-ID')}
                  </p>
                  
                  {/* Tombol Download */}
                  {ticket.status === 'paid' && (
                    <button 
                      className="btn btn-sm btn-outline-primary w-100 mt-3"
                      onClick={() => handleDownload(ticket.ticketCode)}
                    >
                      Download E-Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}