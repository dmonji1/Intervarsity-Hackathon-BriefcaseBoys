const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Risk assessment endpoint
app.post('/eval', (req, res) => {
  try {
    const { answers } = req.body;
    
    // Validate request
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid request format. Expected { answers: number[] }' });
    }
    
    // Calculate risk score (simple sum of answers)
    const score = answers.reduce((sum, answer) => sum + answer, 0);
    
    // Determine risk level
    const risk = score > 7 ? 'high' : 'low';
    
    // Return assessment
    res.json({ risk, score });
    
    console.log(`Received answers: ${answers}, Score: ${score}, Risk: ${risk}`);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully');
  process.exit(0);
});
