const { paymentClient } = require('../config/grpcClients');

// Proses pembayaran
exports.processPayment = (req, res) => {
  const { userId, ticketId, amount, method } = req.body;
  paymentClient.ProcessPayment({ userId, ticketId, amount, method }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Ambil status pembayaran
exports.getPaymentStatus = (req, res) => {
  const { paymentId } = req.params;
  paymentClient.GetPaymentStatus({ paymentId }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};
