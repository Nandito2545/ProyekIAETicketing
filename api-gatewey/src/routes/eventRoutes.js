import express from 'express';
import multer from 'multer';
import path from 'path';
import { eventClient } from '../config/grpcClients.js';

const router = express.Router();

//Konfigurasi Multer (Penyimpanan File)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

//ROUTE BARU KHUSUS UPLOAD
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    message: 'File uploaded successfully',
    filePath: `uploads/${req.file.filename}` 
  });
});

// GET ALL EVENTS
router.get('/', (req, res) => {
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

// GET EVENT BY ID
router.get('/:id', (req, res) => {
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

//CREATE EVENT
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
    imageUrl 
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

//UPDATE EVENT
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

//DELETE EVENT
router.delete('/:id', (req, res) => {
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