// Dev utility: confirm every image/icon referenced by the site actually resolves.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = process.env.CHECK_BASE_URL || 'http://localhost:3000';

const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'public', 'js', 'script.js'), 'utf8');

const refs = new Set();

for (const m of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:webp|png|svg|jpe?g))"/g)) {
  refs.add(m[1]);
}

for (const m of js.matchAll(/'(\/img\/[^']+)'/g)) {
  if (!m[1].endsWith('/')) refs.add(m[1]);
}

for (const block of js.matchAll(/images:\s*\[([^\]]+)\]/g)) {
  for (const f of block[1].matchAll(/'([^']+)'/g)) {
    refs.add('/img/projects/' + f[1]);
  }
}

(async () => {
  let missing = 0;

  for (const ref of [...refs].sort()) {
    const res = await fetch(BASE + encodeURI(decodeURI(ref)));
    if (!res.ok) {
      missing += 1;
      console.log('MISSING ' + res.status + '  ' + ref);
    }
  }

  console.log(refs.size + ' asset references checked, ' + missing + ' missing');
  process.exit(missing ? 1 : 0);
})();
