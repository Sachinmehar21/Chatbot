// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Valid message is required' });
  }

  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('Sending message to Gemini API:', message.trim());
    const parts = [{ text: message.trim() }];
    const result = await model.generateContent(parts);
    
    console.log('Processing Gemini API response...');
    const response = await result.response;
    const text = response.text();
    console.log('Response text:', text);
    
    res.json({ reply: text });
  } catch (error) {
    console.error('Detailed Gemini API error:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      details: error.details
    });
    
    // Handle specific API errors
    if (error.status === 400) {
      res.status(400).json({ error: 'Invalid request to Gemini API' });
    } else if (error.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else if (error.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded' });
    } else {
      res.status(500).json({ error: 'Failed to get response from Gemini: ' + error.message });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});