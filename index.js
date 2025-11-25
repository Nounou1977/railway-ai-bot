import express from 'express';

const app = express();
app.use(express.json());

// TON ENDPOINT QUI GÉNÈRE DES SCRIPTS VIRALS
app.post('/api/generate-script', async (req, res) => {
  const { topic, niche = "general" } = req.body;
  
  if (!topic || topic.length < 3) {
    return res.status(400).json({ 
      success: false, 
      error: "❌ Topic manquant ou trop court (min 3 caracteres)" 
    });
  }

  // Génération de script basée sur le topic
  const hook = `[HOOK 3s] T'as déjà vu ${topic} ?`;
  const problem = `[PROBLEM 3s] Mais c'est trop cher / compliqué`;
  const solution = `[SOLUTION 3s] J'ai testé une alternative`;
  const cta = `[CTA 3s] Link en bio avant rupture`;
  
  const script = `${hook}\n${problem}\n${solution}\n${cta}`;
  
  res.json({
    success: true,
    topic: topic,
    script: script,
    word_count: script.split(' ').length,
    estimated_duration: Math.ceil(script.split(' ').length / 2.5) + " secondes",
    generated_at: new Date().toISOString()
  });
});

// Endpoint de santé (pour RapidAPI)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ViralScript AI API',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
