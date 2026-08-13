# Kyle Matthew Calingasan — Portfolio

Personal portfolio site with a terminal-themed UI and a Gemini-powered chat assistant.

**Live:** https://kaylmatyu.is-pinoy.dev

## Stack

- **Frontend:** static HTML, CSS, and vanilla JS served from `public/`
- **Backend:** Express (`server.js` locally, `api/server.js` as a Vercel serverless function)
- **AI:** Google Gemini via `@google/generative-ai`

## Getting started

```bash
npm install
cp .env.example .env   # then add your key
npm run dev
```

The site runs at http://localhost:3000.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes, for chat | API key from [Google AI Studio](https://aistudio.google.com/apikey). Without it, the chat returns a 503. |
| `GEMINI_MODEL` | No | Overrides the primary chat model. |
| `GEMINI_FALLBACK_MODELS` | No | Comma-separated model list to try in order. |
| `PORT` | No | Defaults to `3000`. |

## Project layout

```
public/            Static site (this is what gets served)
  index.html       Single-page portfolio
  css/styles.css   Terminal-themed styling, light + dark
  js/script.js     Hero terminal, modals, scroll spy, reveal animations
  js/chat.js       Chat panel UI
  js/dot-bg.js     Animated dot-matrix background behind the hero
  img/             Images (.webp for display, originals kept for social cards)
lib/
  gemini-chat.js   System prompt + model fallback chain
  chat-limits.js   Rate limiting, message and history validation
  chat-route.js    Shared /api/chat handler used by both servers
api/server.js      Vercel serverless entry point
server.js          Local Express server
scripts/           Maintenance utilities
```

## Chat assistant

The assistant answers only from the portfolio facts in `lib/gemini-chat.js`. If you update your
experience, projects, or certifications in `public/index.html`, update that system prompt too —
otherwise the model will fall back on guessing and can state things that aren't true.

**Model fallback.** Requests try each model in order and move to the next on a retryable failure
(404, 429, 503, quota, overload). Auth errors stop immediately rather than burning through the list.

**Abuse protection.** `/api/chat` caps messages at 1000 characters, trims history to the last
10 turns, rejects bodies over 64 KB, and rate limits to 10 requests per minute per IP. The rate
limiter is in-memory, so on Vercel it applies per warm instance — enough to stop casual scripted
abuse, but swap in a shared store if you need hard guarantees.

## Dot background

The page background is a viewport-fixed canvas driven by animated value noise. Tune it from the
markup in `public/index.html` — no JS changes needed:

```html
<canvas id="bg-dots" data-spacing="14" data-opacity="0.5" data-speed="1"></canvas>
```

`data-spacing` is the dot pitch in pixels (lower is denser and more expensive), `data-opacity`
is the overall strength, and `data-speed` scales the drift rate.

Cards sit on top of it as translucent glass. Both knobs are CSS custom properties in
`public/css/styles.css` — `--card-glass` for the tint and alpha, `--card-blur` for the blur
radius. Note that every blurred surface has to be recomposited whenever the dots repaint, so
lowering `data-speed` or raising `data-spacing` is the first thing to try if it ever feels heavy.

Because it is fixed to the viewport rather than sized to the page, its cost stays constant no
matter how long the page gets. It recolours with the light/dark theme, caps at ~30fps, and stops
rendering when the tab is hidden or the visitor has `prefers-reduced-motion` set. A
`ResizeObserver` keeps the canvas backing store matched to its rendered size — without it the
browser rescales a stale bitmap and the dots render as ellipses.

## Boot screen

A terminal-style overlay covers the page on first load. Its markup sits at the top of `<body>`
and its CSS is inlined in `<head>` — it cannot depend on `styles.css` or the webfonts, since
covering their arrival is the whole point.

Because the overlay hides the entire site, every way out of it matters. It dismisses on `window.load`,
never sooner than `MIN_MS` (3000) so the sequence plays in full, and never later than `MAX_MS`
(5000) so a slow connection cannot trap anyone. `LINE_MS` is paced so the lines keep arriving for
the whole minimum instead of finishing early and leaving a static screen — if you change the
duration, change the line count or pacing to match. On top of that it is skipped for repeat visits in the same session
and for `prefers-reduced-motion`, hidden outright via `<noscript>`, and force-hidden by a pure-CSS
keyframe at 5s in case `boot-screen.js` never loads. Run `npm run check:boot` to verify those
escape hatches are all still wired up.

The same `<head>` block also applies the stored theme before first paint. Without it, anyone using
light mode saw a flash of dark, because `data-theme="dark"` is hardcoded on `<html>` and the swap
previously happened in `script.js` at the end of the body.

## Theme switching

The light/dark toggle uses the View Transitions API to wipe the new theme in as a circle growing
from the button. Browsers without `document.startViewTransition`, and visitors with
`prefers-reduced-motion`, get an instant swap instead — the site never depends on the animation.

While the wipe runs, `.theme-switching` on `<html>` suppresses every CSS transition. The incoming
layer renders live rather than as a snapshot, so without that the site's own colour transitions
would fade *inside* the reveal and smear it.

## Maintenance scripts

```bash
npm run optimize:images   # re-encode public/img to WebP (run after adding images)
npm run check:assets      # verify every referenced image resolves (needs the dev server running)
```

`optimize:images` writes a `.webp` next to each PNG/JPEG and resizes to a sensible max width per
folder. Update the `src` references afterwards. Originals are kept because Open Graph and Twitter
card images are served as JPEG for crawler compatibility.

## Deploying

Hosted on Vercel using `vercel.json`. `api/server.js` handles `/api/*`, everything else is served
statically from `public/`.

1. Push to the connected Git branch.
2. Set `GEMINI_API_KEY` under **Project → Settings → Environment Variables**.
3. Add the custom domain under **Project → Settings → Domains**.

## License

MIT
