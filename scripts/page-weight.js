// Dev utility: report what the homepage pulls in and how big it is.
const BASE = process.env.CHECK_BASE_URL || 'http://localhost:3000';

async function size(url) {
  const start = Date.now();
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return { bytes: buf.byteLength, ms: Date.now() - start, status: res.status };
}

(async () => {
  const homeRes = await fetch(BASE + '/');
  const html = await homeRes.text();

  const local = [...html.matchAll(/(?:src|href)="(\/[^"]+\.(?:css|js|webp|png|svg))"/g)].map((m) => m[1]);
  const remote = [...html.matchAll(/(?:src|href)="(https:\/\/[^"]+\.(?:css|js))"/g)].map((m) => m[1]);
  const fonts = [...html.matchAll(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/g)].map((m) => m[1]);

  let total = Buffer.byteLength(html);
  console.log('index.html'.padEnd(52) + (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');

  console.log('\n-- same origin (render blocking or eager) --');
  for (const path of [...new Set(local)]) {
    const r = await size(BASE + encodeURI(decodeURI(path)));
    total += r.bytes;
    console.log(path.padEnd(52) + (r.bytes / 1024).toFixed(1) + ' KB');
  }

  console.log('\n-- third party --');
  for (const url of [...new Set([...remote, ...fonts])]) {
    try {
      const r = await size(url);
      total += r.bytes;
      console.log((url.slice(0, 50)).padEnd(52) + (r.bytes / 1024).toFixed(1) + ' KB  ' + r.ms + 'ms');
    } catch (e) {
      console.log(url.slice(0, 50).padEnd(52) + 'unreachable');
    }
  }

  console.log('\nEager total (excludes lazy images): ' + (total / 1024).toFixed(1) + ' KB');
})();
