const { sendGeminiChat, getGeminiErrorResponse } = require('./gemini-chat');
const {
  getClientIp,
  createRateLimiter,
  validateMessage,
  sanitizeHistory,
} = require('./chat-limits');

function createChatHandler(apiKey) {
  const rateLimit = createRateLimiter();

  return async function chatHandler(req, res) {
    if (!apiKey) {
      return res.status(503).json({
        error: 'Chat is not configured. Set GEMINI_API_KEY in the environment.',
      });
    }

    const limit = rateLimit(getClientIp(req));
    if (!limit.allowed) {
      res.set('Retry-After', String(limit.retryAfterSeconds));
      return res.status(429).json({
        error: 'Too many messages. Please wait a moment before sending another.',
      });
    }

    const body = req.body || {};
    const check = validateMessage(body.message);
    if (!check.valid) {
      return res.status(400).json({ error: check.error });
    }

    try {
      const result = await sendGeminiChat(apiKey, check.message, sanitizeHistory(body.history));
      return res.json({ reply: result.reply, model: result.model });
    } catch (err) {
      console.error('Gemini chat error:', err.message);
      const { status, error } = getGeminiErrorResponse(err);
      return res.status(status).json({ error });
    }
  };
}

module.exports = { createChatHandler };
