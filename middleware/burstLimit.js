// middleware/burstLimit.js
const burstMap = new Map();

module.exports = (req, res, next) => {
  const now = Date.now();
  const windowMs = 5000; // 5 secondes
  const limit = 10;

  const ip = req.ip;
  const hits = burstMap.get(ip) || [];

  // garde uniquement les requêtes récentes
  const recentHits = hits.filter(ts => now - ts < windowMs);

  if (recentHits.length >= limit) {
    return res.status(429).json({
      error: "Too many requests — slow down"
    });
  }

  recentHits.push(now);
  burstMap.set(ip, recentHits);

  next();
};
