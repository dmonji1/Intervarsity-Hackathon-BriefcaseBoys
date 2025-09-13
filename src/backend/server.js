const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint
app.post("/eval", (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Simple scoring: sum answers
  const score = answers.reduce((sum, val) => sum + val, 0);
  const risk = score >= 11 ? "high" : "low";

  res.json({ risk });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

