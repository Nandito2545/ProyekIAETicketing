import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EventDetail.css";
import { getEventById } from "../../services/eventService";
import { purchaseTicket } from "../../services/ticketService";
import { processPayment } from "../../services/paymentService";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import { Alert, Spinner } from "react-bootstrap";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState("regular");
  const [quantity, setQuantity] = useState(1);
  
  // ✅ PERBAIKAN: Ambil data form dari localStorage jika ada
  const [formData, setFormData] = useState({
    fullName: localStorage.getItem("customer_fullName") || "",
    email: localStorage.getItem("customer_email") || "",
    phone: localStorage.getItem("customer_phone") || ""
  });
  
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      const response = await getEventById(id);
      
      if (response.success && response.event) {
        setEvent(response.event);
      } else {
        alert("Event not found");
        navigate("/event");
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      alert("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    if (!event) return 0;
    const basePrice = selectedTicket === "vip" ? (event.price * 1.5) : event.price;
    return basePrice * quantity;
  };

  const getEventStatus = () => {
    if (!event) {
      return { text: "Loading...", disabled: true, variant: "secondary" };
    }
    if (event.available_tickets === 0) {
      return { text: "Sold Out", disabled: true, variant: "danger" };
    }
    try {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      if (eventDateTime < new Date()) {
        return { text: "Event Has Ended", disabled: true, variant: "secondary" };
      }
    } catch (e) { console.error("Invalid date"); }
    
    return { text: "Buy Ticket", disabled: false, variant: "info" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTicket) {
      alert("Please select a ticket type");
      return;
    }
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first");
      navigate("/SignIn");
      return;
    }
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Please fill in all fields");
      return;
    }

    setProcessing(true);
    
    // ✅ PERBAIKAN: Simpan detail customer di localStorage
    // Ini agar halaman "My Tickets" bisa menggunakannya untuk bayar ulang
    localStorage.setItem("customer_fullName", formData.fullName);
    localStorage.setItem("customer_email", formData.email);
    localStorage.setItem("customer_phone", formData.phone);

    try {
      const totalPrice = calculateTotal();

      // Step 1: Buat Tiket (status 'pending')
      const ticketResponse = await purchaseTicket({
        eventId: id,
        userId: userId, 
        quantity: quantity,
        totalPrice: totalPrice
      });

      if (!ticketResponse.success) {
        alert("Ticket creation failed: " + ticketResponse.message);
        setProcessing(false);
        return;
      }
      
      const newTicketId = ticketResponse.ticket.id;

      // Step 2: Minta Token Midtrans
      const paymentResponse = await processPayment({
        user_id: userId, 
        event_id: id,
        amount: totalPrice,
        method: selectedTicket,
        ticket_id: newTicketId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });

      if (!paymentResponse.success || !paymentResponse.transaction_token) {
        alert("Failed to create payment transaction: " + paymentResponse.message);
        setProcessing(false);
        return;
      }
      
      const midtransToken = paymentResponse.transaction_token;

      // Step 3: Buka Pop-up Pembayaran Midtrans (Snap)
      window.snap.pay(midtransToken, {
        onSuccess: function(result){
          alert("Payment successful! You will be redirected.");
          navigate("/MyTickets");
        },
        onPending: function(result){
          alert("Your payment is pending. Please check 'My Tickets' page for status.");
          navigate("/MyTickets");
        },
        onError: function(result){
          alert("Payment failed. Please try again.");
          setProcessing(false);
        },
        onClose: function(){
          // ✅ PERBAIKAN: Arahkan ke MyTickets agar jelas
          alert('You closed the payment window. Your ticket is saved with "pending" status in My Tickets.');
          navigate("/MyTickets");
        }
      });

    } catch (err) {
      console.error("Purchase error:", err);
      alert("An error occurred during purchase: " + (err.response?.data?.message || err.message || "Unknown error"));
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="event-detail-page py-5 p-5 text-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" text="primary" />
        <p className="mt-2">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-page py-5 p-5" style={{ minHeight: '60vh' }}>
        <Alert variant="danger">Event not found</Alert>
      </div>
    );
  }

const status = getEventStatus();

  return (
    <div className="event-detail-page py-5 p-5">
      <h3 className="fw-bold mb-4">Event Details</h3>
      <div className="row g-5">
        {/* Left Side - Event Info */}
        <div className="col-md-6">
          <img
            src={getImageUrl(event.image_url)}
            alt={event.title}
            className="img-fluid rounded mb-4 shadow-sm"
            style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
            onError={handleImageError}
          />
          <h4 className="fw-bold">{event.title}</h4>
          <span className="badge bg-secondary mb-3">{event.category}</span>
          <p className="fw-semibold mt-2 mb-1">Date: {event.date}</p>
          <p className="fw-semibold mb-1">Time: {event.time}</p>
          <p className="fw-semibold mb-3">Location: {event.location}</p>
          <p className="text-secondary">{event.description}</p>
          <p className="fw-bold">
            Available Tickets: <span className="text-success">{event.available_tickets}</span> / {event.capacity}
          </p>
          <p className="fw-bold text-primary fs-5">
            Price: Rp {event.price.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Right Side - Ticket Form */}
        <div className="col-md-6">
          {/* ... (kode ticket options) ... */}

          <form className="ticket-form" onSubmit={handleSubmit}>
            <input
              type="text" name="fullName" placeholder="Full Name"
              className="form-control mb-3"
              value={formData.fullName} onChange={handleInputChange} required
              disabled={status.disabled}
            />
            <input
              type="email" name="email" placeholder="Email Address"
              className="form-control mb-3"
              value={formData.email} onChange={handleInputChange} required
              disabled={status.disabled}
            />
            <input
              type="tel" name="phone" placeholder="Phone Number"
              className="form-control mb-3"
              value={formData.phone} onChange={handleInputChange} required
              disabled={status.disabled}
            />
            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number" min="1"
                max={Math.min(event.available_tickets, 10)}
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                required
                disabled={status.disabled}
              />
              <small className="text-muted">Maximum 10 tickets per transaction</small>
            </div>
            
            <Alert variant={status.variant} className="text-center fw-bold">
              {status.text === 'Buy Ticket' ? 'This event is available for purchase.' : status.text}
            </Alert>

            {selectedTicket && !status.disabled && (
              <div className="alert alert-info">
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong> 
                  <strong className="text-primary fs-5">Rp {calculateTotal().toLocaleString('id-ID')}</strong>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-buy"
              disabled={!selectedTicket || processing || status.disabled}
            >
              {processing 
                ? <><Spinner as="span" animation="border" size="sm" /> Please wait...</>
                : status.text} 
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;