const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', ticketController.getAllTickets);
router.get('/user/:userId', authMiddleware, ticketController.getTicketsByUser);

// Admin routes
router.post('/', authMiddleware, ticketController.createTicket);
router.delete('/:id', authMiddleware, ticketController.deleteTicket);

module.exports = router;
