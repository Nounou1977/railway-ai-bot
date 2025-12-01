// index.js

import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai'; // Importe la librairie OpenAI

const app = express();
app.use(cors()); // Nécessaire si vous utilisez 'cors'
app.use(express.json());

// 2. Initialiser OpenAI avec la clé secrète
// La clé est automatiquement lue depuis la variable d'environnement OPENAI_API_KEY
const openai = new OpenAI();

// ROUTE PRINCIPALE : utilise l'IA pour générer le script
app.post('/generate-script', async (req, res) => {
    // 4. Récupérer les données du corps de la requête
    const { theme, niche, duration_seconds, tone } = req.body;

    // Validation des données d'entrée
    if (!theme || !niche) {
        return res.status(400).json({ error: "Missing required parameters: theme and niche are required." });
    }

    // 5. Construire le prompt (instructions) pour l'IA
    const prompt = `Generate a unique, viral, high-quality short video script for TikTok.
    Theme: "${theme}"
    Niche: "${niche}"
    Duration: ${duration_seconds} seconds
    Tone: ${tone}
    
    The output must be a clean JSON object containing 'title', 'hook', 'scene_1', 'scene_2', 'scene_3', and 'call_to_action'.`;

    console.log(`Received request: Theme=${theme}, Niche=${niche}`);

    try {
        // 6. Appeler l'API OpenAI
        const completion = await openai.chat.completions.create({
            // *** CORRECTION APPLIQUÉE ICI ***
            model: "gpt-3.5-turbo-1106", // MODÈLE MIS À JOUR QUI SUPPORT LE FORMAT JSON
            // ******************************
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            response_format: { type: "json_object" } // Demander à l'IA de répondre en JSON
        });

        // 7. Extraire et parser la réponse de l'IA
        const scriptContent = completion.choices[0].message.content;
        
        // La réponse est parsée en objet JavaScript
        const scriptJson = JSON.parse(scriptContent); 

        // 8. Renvoyer la réponse à RapidAPI
        res.status(200).json({ 
            success: true,
            script: scriptJson,
            generated_by: "OpenAI GPT-3.5-turbo-1106"
        });

    } catch (error) {
        // En cas d'erreur
        console.error("OpenAI API Error:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to generate script via AI. Please check server logs.",
            details: error.message
        });
    }
});

// Endpoint de santé (inchangé)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'ViralScript AI API',
        version: '2.0.0 (AI Integrated - Model Fixed)'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
