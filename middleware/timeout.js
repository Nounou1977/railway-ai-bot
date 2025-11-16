// middleware/timeout.js
module.exports = (req, res, next) => {
  res.setTimeout(8000, () => {
    return res.status(503).json({ error: "Request timed out" });
  });
  next();
};
