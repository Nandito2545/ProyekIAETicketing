const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Kirim notifikasi (admin)
router.post('/', authMiddleware, notificationController.sendNotification);

// Ambil notifikasi user
router.get('/user/:userId', authMiddleware, notificationController.getNotificationsByUser);

module.exports = router;
