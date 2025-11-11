import axios from "axios";

const API_URL = import.meta.env.VITE_PAYMENT_API || "http://localhost:5000/api/payments";

/**
 * ✅ FUNGSI BARU UNTUK ADMIN
 * Mengambil semua data pembayaran
 */
export const getAllPayments = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, { // Memanggil GET /api/payments
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data; // Seharusnya { success: true, payments: [...] }
};

/**
 * Meminta token Midtrans ke backend
 */
export const processPayment = async (paymentData) => {
  const token = localStorage.getItem('token');
  const ticketId = paymentData.ticket_id; // Ambil ticket_id dari objek

  const dataToSend = {
    ...paymentData,
    ticket_id: ticketId 
  };

  const response = await axios.post(`${API_URL}/process`, dataToSend, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data; // Mengembalikan { success, transaction_token, ... }
};