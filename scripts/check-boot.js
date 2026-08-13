// Dev utility: the boot overlay covers the entire page, so every escape hatch
// out of it needs to exist. A stuck overlay means a blank site.
const BASE = process.env.CHECK_BASE_URL || 'http://localhost:3000';

const results = [];

function record(name, pass, detail) {
  results.push(pass);
  console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  — ' + detail : ''));
}

(async () => {
  const html = await (await fetch(BASE + '/')).text();
  const js = await (await fetch(BASE + '/js/boot-screen.js')).text();

  record('overlay markup present', html.includes('id="boot-screen"'));
  record('styles inlined, not in styles.css', html.includes('.boot-screen {'));
  record('theme applied before paint', html.includes("localStorage.getItem('portfolio-theme')"));

  record('escape: noscript hides overlay', /<noscript><style>\.boot-screen/.test(html));
  record('escape: css failsafe keyframe', html.includes('boot-failsafe'));
  record('escape: reduced motion hides it', /prefers-reduced-motion: reduce\)\s*\{\s*\.boot-screen \{ display: none/.test(html.replace(/\n\s*/g, ' ')));
  record('escape: once per session', html.includes("sessionStorage.getItem('portfolio-booted')"));

  record('dismiss: on window load', js.includes("addEventListener('load'"));
  record('dismiss: hard timeout cap', /setTimeout\(finish, MAX_MS\)/.test(js));
  record('dismiss: handles already-loaded', js.includes("readyState === 'complete'"));
  record('dismiss: idempotent', js.includes('if (finished) return;'));

  const capMatch = js.match(/MAX_MS\s*=\s*(\d+)/);
  const minMatch = js.match(/MIN_MS\s*=\s*(\d+)/);
  const cap = capMatch && Number(capMatch[1]);
  const min = minMatch && Number(minMatch[1]);

  record('cap is at most 5s', cap && cap <= 5000, cap + 'ms');
  record('floor is below the cap', min && cap && min < cap, min + 'ms floor / ' + cap + 'ms cap');

  // The CSS backstop must fire after the script's own cap, or it would cut the
  // sequence short on a normal load.
  const failsafeMatch = html.match(/boot-failsafe 0s linear (\d+)s/);
  const failsafe = failsafeMatch && Number(failsafeMatch[1]) * 1000;
  record('css backstop sits after the cap', failsafe && cap && failsafe > cap, failsafe + 'ms vs ' + cap + 'ms');

  const failed = results.filter((r) => !r).length;
  console.log('\n' + (results.length - failed) + '/' + results.length + ' boot checks passed');
  process.exit(failed ? 1 : 0);
})();
