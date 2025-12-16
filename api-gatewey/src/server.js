import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

dotenv.config();

// Setup Path untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Ini mengarah ke folder 'src'

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ PERBAIKAN UTAMA: DEFINISI FOLDER UPLOADS
// __dirname adalah '.../api-gatewey/src'
// Kita harus mundur ke '.../api-gatewey/uploads'
const uploadsPath = path.join(__dirname, '../uploads');

// Log untuk memastikan path-nya benar di terminal
console.log('------------------------------------------------');
console.log(`📂 Folder Uploads terdeteksi di: ${uploadsPath}`);
console.log('------------------------------------------------');

// Buka akses folder tersebut ke publik
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});