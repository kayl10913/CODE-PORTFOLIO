require('dotenv').config();
const express = require('express');
const path = require('path');
const { sendGeminiChat, getGeminiErrorResponse } = require('./lib/gemini-chat');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// SPA-style: serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat with Gemini (API key must be set in environment)
app.post('/api/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'Chat is not configured. Set GEMINI_API_KEY in the environment.',
    });
  }
  const { message, history = [] } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  try {
    const result = await sendGeminiChat(GEMINI_API_KEY, message, history);
    return res.json({ reply: result.reply, model: result.model });
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    const { status, error } = getGeminiErrorResponse(err);
    return res.status(status).json({ error });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set — chat will be disabled. Get a key at https://aistudio.google.com/apikey');
  }
});
