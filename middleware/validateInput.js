// middleware/validateInput.js
module.exports = (req, res, next) => {
  const text = req.body?.text;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  if (text.length > 300) {
    return res.status(413).json({ error: "Text too long (max 300 chars)" });
  }

  next();
};
