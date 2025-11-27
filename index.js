import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ROUTE CORRECTEE : accepte les 4 paramètres de RapidAPI
app.post('/generate-script', async (req, res) => {
  const { theme, niche, duration_seconds, tone } = req.body;
  
  // Validation selon les paramètres RapidAPI
  if (!theme || !niche || !duration_seconds || !tone) {
    return res.status(400).json({ 
      success: false, 
      error: "Paramètres manquants: theme, niche, duration_seconds, tone requis" 
    });
  }

  // Génération de script basée sur les nouveaux paramètres
  const hook = `[HOOK 3s] ${theme}`;
  const problem = `[PROBLEM 3s] Le problème dans ${niche}`;
  const solution = `[SOLUTION 3s] J'ai testé une solution ${tone}`;
  const cta = `[CTA 3s] Link en bio`;
  
  const script = `${hook}\n${problem}\n${solution}\n${cta}`;
  
  res.json({
    success: true,
    theme: theme,
    niche: niche,
    duration_seconds: duration_seconds,
    tone: tone,
    script: script,
    word_count: script.split(' ').length,
    estimated_duration: Math.ceil(script.split(' ').length / 2.5) + " secondes",
    generated_at: new Date().toISOString()
  });
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ViralScript AI API',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
