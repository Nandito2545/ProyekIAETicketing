const { userClient } = require('../config/grpcClients');

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  userClient.Register({ name, email, password }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  userClient.Login({ email, password }, (err, response) => {
    if (err) return res.status(401).json({ message: err.message });
    res.json(response);
  });
};
