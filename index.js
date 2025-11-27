import express from 'express';
import cors from 'cors'; // À installer si pas présent

const app = express();
app.use(cors()); // ESSENTIEL pour RapidAPI
app.use(express.json());

// CHANGEMENT : J'ai retiré /api pour matcher RapidAPI
app.post('/generate-script', async (req, res) => {
  const { theme, niche, duration_seconds, tone } = req.body;
  
  // Validation selon vos paramètres RapidAPI
  if (!theme || !niche || !duration_seconds || !tone) {
    return res.status(400).json({ 
      success: false, 
      error: "Paramètres manquants: theme, niche, duration_seconds, tone requis" 
    });
  }

  // VOTRE LOGIQUE de génération
  const hook = `[HOOK 3s] T'as déjà vu ${theme} ?`;
  const problem = `[PROBLEM 3s] Mais c'est trop cher / compliqué`;
  const solution = `[SOLUTION 3s] J'ai testé une solution ${tone}`;
  const cta = `[CTA 3s] Link en bio avant rupture`;
  
  const script = `${hook}\n${problem}\n${solution}\n${cta}`;
  
  res.json({
    success: true,
    theme: theme,
    niche: niche,
    script: script,
    duration_seconds: duration_seconds,
    tone: tone,
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
