const { notificationClient } = require('../config/grpcClients');

// Kirim notifikasi
exports.sendNotification = (req, res) => {
  const { userId, title, message } = req.body;
  notificationClient.SendNotification({ userId, title, message }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Ambil notifikasi per user
exports.getNotificationsByUser = (req, res) => {
  const { userId } = req.params;
  notificationClient.GetNotificationsByUser({ userId }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};
