// middleware/burstLimit.js

const rateLimit = require("express-rate-limit");

// Configuration du Burst Limit (Anti-spam / Anti-DDOS)
const burstLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // Durée de la fenêtre (15 minutes est plus sûr)
  max: 100, // 100 requêtes max par IP par fenêtre de 15 minutes
  standardHeaders: true, 
  legacyHeaders: false, 
  // Ce message sera envoyé si la limite est dépassée
  message: {
    success: false,
    message: "Burst limit exceeded: Too many requests in a short time. Please slow down.",
  },
  statusCode: 429, // Code standard d'erreur "Trop de requêtes"
});

module.exports = burstLimit;
