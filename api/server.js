require('dotenv').config();
const express = require('express');
const { createChatHandler } = require('../lib/chat-route');

const app = express();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));

// Chat with Gemini (API key must be set in Vercel Environment Variables)
app.post('/api/chat', createChatHandler(GEMINI_API_KEY));

module.exports = app;
