const { ticketClient } = require('../config/grpcClients');

// Ambil semua tiket
exports.getAllTickets = (req, res) => {
  ticketClient.GetAllTickets({}, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Ambil tiket per user
exports.getTicketsByUser = (req, res) => {
  const { userId } = req.params;
  ticketClient.GetTicketsByUser({ userId }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Buat tiket baru
exports.createTicket = (req, res) => {
  const { eventId, userId, quantity } = req.body;
  ticketClient.CreateTicket({ eventId, userId, quantity }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Hapus tiket
exports.deleteTicket = (req, res) => {
  const { id } = req.params;
  ticketClient.DeleteTicket({ id }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};
