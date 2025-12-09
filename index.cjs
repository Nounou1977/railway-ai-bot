// index.cjs (VERSION VERCEL - GRATUITE & STABLE)

const express = require('express');
const bodyParser = require("body-parser"); 
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const timeout = require("./middleware/timeout");
const apiKey = require("./middleware/apiKey");
const burstLimit = require('./middleware/burstLimit');
const validateInput = require("./middleware/validateInput");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.set('trust proxy', 1); 

// Middlewares
app.use(timeout);

// 3. Initialiser Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ MODÈLE DISPONIBLE DANS VOTRE COMPTE (21 600 req/jour)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

// 🔑 ROUTE PRINCIPALE
app.post(
    '/generate-script',
    apiKey,
    burstLimit,
    validateInput,
    async (req, res) => {
        const { theme, niche, duration_seconds, tone } = req.body;
        const userPlan = req.userPlan || 'FREE';

        const prompt = `Generate a viral TikTok script. 
        Theme: ${theme}, Niche: ${niche}, Duration: ${duration_seconds}s, Tone: ${tone}.
        Return ONLY a JSON object with keys: title, hook, scene_1, scene_2, scene_3, call_to_action. Do not add markdown formatting.`;

        console.log(`Generating script for: ${theme} (Plan: ${userPlan})`);

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const scriptJson = JSON.parse(text);

            res.status(200).json({ 
                success: true,
                plan: userPlan,
                script: scriptJson,
                generated_by: "Google Gemini 2.0 Flash 001"
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
  res.json({ success: true, version: "3.0.9 (Vercel + Model Fix)" });
});

// ✅ EXPORT POUR VERCEL (SUPPRIME app.listen)
module.exports = app;
