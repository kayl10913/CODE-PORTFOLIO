const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_ROOT = path.join(__dirname, '..', 'public', 'img');

// Max width per folder, based on the largest size each image is actually displayed at.
const MAX_WIDTHS = {
  '.': 700,
  projects: 1400,
  certificates: 1600,
  badges: 400,
};

function listImages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(function (entry) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listImages(full);
    return /\.(png|jpe?g)$/i.test(entry.name) ? [full] : [];
  });
}

function maxWidthFor(file) {
  const folder = path.relative(IMG_ROOT, path.dirname(file)) || '.';
  return MAX_WIDTHS[folder] || 1400;
}

async function run() {
  const files = listImages(IMG_ROOT);
  let before = 0;
  let after = 0;

  for (const file of files) {
    const target = file.replace(/\.(png|jpe?g)$/i, '.webp');
    const image = sharp(file);
    const meta = await image.metadata();
    const maxWidth = maxWidthFor(file);

    await image
      .resize({ width: Math.min(meta.width || maxWidth, maxWidth), withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(target);

    const originalSize = fs.statSync(file).size;
    const newSize = fs.statSync(target).size;
    before += originalSize;
    after += newSize;

    console.log(
      path.relative(IMG_ROOT, target).padEnd(60) +
        Math.round(originalSize / 1024) + ' KB -> ' + Math.round(newSize / 1024) + ' KB'
    );
  }

  console.log(
    '\nTotal: ' + Math.round(before / 1024) + ' KB -> ' + Math.round(after / 1024) + ' KB' +
      ' (' + Math.round((1 - after / before) * 100) + '% smaller)'
  );
}

run().catch(function (err) {
  console.error(err);
  process.exit(1);
});
