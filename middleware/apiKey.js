// middleware/apiKey.js
const FREE_KEYS = new Set([
  // REMPLACEZ PAR LES CLÉS FREE DE VOTRE PLAN RAPIDAPI (ou clés de test)
  "cle_test_free_1", 
  "cle_test_free_2" 
]);

const PRO_KEYS = new Set([
  // REMPLACEZ PAR LES CLÉS PRO DE VOTRE PLAN RAPIDAPI
  "cle_test_pro_1", 
  "cle_test_pro_2" 
]);

const usage = new Map();
// Remise à zéro quotidienne du compteur (24h)
setInterval(() => usage.clear(), 24 * 60 * 60 * 1000); 

module.exports = (req, res, next) => {
  const key = req.headers["x-rapidapi-key"] || req.headers["x-api-key"]; 

  if (!key) {
    return res.status(401).json({ success: false, message: "Missing API Key" });
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
        success: false,
        message: "Free Tier limit reached. Please upgrade your plan.",
        upgrade_url: "https://rapidapi.com/VOTRE_NOM/api/VOTRE_API/pricing"
      });
    }

    usage.set(key, count + 1);
    return next();
  }

  return res.status(401).json({ success: false, message: "Invalid API Key" });
};
