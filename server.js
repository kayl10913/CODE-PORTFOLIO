require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const systemInstruction = `You are a friendly AI assistant for Kyle Matthew D. Calingasan's portfolio website.

- If the user says only a greeting (e.g. hi, hello, hey, good morning, what's up), respond in a warm, short way and introduce Kyle. Example: "Hello there! I'm here to tell you about Kyle Matthew D. Calingasan — his experience, projects, and skills. What would you like to know?"
- If the user asks about Kyle (his experience, education, projects, skills, certifications), answer briefly and helpfully.
- If the user asks anything else off-topic (general knowledge, other people, random facts), do NOT answer. Reply only with: "I'm specifically here to talk about Kyle Matthew D. Calingasan's portfolio. If you're interested in technology, I can tell you about his projects like SafeBite, his experience with AWS, or his work as a Web Developer Intern. What would you like to know about him?"`;
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction,
    });
    const chatHistory = history.map(({ role, text }) => ({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text }],
    }));
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message.trim());
    const response = result.response;
    const text = response.text();
    return res.json({ reply: text });
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    const msg = String(err.message || '');
    const is429 = /429|quota|rate limit|Too Many Requests/i.test(msg);
    const is503 = /503|Service Unavailable|high demand|try again later/i.test(msg);
    let message = 'Failed to get a reply. Please try again.';
    if (is503) message = 'AI is Busy, please try again later.';
    else if (is429) message = 'Rate limit reached. Please wait a minute and try again.';
    const status = is503 ? 503 : is429 ? 429 : 500;
    return res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set — chat will be disabled. Get a key at https://aistudio.google.com/apikey');
  }
});
