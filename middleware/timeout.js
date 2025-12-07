// middleware/timeout.js
module.exports = (req, res, next) => {
  res.setTimeout(8000, () => { // Timeout après 8 secondes
    return res.status(503).json({ success: false, message: "Request timed out (Service Unavailable)" });
  });
  next();
};
