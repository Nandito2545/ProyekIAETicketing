import express from 'express';
import midtransClient from 'midtrans-client';
import { paymentClient, eventClient } from '../config/grpcClients.js';
import mysql from 'mysql2/promise'; // Pastikan 'mysql2' sudah di-instal

const router = express.Router();

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// Buat pool MySQL di API Gateway (untuk webhook)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticket-konser',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


/**
 * RUTE: GET / (Admin: Get All Payments)
 */
router.get('/', (req, res) => {
  // TODO: Tambahkan auth middleware admin
  paymentClient.GetAllPayments({}, (err, response) => {
    if (err) {
      console.error('GetAllPayments gRPC error:', err);
      return res.status(500).json({ success: false, message: err.message, payments: [] });
    }
    res.json(response);
  });
});


/**
 * RUTE: PROSES PEMBAYARAN (Frontend memanggil ini)
 */
router.post('/process', (req, res) => {
  // ✅ AMBIL: Data customer dari body
  const { 
    user_id, event_id, amount, method, ticket_id, 
    fullName, email, phone 
  } = req.body;

  console.log('📨 Payment request received:', { user_id, ticket_id, fullName, email });

  if (!user_id || !event_id || !amount || !ticket_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields (user_id, event_id, amount, ticket_id)'
    });
  }

  // Panggil gRPC service 'ProcessPayment'
  paymentClient.ProcessPayment(
    {
      user_id: user_id.toString(),
      event_id: event_id.toString(),
      amount: parseFloat(amount),
      method: method || 'other',
      ticket_id: ticket_id.toString(),
      // ✅ KIRIM: Data customer ke gRPC
      full_name: fullName,
      email: email,
      phone: phone
    },
    (err, response) => {
      if (err) {
        console.error('❌ ProcessPayment gRPC error:', err);
        return res.status(500).json({ success: false, message: err.message });
      }
      
      console.log('✅ Midtrans token sent to frontend');
      res.json(response);
    }
  );
});

/**
 * RUTE: WEBHOOK (Midtrans memanggil ini)
 */
router.post('/webhook', async (req, res) => {
  const notification = req.body;
  console.log('🔔 Received Midtrans Webhook:');
  
  const transactionId = notification.order_id;
  const transactionStatus = notification.transaction_status;
  const fraudStatus = notification.fraud_status;
  const paymentType = notification.payment_type;

  if (!transactionId) {
    return res.status(400).send('Invalid notification: missing order_id');
  }

  try {
    // 1. Verifikasi notifikasi (Penting!)
    const statusResponse = await coreApi.transaction.status(transactionId);
    if (notification.status_code !== statusResponse.status_code || 
        notification.gross_amount !== statusResponse.gross_amount) {
      console.warn(`[WARNING] Invalid notification signature for ${transactionId}.`);
      return res.status(403).send('Invalid notification');
    }

    // 2. Kirim notifikasi ke payment-service (gRPC)
    paymentClient.HandlePaymentNotification(
      {
        transaction_id: transactionId,
        transaction_status: transactionStatus,
        fraud_status: fraudStatus,
        payment_type: paymentType
      },
      async (err, response) => {
        if (err || !response.success) {
          console.error('❌ gRPC HandlePaymentNotification Error:', err || response.message);
          return res.status(500).send('Failed to process payment status');
        }
        
        console.log(`✅ Payment DB updated for ${transactionId}`);

        // 3. JIKA SUKSES, perbarui status TIKET
        let newTicketStatus = 'pending';
        if (transactionStatus == 'settlement' || (transactionStatus == 'capture' && fraudStatus == 'accept')) {
          newTicketStatus = 'paid';
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
          newTicketStatus = 'cancelled';
        }
        
        if (newTicketStatus !== 'pending') {
          // Ambil ticket_id dari DB
          const [payRows] = await pool.query('SELECT ticket_id FROM payments WHERE transaction_id = ?', [transactionId]);
          if (payRows.length > 0) {
            const ticketId = payRows[0].ticket_id;
            
            // Panggil gRPC service 'UpdateTicketStatus'
            eventClient.UpdateTicketStatus(
              { ticketId: ticketId.toString(), status: newTicketStatus },
              (ticketErr, ticketRes) => {
                if (ticketErr || !ticketRes.success) {
                  console.error('❌ gRPC UpdateTicketStatus Error:', ticketErr || ticketRes.message);
                } else {
                  console.log(`✅ Ticket ${ticketId} status updated to '${newTicketStatus}'`);
                }
              }
            );
          }
        }
        
        // 4. Kirim balasan 200 OK ke Midtrans
        res.status(200).send('OK');
      }
    );
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).send(error.message);
  }
});


/**
 * RUTE: GET /history/:userId (User: Get My Payments)
 */
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  paymentClient.GetPaymentHistory(
    { user_id: userId },
    (err, response) => {
      if (err) {
        console.error('GetPaymentHistory error:', err);
        return res.status(500).json({ 
          success: false, 
          message: err.message,
          payments: []
        });
      }
      res.json(response);
    }
  );
});

export default router;