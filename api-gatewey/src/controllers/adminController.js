const { userClient, eventClient, ticketClient } = require('../config/grpcClients');

exports.getDashboardStats = (req, res) => {
  eventClient.GetStats({}, (err, stats) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(stats);
  });
};
