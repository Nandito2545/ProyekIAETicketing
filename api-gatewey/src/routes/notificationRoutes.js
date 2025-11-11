import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

// Kirim notifikasi (admin)
router.post('/', authMiddleware, notificationController.sendNotification);

// Ambil notifikasi user
router.get('/user/:userId', authMiddleware, notificationController.getNotificationsByUser);

export default router;
