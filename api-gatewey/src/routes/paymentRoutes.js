const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Payment routes (hanya user login)
router.post('/', authMiddleware, paymentController.processPayment);
router.get('/:paymentId', authMiddleware, paymentController.getPaymentStatus);

module.exports = router;
