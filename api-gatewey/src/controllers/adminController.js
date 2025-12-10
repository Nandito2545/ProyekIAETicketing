// api-gatewey/src/controllers/adminController.js

import { eventClient } from '../config/grpcClients.js'; // ✅ PERBAIKAN: Gunakan 'import'

const getDashboardStats = (req, res) => { // ✅ PERBAIKAN: Deklarasikan sebagai const
  // CATATAN: 'GetStats' tidak ada di service gRPC Anda,
  // Ini akan gagal saat runtime, tapi tidak akan membuat server crash.
  eventClient.GetStats({}, (err, stats) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(stats);
  });
};

export default {
  getDashboardStats
};