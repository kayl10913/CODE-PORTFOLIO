# Kyle Matthew Calingasan — Portfolio

A CV-style portfolio website built with **Node.js** and **Express**, inspired by [bryllim.com](https://bryllim.com/).

## Run locally

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

### AI Chat (Gemini)

The “Chat with Kyle” button opens an AI chatbot powered by Google Gemini. To enable it, set your Gemini API key in the environment:

```bash
set GEMINI_API_KEY=your_api_key_here
npm start
```

Get a free API key at [Google AI Studio](https://aistudio.google.com/apikey). If `GEMINI_API_KEY` is not set, the chat will show an error when you try to send a message.

## Project structure

- `server.js` — Express server; serves static files from `public/`
- `public/index.html` — Single-page portfolio (About, Experience, Education, Skills, Projects, Certifications, Contact)
- `public/css/styles.css` — Styling (bryllim-inspired layout and typography)
- `public/js/script.js` — Theme toggle, certification modal, footer year
- `public/js/chat.js` — Chat panel and Gemini API calls

## Deploy to Netlify

1. **Commit and push** the `public` folder and `netlify.toml` (use relative paths only).
2. **Clear Netlify UI overrides** so the doubled path goes away:
   - Netlify → **Site configuration** (or **Site settings**) → **Build & deploy** → **Continuous deployment** → **Build settings** → **Edit settings**.
   - Set **Publish directory** to `public` (or leave **empty** so `netlify.toml` is used).
   - **Do not** set Publish directory to an absolute path like `/opt/build/repo/public`.
   - If you see **Functions directory**, clear it or set to `netlify/functions` only if you use functions.
3. **Save** and trigger **Clear cache and deploy site**.

## SEO (when you deploy)

For better search results when people search your name, replace the placeholder URL in `public/index.html` with your live site URL:

- `<link rel="canonical" href="https://your-domain.com/" />`
- Inside the `<script type="application/ld+json">` block: `"url": "https://your-domain.com/"`

Use your real domain (e.g. `https://kylecalingasan.dev` or your Vercel/Netlify URL). For Open Graph images to work on social shares, use the full absolute URL for `og:image` and `twitter:image` (e.g. `https://your-domain.com/img/Kyle%20Pic%201.jpg`).

## Tech

- **Node.js** + **Express** for serving the site
- Plain HTML, CSS, and vanilla JavaScript (no front-end framework)
- Fonts: DM Sans, Instrument Serif (Google Fonts)
