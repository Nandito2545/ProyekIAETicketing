import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTicketById } from "../../services/ticketService";
import { Spinner, Alert } from "react-bootstrap";
import { QRCodeCanvas } from 'qrcode.react'; // Import QR Code
// ✅ Kita tidak lagi membutuhkan html2canvas
import "./ViewTicket.css";
import { ArrowLeft } from "lucide-react";

// Komponen Tiket Tunggal
const Ticket = ({ ticket, event, index }) => {
  // ❌ Ref untuk screenshot tidak diperlukan lagi
  // const ticketRef = useRef(null); 

  // ✅ FUNGSI DOWNLOAD BARU: Mengunduh QR Code dari Canvas
  const handleDownload = () => {
    // 1. Temukan elemen canvas QR code dengan ID uniknya
    const canvas = document.getElementById(`qr-code-${ticket.id}-${index}`);
    
    if (canvas) {
      // 2. Konversi canvas menjadi Data URL (gambar PNG)
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream"); // Trik untuk memaksa download

      // 3. Buat link sementara untuk mengunduh
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qr-ticket-${ticket.ticket_code}.png`; // Nama file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Tidak dapat menemukan elemen QR Code Canvas");
    }
  };

  return (
    // ❌ 'ref={ticketRef}' tidak diperlukan lagi
    <div className="ticket-visual">
      <div className="ticket-info">
        <h3>{event.title}</h3>
        <p><strong>Date:</strong> {event.date} | {event.time}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{ticket.status}</span></p>
      </div>
      <div className="ticket-qr">
        <QRCodeCanvas 
          // ✅ TAMBAHKAN ID: Beri ID unik agar bisa ditemukan
          id={`qr-code-${ticket.id}-${index}`}
          value={ticket.ticket_code} // QR Code berisi kode tiket
          size={90} 
          bgColor={"#ffffff"} 
          fgColor={"#000000"} 
        />
        <button onClick={handleDownload} className="btn-download-ticket">
          Download QR
        </button>
      </div>
    </div>
  );
};


// Halaman Utama ViewTicket
const ViewTicket = () => {
  const { id } = useParams(); // Ambil ID tiket dari URL
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTicketById(id);
      
      if (res.success && res.ticket) {
        setTicket(res.ticket);
      } else {
        setError(res.message || "Ticket not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="view-ticket-page text-center">
        <Spinner animation="border" />
        <p>Loading Ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-ticket-page">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="view-ticket-page">
        <Alert variant="warning">No ticket data available.</Alert>
      </div>
    );
  }

  return (
    <div className="view-ticket-page">
      <div className="container">
        <div className="view-ticket-header">
          <Link to="/MyTickets" className="back-link">
            <ArrowLeft size={18} /> Back to My Tickets
          </Link>
          <h1 className="mt-2 fw-bold">Your Ticket{ticket.quantity > 1 ? 's' : ''}</h1>
          <p className="text-muted">You purchased {ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''} for this event.</p>
        </div>
        
        <div className="ticket-grid">
          {Array.from({ length: ticket.quantity }).map((_, index) => (
            <Ticket 
              key={index} 
              ticket={ticket} 
              event={ticket.event} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewTicket;