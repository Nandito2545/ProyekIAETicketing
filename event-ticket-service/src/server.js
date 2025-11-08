// FILE: src/server.js
// Main gRPC Server untuk Event-Ticket Service

// 1. Load environment variables
require('dotenv').config();

// 2. Import dependencies
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// 3. Import modules
const connectDB = require('./db');
const eventController = require('./controllers/eventController');
const ticketController = require('./controllers/ticketController');

// ==========================================
// LOAD PROTO FILE
// ==========================================
const PROTO_PATH = path.join(__dirname, 'proto', 'event.proto');

console.log('📁 Loading proto file from:', PROTO_PATH);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,        // Pertahankan case field name
  longs: String,         // Convert long numbers to string
  enums: String,         // Convert enums to string
  defaults: true,        // Set default values
  oneofs: true           // Support oneof fields
});

// Load proto ke gRPC
const eventProto = grpc.loadPackageDefinition(packageDefinition).event;

console.log('✅ Proto file loaded successfully');

// ==========================================
// CREATE gRPC SERVER
// ==========================================
const server = new grpc.Server();

console.log('🚀 Creating gRPC server...');

// ==========================================
// ADD SERVICE IMPLEMENTATION
// ==========================================
server.addService(eventProto.EventService.service, {
  // Event Methods
  CreateEvent: eventController.createEvent.bind(eventController),
  GetEvent: eventController.getEvent.bind(eventController),
  GetAllEvents: eventController.getAllEvents.bind(eventController),
  UpdateEvent: eventController.updateEvent.bind(eventController),
  DeleteEvent: eventController.deleteEvent.bind(eventController),
  
  // Ticket Methods
  CreateTicket: ticketController.createTicket.bind(ticketController),
  GetTicket: ticketController.getTicket.bind(ticketController),
  GetTicketsByUser: ticketController.getTicketsByUser.bind(ticketController),
  GetTicketsByEvent: ticketController.getTicketsByEvent.bind(ticketController),
  UpdateTicketStatus: ticketController.updateTicketStatus.bind(ticketController),
  ValidateTicket: ticketController.validateTicket.bind(ticketController)
});

console.log('✅ Service implementation added');

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 50052;

const startServer = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // 1. Connect to MongoDB
    await connectDB();
    
    console.log('🚀 Starting gRPC server...');
    
    // 2. Start gRPC server
    server.bindAsync(
      `0.0.0.0:${PORT}`,
      grpc.ServerCredentials.createInsecure(), // Tanpa SSL (development)
      (error, port) => {
        if (error) {
          console.error('❌ Failed to start server:', error);
          process.exit(1);
        }
        
        console.log('');
        console.log('═══════════════════════════════════════════');
        console.log('✅ Event-Ticket Service is running!');
        console.log('📡 gRPC Server listening on port:', port);
        console.log('🗄️  Database: Connected');
        console.log('⏰ Started at:', new Date().toLocaleString());
        console.log('═══════════════════════════════════════════');
        console.log('');
        console.log('Available Services:');
        console.log('  - CreateEvent');
        console.log('  - GetEvent');
        console.log('  - GetAllEvents');
        console.log('  - UpdateEvent');
        console.log('  - DeleteEvent');
        console.log('  - CreateTicket');
        console.log('  - GetTicket');
        console.log('  - GetTicketsByUser');
        console.log('  - GetTicketsByEvent');
        console.log('  - UpdateTicketStatus');
        console.log('  - ValidateTicket');
        console.log('═══════════════════════════════════════════');
      }
    );
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.tryShutdown(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.tryShutdown(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// ==========================================
// START APPLICATION
// ==========================================
startServer();