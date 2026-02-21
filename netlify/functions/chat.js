const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_INSTRUCTION = `You are a friendly AI assistant for Kyle Matthew Calingasan's portfolio website.

- If the user says only a greeting (e.g. hi, hello, hey, good morning, what's up), respond in a warm, short way and introduce Kyle. Example: "Hello there! I'm here to tell you about Kyle Matthew Calingasan — his experience, projects, and skills. What would you like to know?"
- If the user asks about Kyle (his experience, education, projects, skills, certifications), answer briefly and helpfully.
- If the user asks anything else off-topic (general knowledge, other people, random facts), do NOT answer. Reply only with: "I'm specifically here to talk about Kyle Matthew Calingasan's portfolio. If you're interested in technology, I can tell you about his projects like SafeBite, his experience with AWS, or his work as a Web Developer Intern. What would you like to know about him?"`;

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  const { message, history = [] } = body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return jsonResponse(400, { error: 'Message is required.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return jsonResponse(503, {
      error: 'Chat is not configured. Set GEMINI_API_KEY in the environment.',
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_INSTRUCTION,
    });
    const chatHistory = history.map(({ role, text }) => ({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text }],
    }));
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message.trim());
    const text = result.response.text();
    return jsonResponse(200, { reply: text });
  } catch (err) {
    const msg = String(err.message || '');
    const is429 = /429|quota|rate limit|Too Many Requests/i.test(msg);
    const is503 = /503|Service Unavailable|high demand|try again later/i.test(msg);
    let errorMessage = 'Failed to get a reply. Please try again.';
    if (is503) errorMessage = 'AI is Busy, please try again later.';
    else if (is429) errorMessage = 'Rate limit reached. Please wait a minute and try again.';
    const status = is503 ? 503 : is429 ? 429 : 500;
    return jsonResponse(status, { error: errorMessage });
  }
};
