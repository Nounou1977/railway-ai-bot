import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/generate-script', async (req, res) => {
    const { theme, niche, duration_seconds, tone } = req.body;
    if (!theme || !niche) return res.status(400).json({ error: "Missing parameters" });
    
    const prompt = `Generate a viral TikTok script. Theme: ${theme}, Niche: ${niche}, Duration: ${duration_seconds}s, Tone: ${tone}. Return ONLY a JSON object with keys: title, hook, scene_1, scene_2, scene_3, call_to_action. Do not add markdown formatting.`;
    
    try {
        const response = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: prompt });
        let text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json({ success: true, script: JSON.parse(text), generated_by: "Gemini Flash" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error", details: error.message });
    }
});

app.get('/health', (req, res) => res.json({ status: 'ok', version: '3.0.0' }));
app.listen(process.env.PORT || 3000, () => console.log('🚀 Server ready'));
