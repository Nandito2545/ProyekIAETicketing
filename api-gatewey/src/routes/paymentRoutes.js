import express from 'express';
import midtransClient from 'midtrans-client';
import { paymentClient, eventClient, notificationClient } from '../config/grpcClients.js';
import mysql from 'mysql2/promise';

const router = express.Router();

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticket-konser',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


//GET ALL PAYMENTS
router.get('/', (req, res) => {
  paymentClient.GetAllPayments({}, (err, response) => {
    if (err) {
      console.error('GetAllPayments gRPC error:', err);
      return res.status(500).json({ success: false, message: err.message, payments: [] });
    }
    res.json(response); // Harusnya { payments: [...] }
  });
});


//PROSES PEMBAYARAN
router.post('/process', (req, res) => {
  const { 
    user_id, event_id, amount, method, ticket_id, 
    fullName, email, phone 
  } = req.body;

  if (!user_id || !event_id || !amount || !ticket_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields (user_id, event_id, amount, ticket_id)'
    });
  }

  paymentClient.ProcessPayment(
    {
      user_id: user_id.toString(),
      event_id: event_id.toString(),
      amount: parseFloat(amount),
      method: method || 'other',
      ticket_id: ticket_id.toString(),
      customer_name: fullName,
      customer_email: email,
      customer_phone: phone
    },
    (err, response) => {
      if (err) {
        console.error('❌ ProcessPayment gRPC error:', err);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json(response);
    }
  );
});

//WEBHOOK
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
    const statusResponse = await coreApi.transaction.status(transactionId);
    if (notification.status_code !== statusResponse.status_code || 
        notification.gross_amount !== statusResponse.gross_amount) {
      console.warn(`[WARNING] Invalid notification signature for ${transactionId}.`);
      return res.status(403).send('Invalid notification');
    }

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

        let newTicketStatus = 'pending';
        if (transactionStatus == 'settlement' || (transactionStatus == 'capture' && fraudStatus == 'accept')) {
          newTicketStatus = 'paid';
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
          newTicketStatus = 'cancelled';
        }
        
        if (newTicketStatus === 'paid') {
          
          const [payRows] = await pool.query(
            `SELECT p.customer_name, p.customer_email, t.id as ticket_id, 
                    t.ticket_code, t.quantity, t.total_price,
                    e.title as event_title, e.date as event_date, 
                    e.time as event_time, e.location as event_location
             FROM payments p
             JOIN tickets t ON p.ticket_id = t.id
             JOIN events e ON p.event_id = e.id
             WHERE p.transaction_id = ?`, 
             [transactionId]
          );

          if (payRows.length > 0) {
            const data = payRows[0];
            
            eventClient.UpdateTicketStatus(
              { ticketId: data.ticket_id.toString(), status: 'paid' },
              (ticketErr, ticketRes) => {
                if (ticketErr || !ticketRes.success) {
                  console.error('❌ gRPC UpdateTicketStatus Error:', ticketErr || ticketRes.message);
                } else {
                  console.log(`✅ Ticket ${data.ticket_id} status updated to 'paid'`);
                  
                  notificationClient.SendEmailTicket({
                    to_email: data.customer_email,
                    customer_name: data.customer_name,
                    event_title: data.event_title,
                    event_date: data.event_date,
                    event_time: data.event_time,
                    event_location: data.event_location,
                    ticket_code: data.ticket_code,
                    quantity: data.quantity,
                    total_price: data.total_price
                  }, (emailErr, emailRes) => {
                    if (emailErr || !emailRes.success) {
                      console.error('❌ gRPC SendEmailTicket Error:', emailErr || emailRes.message);
                    } else {
                      console.log(`✅ Email notification sent to ${data.customer_email}`);
                    }
                  });
                }
              }
            );
          }
        }
        
        res.status(200).send('OK');
      }
    );
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).send(error.message);
  }
});

//GET PAYMENT HISTORY
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