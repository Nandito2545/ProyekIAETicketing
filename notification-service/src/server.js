require('dotenv').config();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');

// Load Proto
const PROTO_PATH = path.join(__dirname, '../proto/notification.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const notificationProto = grpc.loadPackageDefinition(packageDef).notification;

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  requireTLS: true,
});

// Service Implementation
const notificationService = {
  
  async SendEmailTicket(call, callback) {
    const req = call.request;
    console.log(`📧 Attempting to send email to: ${req.to_email}`);
    
    try {
      const qrDataURL = await qrcode.toDataURL(req.ticket_code);
      const qrAttachmentCid = 'qrcode@ticket.id';

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Thank You for Your Purchase, ${req.customer_name}!</h2>
          <p>Your ticket for <strong>${req.event_title}</strong> is confirmed.</p>
          
          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Ticket Details</h3>
          <ul>
            <li><strong>Event:</strong> ${req.event_title}</li>
            <li><strong>Date:</strong> ${req.event_date} at ${req.event_time}</li>
            <li><strong>Location:</strong> ${req.event_location}</li>
            <li><strong>Quantity:</strong> ${req.quantity}</li>
            <li><strong>Total Price:</strong> Rp ${req.total_price.toLocaleString('id-ID')}</li>
            <li><strong>Ticket Code:</strong> ${req.ticket_code}</li>
          </ul>

          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Your QR Code</h3>
          <p>Please present this QR code at the event entrance:</p>
          <img src="cid:${qrAttachmentCid}" alt="Your Ticket QR Code" style="width: 200px; height: 200px;" />
          
          <br/>
          <p>See you at the event!</p>
          <p><strong>TICKET.ID Team</strong></p>
        </div>
      `;

      const info = await transporter.sendMail({
        from: `"TICKET.ID" <${process.env.EMAIL_FROM}>`, 
        to: req.to_email, 
        subject: `Your Ticket for ${req.event_title} is Here!`,
        html: emailHtml,
        attachments: [
          {
            filename: 'qrcode.png',
            path: qrDataURL,
            cid: qrAttachmentCid
          }
        ]
      });
      
      console.log(`✅ Email sent successfully: ${info.messageId}`);
      callback(null, {
        success: true,
        message: 'Email sent successfully'
      });

    } catch (error) {
      console.error('SendEmailTicket error:', error);
      callback(null, {
        success: false,
        message: error.message
      });
    }
  }
};

// Create and start server
const server = new grpc.Server();
server.addService(notificationProto.NotificationService.service, notificationService);
const PORT = process.env.PORT || 50054;

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
    console.log('✅ Notification Service (SendGrid) is running!');
    console.log('📡 gRPC Server listening on port:', port);
    console.log(`📧 Sending emails from: ${process.env.EMAIL_FROM}`);
    console.log('⏰ Started at:', new Date().toLocaleString());
    console.log('═══════════════════════════════════════════');
  }
);