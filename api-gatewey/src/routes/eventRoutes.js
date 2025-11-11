import express from 'express';
import multer from 'multer'; // ✅ 1. Import multer
import path from 'path'; // ✅ 2. Import path
import { eventClient } from '../config/grpcClients.js';

const router = express.Router();

// ✅ 3. Konfigurasi Multer (Penyimpanan File)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder penyimpanan (pastikan folder 'uploads' ada di root api-gateway)
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // Buat nama file unik: 'event-timestamp.extension'
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ✅ 4. BUAT ROUTE BARU KHUSUS UPLOAD
// Frontend akan mengirim file ke sini
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Kembalikan path file yang baru saja di-upload
  res.json({
    success: true,
    message: 'File uploaded successfully',
    // Path akan menjadi 'uploads/nama-file.jpg'
    filePath: `uploads/${req.file.filename}` 
  });
});

// GET ALL EVENTS (Tidak berubah)
router.get('/', (req, res) => {
  // ... (kode
  const { page = 1, limit = 10, category, search } = req.query;
  
  eventClient.GetAllEvents(
    { 
      page: parseInt(page), 
      limit: parseInt(limit),
      category: category || '',
      search: search || ''
    }, 
    (err, response) => {
      if (err) {
        console.error('GetAllEvents error:', err);
        return res.status(500).json({ 
          success: false, 
          message: err.message 
        });
      }
      res.json(response);
    }
  );
});

// GET EVENT BY ID (Tidak berubah)
router.get('/:id', (req, res) => {
  // ... (kode
  const { id } = req.params;
  
  eventClient.GetEvent({ eventId: id }, (err, response) => {
    if (err) {
      console.error('GetEvent error:', err);
      return res.status(500).json({ 
        success: false, 
        message: err.message 
      });
    }
    res.json(response);
  });
});

// ✅ 5. CREATE EVENT (Sedikit berubah)
// Kita tidak lagi meng-upload file di sini. imageUrl dikirim sebagai string.
router.post('/', (req, res) => {
  const { 
    title, 
    description, 
    location, 
    date, 
    time, 
    capacity, 
    price, 
    category, 
    imageUrl // imageUrl sekarang adalah path string dari route /upload
  } = req.body;

  eventClient.CreateEvent(
    { 
      title, 
      description, 
      location, 
      date, 
      time, 
      capacity: parseInt(capacity),
      price: parseFloat(price),
      category,
      imageUrl: imageUrl || '' // Kirim path-nya
    },
    (err, response) => {
      if (err) {
        console.error('CreateEvent error:', err);
        return res.status(500).json({ 
          success: false, 
          message: err.message 
        });
      }
      res.json(response);
    }
  );
});

// ✅ 6. UPDATE EVENT (Sedikit berubah)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    title, 
    description, 
    location, 
    date, 
    time, 
    capacity, 
    price, 
    category, 
    imageUrl 
  } = req.body;

  eventClient.UpdateEvent(
    {
      eventId: id,
      title,
      description,
      location,
      date,
      time,
      capacity: capacity ? parseInt(capacity) : undefined,
      price: price ? parseFloat(price) : undefined,
      category,
      imageUrl
    },
    (err, response) => {
      if (err) {
        console.error('UpdateEvent error:', err);
        return res.status(500).json({ 
          success: false, 
          message: err.message 
        });
      }
      res.json(response);
    }
  );
});

// DELETE EVENT (Tidak berubah)
router.delete('/:id', (req, res) => {
  // ... (kode
  const { id } = req.params;
  
  eventClient.DeleteEvent({ eventId: id }, (err, response) => {
    if (err) {
      console.error('DeleteEvent error:', err);
      return res.status(500).json({ 
        success: false, 
        message: err.message 
      });
    }
    res.json(response);
  });
});

export default router;