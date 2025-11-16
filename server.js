const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Middlewares sécurité
const timeout = require("./middleware/timeout");
const apiKey = require("./middleware/apiKey");
const burstLimit = require("./middleware/burstLimit");
const rateLimit = require("./middleware/rateLimit");
const validateInput = require("./middleware/validateInput");

app.use(bodyParser.json());

// Ordre important !
app.use(timeout);       // 1️⃣ Timeout 8 sec
app.use(apiKey);        // 2️⃣ Vérification clé FREE / PRO
app.use(burstLimit);    // 3️⃣ Anti-burst
app.use(rateLimit);     // 4️⃣ Rate-limit journalier

// Endpoint principal
app.post("/api", validateInput, async (req, res) => {
  const text = req.body.text;

  // Simule la réponse AI (à remplacer par ton modèle)
  const output = `Réponse automatique du bot pour: ${text}`;

  res.json({
    success: true,
    plan: req.userPlan,
    output
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AI Bot online" });
});

// Lancer serveur
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
