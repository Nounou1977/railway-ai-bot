// index.cjs (VERSION FINALE, CommonJS, pour Railway)

// 1. Importations des dépendances (Syntaxe CommonJS via require)
const express = require('express');
const bodyParser = require("body-parser"); 
const cors = require('cors');
// Utilisation du bon nom de classe et de package pour l'initialisation
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 2. Importation des middlewares de sécurité et de monétisation
// Assurez-vous que ces fichiers se trouvent dans le dossier ./middleware/
const timeout = require("./middleware/timeout");
const apiKey = require("./middleware/apiKey");
const burstLimit = require('./middleware/burstLimit'); 
const validateInput = require('./middleware/validateInput'); 

const app = express();
app.use(cors());
// body-parser est utilisé pour la gestion du JSON
app.use(bodyParser.json());

// ==========================================================
// 🚨 ORDRE DES MIDDLEWARES (Optimal pour RapidAPI)
// ==========================================================
app.use(timeout);         // 1. Coupe les requêtes trop longues
app.use(apiKey);          // 2. Authentifie la clé et gère le quota
app.use(burstLimit);      // 3. Limite les pics de requêtes
// ==========================================================

// 3. Initialiser Gemini (utilise la clé de process.env.GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


app.post('/generate-script', validateInput, async (req, res) => {
    // Les variables sont garanties d'exister par le validateInput
    const { theme, niche, duration_seconds, tone } = req.body;
    
    // La variable 'plan' vient du middleware apiKey
    const userPlan = req.userPlan || 'FREE'; 

    // Préparer les instructions pour l'IA
    const prompt = `Generate a viral TikTok script. 
    Theme: ${theme}, Niche: ${niche}, Duration: ${duration_seconds}s, Tone: ${tone}.
    Return ONLY a JSON object with keys: title, hook, scene_1, scene_2, scene_3, call_to_action. Do not add markdown formatting.`;

    console.log(`Generating script for: ${theme} (Plan: ${userPlan})`);

    try {
        // Correction de la méthode d'appel pour le SDK Node.js
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
});

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', version: '3.0.0 (Gemini Stable)' });
});

// Lancer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
