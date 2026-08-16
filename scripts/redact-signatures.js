// Blurs the handwritten signatures out of the certificate scans and writes the
// web-sized WebP files that the site actually serves.
//
// The unredacted scans live in assets/certificates-raw/, which is outside
// public/ and gitignored, so the originals are never deployed or committed.
// Run this instead of editing public/img/certificates/ by hand:
//
//   npm run redact:certs
//
// Regions are fractions of width/height rather than pixels, so they stay
// correct no matter what OUTPUT_WIDTH is set to.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(__dirname, '..', 'assets', 'certificates-raw');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'img', 'certificates');
const OUTPUT_WIDTH = 1600;
const WEBP_QUALITY = 82;

// Each region is { x, y, w, h } as a fraction of the image.
//
// On several of these the handwriting runs down across the printed signatory
// name. The deliberate choice here is to stop each region just above the top of
// that name, so names and titles stay perfectly sharp — the trade is that where
// a stroke crossed a name, its tail survives. Lowering any `h` past the values
// below starts smudging the names.
const CERTIFICATES = [
  {
    file: '5f9e17b9-1e39-4a98-97a3-9171e3384477.jpg',
    label: 'DATABIZ 2025',
    regions: [{ x: 0.470, y: 0.748, w: 0.110, h: 0.058 }],
  },
  {
    file: '042d7b7d-23f2-4e63-a5ea-4060b3fda89f.jpg',
    label: 'BITCON 2025',
    regions: [{ x: 0.300, y: 0.822, w: 0.115, h: 0.064 }],
  },
  {
    file: '9740ccc7-3490-440c-a420-388ccfc47e59.jpg',
    label: 'Techno SDG Exposition 2024',
    regions: [
      { x: 0.212, y: 0.755, w: 0.108, h: 0.077 },
      { x: 0.455, y: 0.755, w: 0.085, h: 0.077 },
      // Wider than the others: this signature trails a flourish to the right.
      { x: 0.645, y: 0.755, w: 0.190, h: 0.077 },
    ],
  },
  {
    file: 'c2228d3d-ac23-4705-b078-69c092e1be0f.jpg',
    label: 'TechSynergy 2023',
    regions: [
      { x: 0.235, y: 0.735, w: 0.090, h: 0.069 },
      { x: 0.648, y: 0.730, w: 0.192, h: 0.074 },
    ],
  },
];

function toPixelRect(region, width, height) {
  // Clamp so a slightly generous fraction can never extract past the edge,
  // which sharp treats as a fatal error.
  const left = Math.max(0, Math.round(region.x * width));
  const top = Math.max(0, Math.round(region.y * height));
  return {
    left,
    top,
    width: Math.max(1, Math.min(Math.round(region.w * width), width - left)),
    height: Math.max(1, Math.min(Math.round(region.h * height), height - top)),
  };
}

async function redact(cert) {
  const source = path.join(SOURCE_DIR, cert.file);

  if (!fs.existsSync(source)) {
    throw new Error('missing original: ' + path.relative(process.cwd(), source));
  }

  // Resize first so the blur is applied at the size we ship. Blurring before
  // downscaling would let the resample recover some stroke detail.
  const resized = await sharp(source)
    .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
    .toBuffer();

  const { width, height } = await sharp(resized).metadata();

  const patches = [];
  for (const region of cert.regions) {
    const rect = toPixelRect(region, width, height);
    // A sigma tied to region height keeps every signature equally illegible
    // regardless of how large it was drawn.
    const sigma = Math.max(12, Math.round(rect.height * 0.5));
    const patch = await sharp(resized).extract(rect).blur(sigma).toBuffer();
    patches.push({ input: patch, left: rect.left, top: rect.top });
  }

  const outFile = path.join(OUTPUT_DIR, cert.file.replace(/\.jpg$/i, '.webp'));
  await sharp(resized)
    .composite(patches)
    .webp({ quality: WEBP_QUALITY })
    .toFile(outFile);

  const kb = (fs.statSync(outFile).size / 1024).toFixed(1);
  console.log(
    `OK  ${cert.label} — ${cert.regions.length} signature${cert.regions.length > 1 ? 's' : ''} blurred, ` +
      `${width}x${height}, ${kb} KB`
  );
}

(async () => {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('No source directory at ' + path.relative(process.cwd(), SOURCE_DIR));
    console.error('Put the original certificate scans there and re-run.');
    process.exit(1);
  }

  let failed = 0;
  for (const cert of CERTIFICATES) {
    try {
      await redact(cert);
    } catch (err) {
      failed += 1;
      console.error(`FAIL  ${cert.label} — ${err.message}`);
    }
  }

  console.log(`\n${CERTIFICATES.length - failed}/${CERTIFICATES.length} certificates written`);
  process.exit(failed ? 1 : 0);
})();
