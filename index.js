// index.js (Version Gemini Gratuite Finale)

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google-genai'; // NOUVEAU : Importation de la bonne librairie

const app = express();
app.use(cors());
app.use(express.json());

// 2. Initialiser Gemini (utilise la clé GEMINI_API_KEY de Railway)
// Le code sait chercher la variable d'environnement GEMINI_API_KEY
const ai = new GoogleGenAI({}); 

// ROUTE PRINCIPALE : utilise l'IA Gemini pour générer le script
app.post('/generate-script', async (req, res) => {
    const { theme, niche, duration_seconds, tone } = req.body;

    if (!theme || !niche) {
        return res.status(400).json({ error: "Missing required parameters: theme and niche are required." });
    }

    // 5. Construire le prompt pour Gemini (Demande de réponse en JSON)
    const prompt = `Generate a unique, viral, high-quality short video script for TikTok.
    Theme: "${theme}"
    Niche: "${niche}"
    Duration: ${duration_seconds} seconds
    Tone: ${tone}
    
    The output must be a clean JSON object containing 'title', 'hook', 'scene_1', 'scene_2', 'scene_3', and 'call_to_action'. Do not include any text outside the JSON object.`;

    console.log(`Received request: Theme=${theme}, Niche=${niche}`);

    try {
        // 6. Appeler l'API Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Modèle rapide et GRATUIT
            contents: prompt,
            config: {
                 responseMimeType: "application/json", // Demander à Gemini de répondre en JSON
            }
        });

        // 7. Extraire la réponse JSON de Gemini
        const scriptContent = response.text.trim();
        
        // Le contenu JSON est parsé
        const scriptJson = JSON.parse(scriptContent); 

        // 8. Renvoyer la réponse à RapidAPI
        res.status(200).json({ 
            success: true,
            script: scriptJson,
            generated_by: "Google Gemini 2.5 Flash (Free Tier)"
        });

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to generate script via AI. Please check server logs.",
            details: error.message
        });
    }
});

// Endpoint de santé
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'ViralScript AI API',
        version: '3.0.0 (Gemini Free Tier)'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
