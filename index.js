import express from "express";

const app = express();
app.use(express.json());

let counter = 0;

app.post("/api", (req, res) => {
    counter++;
    const input = req.body?.text || "No text provided";
    const output = `Réponse automatique du bot pour: ${input}`;

    res.json({
        success: true,
        requests_today: counter,
        output: output
    });
});

app.get("/", (req, res) => {
    res.send("Bot AI actif ✔️");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Bot démarré sur le port " + port);
});
