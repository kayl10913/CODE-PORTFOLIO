require('dotenv').config();
const express = require('express');
const { sendGeminiChat, getGeminiErrorResponse } = require('../lib/gemini-chat');

const app = express();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());

// Chat with Gemini (API key must be set in Vercel Environment Variables)
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

module.exports = app;
