const { userClient } = require('../config/grpcClients');

exports.register = (req, res) => {
  const { name, email, password, phone } = req.body;

  userClient.Register({ name, email, password, phone }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  userClient.Login({ username, password }, (err, response) => {
    if (err) return res.status(401).json({ message: err.message });
    res.json(response);
  });
};
