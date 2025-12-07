// middleware/validateInput.js
module.exports = (req, res, next) => {
  const { theme, niche, duration_seconds } = req.body;

  if (!theme || typeof theme !== "string" || !niche || typeof niche !== "string") {
    return res.status(400).json({ 
        success: false, 
        message: "Missing required parameters: 'theme' and 'niche' must be non-empty strings." 
    });
  }

  if (theme.length + niche.length > 200) { 
    return res.status(413).json({ 
        success: false, 
        message: "Input parameters too long. Combined theme/niche must be under 200 characters to ensure cost control." 
    });
  }

  next();
};
