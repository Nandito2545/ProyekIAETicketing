import React, { useState, useEffect } from "react";
// ✅ 1. Import Link
import { useNavigate, Link } from "react-router-dom";
import { getUserTickets } from "../../services/ticketService";
import { processPayment } from "../../services/paymentService";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import { Spinner, Button } from "react-bootstrap"; 

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingTicketId, setPayingTicketId] = useState(null);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/SignIn");
        return;
      }
      setLoading(true);
      const response = await getUserTickets(userId);
      if (response.success) {
        setTickets(response.tickets || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      paid: 'bg-success text-white',
      used: 'bg-secondary text-white',
      cancelled: 'bg-danger text-white'
    };
    return badges[status] || 'bg-secondary text-white';
  };
  
  const handlePayPendingTicket = async (ticket) => {
    setPayingTicketId(ticket.id);

    const fullName = localStorage.getItem("customer_fullName");
    const email = localStorage.getItem("customer_email");
    const phone = localStorage.getItem("customer_phone");
    const userId = localStorage.getItem("userId");

    if (!fullName || !email || !phone) {
      alert("Your user details are missing. Please go to the event page to fill them out.");
      navigate(`/event/${ticket.event.id}`); 
      return;
    }

    try {
      const paymentResponse = await processPayment({
        user_id: userId,
        event_id: ticket.event.id,
        amount: ticket.total_price,
        method: 'pending_payment',
        ticket_id: ticket.id,
        fullName: fullName,
        email: email,
        phone: phone
      });

      if (!paymentResponse.success || !paymentResponse.transaction_token) {
        alert("Failed to create payment transaction: " + paymentResponse.message);
        setPayingTicketId(null);
        return;
      }
      
      const midtransToken = paymentResponse.transaction_token;

      window.snap.pay(midtransToken, {
        onSuccess: function(result){
          alert("Payment successful! Refreshing tickets...");
          fetchUserTickets();
          setPayingTicketId(null);
        },
        onPending: function(result){
          alert("Your payment is still pending.");
          fetchUserTickets();
          setPayingTicketId(null);
        },
        onError: function(result){
          alert("Payment failed. Please try again.");
          setPayingTicketId(null);
        },
        onClose: function(){
          alert('You closed the payment window. Your ticket is still pending.');
          setPayingTicketId(null);
        }
      });

    } catch (err) {
      console.error("Repayment error:", err);
      alert("An error occurred: " + (err.response?.data?.message || err.message));
      setPayingTicketId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" text="primary" />
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
          {tickets.map((ticket) => {
            const isPaying = payingTicketId === ticket.id;
            return (
              <div key={ticket.id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <img 
                    src={getImageUrl(ticket.event?.image_url)} 
                    className="card-img-top" 
                    alt={ticket.event?.title || 'Event Image'}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={handleImageError}
                  />
                  <div className="card-body d-flex flex-column">
                    {/* ... (Detail tiket: title, date, code, quantity, total, status) ... */}
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
                      <strong className="text-primary">{ticket.ticket_code}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Quantity:</span>
                      <strong>{ticket.quantity}x</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Total:</span>
                      <strong className="text-success">
                        Rp {ticket.total_price.toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Status:</span>
                      <span className={`badge ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted small mt-2 mb-0">
                      Purchased: {new Date(ticket.purchase_date).toLocaleDateString('id-ID')}
                    </p>
                    
                    {/* LOGIKA TOMBOL DINAMIS */}
                    <div className="mt-auto pt-3">
                      {ticket.status === 'pending' && (
                        <Button 
                          variant="warning" 
                          className="w-100"
                          disabled={isPaying}
                          onClick={() => handlePayPendingTicket(ticket)}
                        >
                          {isPaying ? <Spinner as="span" animation="border" size="sm" /> : "Pay Now"}
                        </Button>
                      )}
                      
                      {/* ✅ PERBAIKAN: Ganti <Button> menjadi <Link> */}
                      {(ticket.status === 'paid' || ticket.status === 'used') && (
                        <Link 
                          to={`/ticket/${ticket.id}`}
                          className="btn btn-outline-primary w-100"
                        >
                          View Ticket
                        </Link>
                      )}
                      
                      {ticket.status === 'cancelled' && (
                        <Button variant="outline-danger" className="w-100" disabled>
                          Payment Cancelled
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}