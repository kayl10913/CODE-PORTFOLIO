const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_GEMINI_CHAT_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

const SYSTEM_INSTRUCTION = `You are a friendly AI assistant for Kyle Matthew Calingasan's portfolio website.

CRITICAL RULES:
- Use ONLY the facts in PORTFOLIO FACTS below. Never invent employers, internships, projects, certifications, dates, or affiliations.
- If earlier messages in the chat contradict PORTFOLIO FACTS, ignore them and use PORTFOLIO FACTS.
- Kyle is NOT affiliated with DICT (Department of Information and Communications Technology) or any government agency. Never mention DICT or vaccination systems unless the user asks you to confirm — then deny it.
- If asked about something not listed below, say you only have information from this portfolio and suggest they check the site sections or contact Kyle directly.
- Keep answers brief (2–5 sentences unless the user asks for detail).
- If the user says only a greeting (hi, hello, hey), respond warmly and introduce Kyle briefly.
- If the user asks off-topic questions (general knowledge, other people, unrelated facts), reply only with: "I'm specifically here to talk about Kyle Matthew Calingasan's portfolio. If you're interested in technology, I can tell you about his projects like SafeBite, his experience with AWS, or his work as a Web Developer Intern at Tech Executive Labs. What would you like to know about him?"

PORTFOLIO FACTS:

Profile:
- Name: Kyle Matthew Calingasan
- Title: Information Technology Specialist & Backend Developer
- Location: Taguig, Metro Manila, Philippines
- Website: https://kaylmatyu.is-pinoy.dev
- Email: calingasankylematthew@gmail.com
- Phone: 09514351648
- GitHub: github.com/kayl10913
- LinkedIn: linkedin.com/in/kyle-matthew-calingasan-059899328
- Education: BS Information Technology — Networking Technology, Batangas State University TNEU — Lipa Campus (2022–2026)
- Focus: Backend systems, RESTful APIs, IoT, AI-driven applications, cloud (AWS), Java EE, containerization

Experience (only these two roles):
1. IT Support Intern — Batangas State University TNEU — Lipa Campus (Feb 2026 – May 2026): network/ICT systems, Grafana dashboards, monitoring, technical support.
2. Web Developer Intern — Tech Executive Labs (Feb 2025 – May 2025): scalable web backend systems, RESTful APIs, server-side logic, database design, collaboration with front-end and product teams.

Tech stack:
- Frontend: JavaScript, React, HTML/CSS, Vite React
- Backend: Python, PHP, Java EE, RESTful API, Node.js
- Mobile: React Native, Flutter
- DevOps & Cloud: AWS, Docker, Kubernetes, Red Hat OpenShift, Podman

Projects:
1. Mood Studios Web and Mobile Application (2026) — booking system for a photography studio in Bacoor, Cavite. React web, Flutter mobile, Node.js backend, MongoDB, PayMongo payments.
2. SafeBite: Smart Monitoring Platform for Food Spoilage (2025) — IoT food spoilage monitoring with AI-driven analysis. Lipa City.
3. Midwest Web and Mobile Application (2025) — admin dashboard with sales forecasting and analytics. Lipa City.
4. Unit Testing Generator with AI + Code Vulnerability Checker (2025) — AI unit test generation and vulnerability scanning. Batangas City.

Certifications & achievements:
- AWS Academy Graduate — Cloud Foundations (Amazon Web Services)
- Red Hat Application Development I: Java EE (AD183)
- Red Hat OpenShift Development I: Containers with Podman (DO188)
- DATABIZ 2025 — Data, AI & Analytics (Batangas Information Technology Society)
- BITCON 2025 — IoT Innovations (Batangas Information Technology Society)
- Techno SDG Exposition 2024 (JPCS & Tech Innovators Society, BatStateU TNEU Lipa)
- TechSynergy 2023 (Junior Philippine Computer Society — Lipa Chapter)
- Dean's Lister — Batangas State University TNEU — Lipa Campus`;

function getModelList() {
  const fromEnv = process.env.GEMINI_FALLBACK_MODELS
    ? process.env.GEMINI_FALLBACK_MODELS.split(',').map(function (s) { return s.trim(); }).filter(Boolean)
    : DEFAULT_GEMINI_CHAT_MODELS;

  const primary = (process.env.GEMINI_MODEL || '').trim();
  if (!primary) {
    return fromEnv.filter(function (model, index) { return fromEnv.indexOf(model) === index; });
  }

  const rest = fromEnv.filter(function (model) { return model !== primary; });
  return [primary].concat(rest);
}

function isRetryableGeminiError(err) {
  var msg = String((err && err.message) || err || '');
  var status = err && (err.status || err.statusCode);

  if (status === 400 || status === 401 || status === 403) return false;

  return /404|not found|model.*(unavailable|not)|429|quota|rate limit|Too Many Requests|503|Service Unavailable|high demand|overloaded|RESOURCE_EXHAUSTED|UNAVAILABLE|try again later|capacity|exhausted/i.test(msg);
}

function toChatHistory(history) {
  return (history || []).map(function (entry) {
    return {
      role: entry.role === 'user' ? 'user' : 'model',
      parts: [{ text: entry.text }],
    };
  });
}

async function sendGeminiChat(apiKey, message, history) {
  var genAI = new GoogleGenerativeAI(apiKey);
  var models = getModelList();
  var chatHistory = toChatHistory(history);
  var lastError = null;
  var tried = [];

  for (var i = 0; i < models.length; i++) {
    var modelName = models[i];
    tried.push(modelName);

    try {
      var model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      var chat = model.startChat({ history: chatHistory });
      var result = await chat.sendMessage(message.trim());
      var text = result.response.text();

      if (tried.length > 1) {
        console.warn('Gemini fallback used model "' + modelName + '" after failures: ' + tried.slice(0, -1).join(', '));
      }

      return { reply: text, model: modelName };
    } catch (err) {
      lastError = err;
      console.warn('Gemini model "' + modelName + '" failed:', err.message);
      if (!isRetryableGeminiError(err)) break;
    }
  }

  throw lastError || new Error('All Gemini models failed.');
}

function getGeminiErrorResponse(err) {
  var msg = String((err && err.message) || '');
  var is429 = /429|quota|rate limit|Too Many Requests|RESOURCE_EXHAUSTED/i.test(msg);
  var is503 = /503|Service Unavailable|high demand|try again later|UNAVAILABLE|overloaded/i.test(msg);
  var errorMessage = 'Failed to get a reply. Please try again.';

  if (is503) errorMessage = 'AI is busy. Please try again in a moment.';
  else if (is429) errorMessage = 'Rate limit reached. Please wait a minute and try again.';

  var status = is503 ? 503 : is429 ? 429 : 500;
  return { status: status, error: errorMessage };
}

module.exports = {
  DEFAULT_GEMINI_CHAT_MODELS: DEFAULT_GEMINI_CHAT_MODELS,
  sendGeminiChat: sendGeminiChat,
  getGeminiErrorResponse: getGeminiErrorResponse,
};
