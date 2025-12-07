// index.js (Version Gemini Officielle Stable)

// Importations des dépendances
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Importation des middlewares de sécurité (Assurez-vous que ces fichiers existent)
// Vous devez créer ces fichiers dans le dossier /middleware/
const burstLimit = require('./middleware/burstLimit'); 
const rateLimit = require('./middleware/rateLimit'); 

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================================
// 🚨 INTÉGRATION DES MIDDLEWARES DE SÉCURITÉ (Position Critique)
// ==========================================================
// Ces lignes appliquent la limite de burst et le rate limit
// à TOUTES les requêtes faites à votre API.
app.use(burstLimit); 
app.use(rateLimit); 
// ==========================================================


// 1. Initialiser Gemini avec votre clé API stockée sur Railway
// NOTE: La variable GEMINI_API_KEY doit être définie sur Railway.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Sélectionner le modèle gratuit et rapide (Flash)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/generate-script', async (req, res) => {
    // Note: Les middlewares de sécurité ont déjà été exécutés avant cette ligne.
    const { theme, niche, duration_seconds, tone } = req.body;

    if (!theme || !niche) {
        return res.status(400).json({ error: "Missing parameters: theme and niche required." });
    }

    // 3. Préparer les instructions pour l'IA
    const prompt = `Generate a viral TikTok script. 
    Theme: ${theme}, Niche: ${niche}, Duration: ${duration_seconds}s, Tone: ${tone}.
    Return ONLY a JSON object with keys: title, hook, scene_1, scene_2, scene_3, call_to_action. Do not add markdown formatting.`;

    console.log(`Generating script for: ${theme}`);

    try {
        // 4. Générer le contenu
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Nettoyage du texte pour s'assurer que c'est du JSON pur
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const scriptJson = JSON.parse(text);

        res.status(200).json({ 
            success: true,
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

app.get('/health', (req, res) => {
    // Cette route n'est PAS limitée par les middlewares si elle est avant `app.use(burstLimit)`.
    // Mais ici elle est après, donc elle est sécurisée.
    res.json({ status: 'ok', version: '3.0.0 (Gemini Stable)' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
