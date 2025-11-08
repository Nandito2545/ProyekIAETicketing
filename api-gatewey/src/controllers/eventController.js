const { eventClient } = require('../config/grpcClients');

// Ambil semua event
exports.getAllEvents = (req, res) => {
  eventClient.GetAllEvents({}, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Ambil detail event
exports.getEventById = (req, res) => {
  const { id } = req.params;
  eventClient.GetEvent({ id }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Buat event baru
exports.createEvent = (req, res) => {
  const { name, date, location, description } = req.body;
  eventClient.CreateEvent({ name, date, location, description }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Update event
exports.updateEvent = (req, res) => {
  const { id } = req.params;
  const { name, date, location, description } = req.body;
  eventClient.UpdateEvent({ id, name, date, location, description }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};

// Hapus event
exports.deleteEvent = (req, res) => {
  const { id } = req.params;
  eventClient.DeleteEvent({ id }, (err, response) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(response);
  });
};
