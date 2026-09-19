/**
 * Prepares accepted photoreal images for the site.
 *
 * Drop the accepted generations into .photoreal/accepted/<slug>.<ext>, named
 * with the job slug (e.g. kitchen--sage-clay.jpg), then run this. Each one is
 * resized to the widths the renders use and recorded in a manifest with the
 * same shape, so src/lib/cgi.ts can prefer it and fall back to the render.
 *
 *   node scripts/prepare-photoreal.mjs
 *
 * Only slugs that exist on disk are written, so a partial set is safe: every
 * selection without a photoreal image keeps serving its render.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photorealJobs, PHOTOREAL_AXES, PINNED } from '../cgi/photoreal/jobs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, '.photoreal/accepted');
const OUT = path.join(ROOT, 'public/assets/photoreal');
const WIDTHS = [640, 1000, 1600];
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function findSource(slug) {
  for (const ext of EXTS) {
    const p = path.join(SRC, slug + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

fs.mkdirSync(OUT, { recursive: true });

const jobs = photorealJobs();
const images = {};
let made = 0;
const skipped = [];

for (const job of jobs) {
  const src = findSource(job.slug);
  if (!src) {
    skipped.push(job.slug);
    continue;
  }

  const meta = await sharp(src).metadata();
  const sizes = {};
  for (const w of WIDTHS) {
    if (meta.width && meta.width < w && w !== WIDTHS[0]) continue;
    const file = `${job.slug}-${w}.webp`;
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(path.join(OUT, file));
    sizes[String(w)] = `/assets/photoreal/${file}`;
  }
  images[job.key] = sizes;
  made += 1;
  console.log(`${job.key}  <- ${path.basename(src)} (${meta.width}x${meta.height})`);
}

const manifest = {
  generated: new Date().toISOString(),
  defaults: PINNED,
  axes: PHOTOREAL_AXES,
  images,
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n${made} of ${jobs.length} photoreal images prepared.`);
if (skipped.length) {
  console.log(`${skipped.length} still to generate: ${skipped.slice(0, 6).join(', ')}${skipped.length > 6 ? ' …' : ''}`);
}
