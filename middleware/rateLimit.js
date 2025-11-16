// middleware/rateLimit.js
const clients = new Map();
setInterval(() => clients.clear(), 24 * 60 * 60 * 1000); // reset daily

module.exports = (req, res, next) => {
  const key = `${req.ip}:${new Date().toISOString().slice(0, 10)}`;
  const hits = clients.get(key) || 0;

  if (hits >= 100) {
    return res.status(429).json({
      error: "Free limit reached",
      upgrade_url: "https://rapidapi.com/YOU/api/micro-summarizer/pricing"
    });
  }

  clients.set(key, hits + 1);
  next();
};
