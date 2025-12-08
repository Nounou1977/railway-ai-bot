// index.cjs (VERSION FINALE ET PRÊTE POUR LA MONÉTISATION)

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

// 🟢 FIX 1 : Ajout de la confiance au proxy pour corriger l'avertissement 'X-Forwarded-For'
app.set('trust proxy', 1); 

// ==========================================================
// 🚨 Middlewares APPLIQUÉS GLOBALEMENT
// ==========================================================
app.use(timeout); // Coupe les requêtes trop longues
// ==========================================================

// 3. Initialiser Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// 🔴 FIX ULTIME : Changement du modèle de "gemini-1.0-pro" à "gemini-pro" pour résoudre le 404 de la clé API
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 


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
                generated_by: "Google Gemini Pro" // Mise à jour de la version pour le nom générique
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

// 💚 Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', version: '3.0.4 (Final Code - Pro)' }); // Mise à jour de la version pour tracer le changement
});

// Lancer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
// Tentative finale de déploiement du code v3.0.4
