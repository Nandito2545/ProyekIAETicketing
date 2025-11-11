import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

router.get('/dashboard', authMiddleware, adminController.getDashboardStats);

export default router;
