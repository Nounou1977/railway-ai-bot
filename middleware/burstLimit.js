// middleware/burstLimit.js
const rateLimit = require("express-rate-limit");

const burstLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max par IP par 15 minutes
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    success: false,
    message: "Burst limit exceeded: Too many requests in a short time. Please slow down.",
  },
  statusCode: 429,
});

module.exports = burstLimit;
