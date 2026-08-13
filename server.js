require('dotenv').config();
const express = require('express');
const path = require('path');
const { createChatHandler } = require('./lib/chat-route');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.set('trust proxy', 1);

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '64kb' }));

// SPA-style: serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat with Gemini (API key must be set in environment)
app.post('/api/chat', createChatHandler(GEMINI_API_KEY));

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set — chat will be disabled. Get a key at https://aistudio.google.com/apikey');
  }
});
