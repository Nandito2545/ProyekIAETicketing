// api-gatewey/src/controllers/notificationController.js

import { notificationClient } from '../config/grpcClients.js'; // ✅ PERBAIKAN: Gunakan 'import'

// Kirim notifikasi
export const sendNotification = (req, res) => { // ✅ PERBAIKAN: Gunakan 'export const'
  const { userId, title, message } = req.body;
  notificationClient.SendNotification({ userId, title, message }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Ambil notifikasi per user
export const getNotificationsByUser = (req, res) => { // ✅ PERBAIKAN: Gunakan 'export const'
  const { userId } = req.params;
  notificationClient.GetNotificationsByUser({ userId }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// ✅ PERBAIKAN: Ubah 'exports.function' menjadi 'export default'
// (atau ekspor individual seperti di atas)
export default {
  sendNotification,
  getNotificationsByUser
};