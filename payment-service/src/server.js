require('dotenv').config();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const midtransClient = require('midtrans-client');

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticket-konser',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Payment Service connected to MySQL database');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    process.exit(1);
  }
})();

// Inisialisasi Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// Load Proto
const PROTO_PATH = path.join(__dirname, 'proto', 'payment.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const paymentProto = grpc.loadPackageDefinition(packageDef).payment;

// Helper untuk format data SQL ke gRPC
const formatPaymentRow = (row) => ({
  id: row.id.toString(),
  transaction_id: row.transaction_id,
  amount: parseFloat(row.amount),
  payment_method: row.payment_method,
  status: row.status,
  event_title: row.event_title || '',
  payment_date: row.payment_date ? new Date(row.payment_date).toISOString() : '',
  user_id: row.user_id ? row.user_id.toString() : '',
  customer_name: row.customer_name || '',
  customer_email: row.customer_email || '',
  customer_phone: row.customer_phone || ''
});

// gRPC Service Implementation
const paymentService = {
  
  async ProcessPayment(call, callback) {
    const connection = await pool.getConnection();
    try {
      const { 
        user_id, event_id, amount, method, ticket_id, 
        customer_name, customer_email, customer_phone 
      } = call.request;

      console.log(`💳 Initiating payment for ticket ${ticket_id}, amount ${amount}`);

      const transaction_id = `TXN-${ticket_id}-${Date.now()}`;

      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO payments 
        (transaction_id, ticket_id, user_id, event_id, amount, payment_method, 
         customer_name, customer_email, customer_phone, 
         status, payment_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          transaction_id, ticket_id, user_id, event_id, amount, method,
          customer_name, customer_email, customer_phone
        ]
      );
      await connection.commit();

      const parameter = {
        transaction_details: {
          order_id: transaction_id,
          gross_amount: amount,
        },
        customer_details: {
          user_id: user_id,
          first_name: customer_name,
          email: customer_email,
          phone: customer_phone
        },
      };

      const transaction = await snap.createTransaction(parameter);
      const transactionToken = transaction.token;

      console.log(`✅ Midtrans token created: ${transactionToken}`);

      callback(null, {
        success: true,
        transaction_token: transactionToken,
        transaction_id: transaction_id,
        message: 'Payment token created successfully.'
      });

    } catch (error) {
      await connection.rollback();
      console.error('❌ ProcessPayment error:', error);
      callback(null, { success: false, transaction_token: '', message: error.message });
    } finally {
      connection.release();
    }
  },

  async HandlePaymentNotification(call, callback) {
    const { transaction_id, transaction_status, fraud_status, payment_type } = call.request;
    console.log(`🔔 Webhook received for ${transaction_id}, status: ${transaction_status}`);
    try {
      let paymentStatus = 'pending';
      if (transaction_status == 'capture') {
        if (fraud_status == 'accept') paymentStatus = 'success';
      } else if (transaction_status == 'settlement') {
        paymentStatus = 'success';
      } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
        paymentStatus = 'failed';
      }
      const [result] = await pool.query(
        'UPDATE payments SET status = ?, payment_method = ? WHERE transaction_id = ?',
        [paymentStatus, payment_type, transaction_id]
      );
      if (result.affectedRows === 0) throw new Error('Payment record not found.');
      console.log(`✅ Payment status updated to '${paymentStatus}' for ${transaction_id}`);
      callback(null, { success: true, message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('❌ HandlePaymentNotification error:', error);
      callback(null, { success: false, message: error.message });
    }
  },

  async GetPaymentHistory(call, callback) {
    try {
      const { user_id } = call.request;
      const query = `
        SELECT p.*, e.title as event_title 
        FROM payments p 
        LEFT JOIN events e ON p.event_id = e.id 
        WHERE p.user_id = ? 
        ORDER BY p.created_at DESC
      `;
      const [rows] = await pool.query(query, [user_id]);
      callback(null, { payments: rows.map(formatPaymentRow) });
    } catch (error) {
      console.error('GetPaymentHistory error:', error);
      callback(null, { payments: [] });
    }
  },

  async GetAllPayments(call, callback) {
    try {
      const query = `
        SELECT p.*, e.title as event_title 
        FROM payments p 
        LEFT JOIN events e ON p.event_id = e.id 
        ORDER BY p.created_at DESC
      `;
      const [rows] = await pool.query(query);
      callback(null, { payments: rows.map(formatPaymentRow) });
    } catch (error) {
      console.error('GetAllPayments error:', error);
      callback(null, { payments: [] });
    }
  }
};

// Create and start server
const server = new grpc.Server();
server.addService(paymentProto.PaymentService.service, paymentService);
const PORT = process.env.PAYMENT_SERVICE_PORT || 50053;

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Payment Service (with Midtrans) is running!');
    console.log('📡 gRPC Server listening on port:', port);
    console.log('⏰ Started at:', new Date().toLocaleString());
    console.log('═══════════════════════════════════════════');
  }
);