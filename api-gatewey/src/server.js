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
const __dirname = path.dirname(__filename); // Mengarah ke folder 'src'

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// ✅ PERBAIKAN PENTING: NAIKKAN LIMIT JSON
// Default limit express sangat kecil. Wajib dinaikkan (misal 10mb atau 50mb)
// agar bisa menerima string Base64 gambar profil.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ DEFINISI FOLDER UPLOADS
// Mundur satu folder dari 'src' ke root 'api-gatewey', lalu masuk 'uploads'
const uploadsPath = path.join(__dirname, '../uploads');

// Log untuk memastikan path benar (membantu debugging)
console.log('------------------------------------------------');
console.log(`📂 Folder Uploads terdeteksi di: ${uploadsPath}`);
console.log('------------------------------------------------');

// Buka akses folder tersebut ke publik agar gambar bisa diakses frontend
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});