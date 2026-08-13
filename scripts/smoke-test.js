// Dev utility: quick end-to-end check against a running server.
const BASE = process.env.CHECK_BASE_URL || 'http://localhost:3000';

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  — ' + detail : ''));
}

async function get(path) {
  const res = await fetch(BASE + path);
  return { status: res.status, text: await res.text() };
}

async function postChat(body) {
  const res = await fetch(BASE + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

(async () => {
  const home = await get('/');
  record('homepage returns 200', home.status === 200);
  record('source-guard script removed', !home.text.includes('source-guard'));
  record('favicon linked', home.text.includes('favicon.svg'));
  record('hero avatar uses webp', home.text.includes('Kyle%20Pic%201.webp'));
  record('canonical uses new domain', home.text.includes('kaylmatyu.is-pinoy.dev'));

  const guard = await get('/js/source-guard.js');
  record('source-guard.js deleted', guard.status === 404, 'got ' + guard.status);

  record('dot background canvas present', home.text.includes('id="bg-dots"'));

  const dots = await get('/js/dot-bg.js');
  record('dot-bg.js served', dots.status === 200);

  const demo = await get('/dot-bg-demo.html');
  record('demo page removed', demo.status === 404, 'got ' + demo.status);

  const script = await get('/js/script.js');
  record('theme reveal wired up', script.text.includes('startViewTransition'));

  const css = await get('/css/styles.css');
  record('view transition styles present', css.text.includes('::view-transition-new(root)'));
  record('glass card token present', css.text.includes('--card-glass'));

  const verify = await get('/google120b939770fcdda6.html');
  record('google verification file served', verify.status === 200);

  const robots = await get('/robots.txt');
  record('robots points at new domain', robots.text.includes('kaylmatyu.is-pinoy.dev'));

  const empty = await postChat({ message: '' });
  record('chat rejects empty message', empty.status === 400);

  const long = await postChat({ message: 'x'.repeat(1200) });
  record('chat rejects overlong message', long.status === 400);

  const evil = await postChat({ message: 'hi', history: { not: 'an array' } });
  record('chat survives malformed history', evil.status === 200 || evil.status === 429);

  const failed = results.filter((r) => !r.pass);
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' checks passed');
  process.exit(failed.length ? 1 : 0);
})();
