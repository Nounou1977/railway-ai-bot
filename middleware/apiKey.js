// middleware/apiKey.js

const FREE_KEYS = new Set([
  "free_123" // remplace par ta clé FREE
]);

const PRO_KEYS = new Set([
  "pro_123" // remplace par ta clé PRO
]);

const usage = new Map();
setInterval(() => usage.clear(), 24 * 60 * 60 * 1000); // reset daily

module.exports = (req, res, next) => {
  const key = req.headers["x-api-key"];

  if (!key) {
    return res.status(401).json({ error: "Missing API Key" });
  }

  if (PRO_KEYS.has(key)) {
    req.userPlan = "PRO";
    return next();
  }

  if (FREE_KEYS.has(key)) {
    req.userPlan = "FREE";
    const count = usage.get(key) || 0;

    if (count >= 100) {
      return res.status(429).json({
        error: "Free limit reached",
        upgrade_url: "https://rapidapi.com/YOU/api/micro-summarizer/pricing"
      });
    }

    usage.set(key, count + 1);
    return next();
  }

  return res.status(401).json({ error: "Invalid API Key" });
};
