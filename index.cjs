// index.cjs (VERSION FINALE ET SÉCURISÉE)

const express = require('express');
const bodyParser = require("body-parser"); 
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Importation des middlewares (les fichiers sont corrects)
const timeout = require("./middleware/timeout");
const apiKey = require("./middleware/apiKey");
const burstLimit = require('./middleware/burstLimit');
const validateInput = require("./middleware/validateInput");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ==========================================================
// 🚨 Middlewares APPLIQUÉS GLOBALEMENT
// ==========================================================
app.use(timeout); // Coupe les requêtes trop longues
// ==========================================================

// 3. Initialiser Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// 🔑 CORRECTION CLÉ ICI : Utilisation du nom du modèle stable pour le SDK
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// 🔑 ROUTE PRINCIPALE SÉCURISÉE AVEC MIDDLEWARES
app.post(
    '/generate-script',
    apiKey,           // 1. Authentification de la clé RapidAPI
    burstLimit,       // 2. Limite des pics de requêtes
    validateInput,    // 3. Validation des paramètres d'entrée
    async (req, res) => {
        // ... (votre logique de code ici)
        const { theme, niche, duration_seconds, tone } = req.body;
        const userPlan = req.userPlan || 'FREE';

        const prompt = `Generate a viral TikTok script. 
        Theme: ${theme}, Niche: ${niche}, Duration: ${duration_seconds}s, Tone: ${tone}.
        Return ONLY a JSON object with keys: title, hook, scene_1, scene_2, scene_3, call_to_action. Do not add markdown formatting.`;

        console.log(`Generating script for: ${theme} (Plan: ${userPlan})`);

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text;

            // Nettoyage du texte pour s'assurer que c'est du JSON pur
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const scriptJson = JSON.parse(text);

            res.status(200).json({ 
                success: true,
                plan: userPlan,
                script: scriptJson,
                generated_by: "Google Gemini 1.5 Flash"
            });

        } catch (error) {
            console.error("Gemini Error:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error generating script", 
                details: error.message 
            });
        }
    }
);

// 💚 Health check (Accessible SANS middleware de clé API)
app.get('/', (req, res) => {
    res.json({ status: 'ok', version: '3.0.2 (Gemini Fixed)' }); // Mise à jour de la version
});

// Lancer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
