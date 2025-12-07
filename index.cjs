// index.cjs (VERSION FINALE POUR RAILWAY/RAPIDAPI)

// Importations des dépendances (Syntaxe CommonJS via require)
const express = require('express');
const bodyParser = require("body-parser"); 
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Importation des middlewares de sécurité et de monétisation
// Assurez-vous que ces fichiers se trouvent dans le dossier ./middleware/
const timeout = require("./middleware/timeout");
const apiKey = require("./middleware/apiKey");
const burstLimit = require('./middleware/burstLimit'); 
const validateInput = require('./middleware/validateInput'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ==========================================================
// 🚨 ORDRE DES MIDDLEWARES (Sécurité et Monétisation)
// ==========================================================
app.use(timeout);         // 1. Coupe les requêtes trop longues
app.use(apiKey);          // 2. Authentifie la clé et gère le quota FREE/PRO
app.use(burstLimit);      // 3. Limite les pics de requêtes (Anti-DDOS)
// ==========================================================

// 1. Initialiser Gemini
// La clé est lue depuis les variables d'environnement de Railway (GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


app.post('/generate-script', validateInput, async (req, res) => {
    // Les variables sont garanties d'exister par le validateInput
    const { theme, niche, duration_seconds, tone } = req.body;
    
    // La variable 'plan' est attachée par le middleware apiKey
    const userPlan = req.userPlan || 'FREE'; 

    // 3. Préparer les instructions pour l'IA
    const prompt = `Generate a viral TikTok script. 
    Theme: ${theme}, Niche: ${niche}, Duration: ${duration_seconds}s, Tone: ${tone}.
    Return ONLY a JSON object with keys: title, hook, scene_1, scene_2, scene_3, call_to_action. Do not add markdown formatting.`;

    console.log(`Generating script for: ${theme} (Plan: ${userPlan})`);

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

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

// Health check (Vérification de l'état)
app.get('/', (req, res) => {
    res.json({ status: 'ok', version: '3.0.0 (Gemini Stable)' });
});

// Lancer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
