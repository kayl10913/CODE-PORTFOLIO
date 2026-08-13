const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_TURNS = 10;
const MAX_HISTORY_TEXT_LENGTH = 2000;

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
}

// In-memory buckets. On serverless this only limits per warm instance,
// which is enough to stop casual scripted abuse of the shared API key.
function createRateLimiter(options) {
  const windowMs = (options && options.windowMs) || RATE_LIMIT_WINDOW_MS;
  const max = (options && options.max) || RATE_LIMIT_MAX_REQUESTS;
  const hits = new Map();

  return function check(key) {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now >= entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });

      if (hits.size > 5000) {
        for (const [k, v] of hits) {
          if (now >= v.resetAt) hits.delete(k);
        }
      }

      return { allowed: true, retryAfterSeconds: 0 };
    }

    entry.count += 1;

    if (entry.count > max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  };
}

function validateMessage(message) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { valid: false, error: 'Message is required.' };
  }

  const trimmed = message.trim();

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: 'Message is too long. Keep it under ' + MAX_MESSAGE_LENGTH + ' characters.',
    };
  }

  return { valid: true, message: trimmed };
}

// History comes from the browser, so it is untrusted: drop anything malformed,
// clamp each entry, and keep only the most recent turns.
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(function (entry) {
      return entry && typeof entry.text === 'string' && entry.text.trim();
    })
    .slice(-MAX_HISTORY_TURNS * 2)
    .map(function (entry) {
      return {
        role: entry.role === 'user' ? 'user' : 'model',
        text: entry.text.trim().slice(0, MAX_HISTORY_TEXT_LENGTH),
      };
    });
}

module.exports = {
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_TURNS,
  getClientIp,
  createRateLimiter,
  validateMessage,
  sanitizeHistory,
};
