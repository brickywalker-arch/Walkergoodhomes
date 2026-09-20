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
import { photorealJobs, AXES, PHOTOREAL_AXES, PHOTOREAL_VALUES, PINNED, photorealKey } from '../cgi/photoreal/jobs.mjs';

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

/**
 * The axes a room can honestly be said to vary on *today*.
 *
 * An axis only counts once every value of it is photographed for every
 * combination of the room's other live axes. Half an axis is worse than none:
 * the values with an image would show a photograph and the rest would fall
 * back to the render, which is exactly the unevenness this set exists to
 * remove. So a new axis stays dark until its last image lands, and the site
 * goes on serving the pinned value for it in the meantime.
 *
 * With four axes at most there are sixteen subsets to consider, so this takes
 * the largest one whose whole cross product is on disk rather than being
 * clever about it.
 */
function coveredAxes(room, have) {
  const axes = PHOTOREAL_AXES[room] ?? [];
  let best = [];
  for (let mask = 0; mask < 1 << axes.length; mask += 1) {
    const subset = axes.filter((_, i) => mask & (1 << i));
    if (subset.length <= best.length) continue;
    let combos = [{ ...PINNED }];
    for (const axis of subset) {
      const grown = [];
      for (const base of combos) {
        for (const value of PHOTOREAL_VALUES[axis] ?? [PINNED[axis]]) grown.push({ ...base, [axis]: value });
      }
      combos = grown;
    }
    if (combos.every((c) => have.has(photorealKey(room, c)))) best = subset;
  }
  return best;
}

const have = new Set(Object.keys(images));
const axes = {};
for (const room of Object.keys(PHOTOREAL_AXES)) axes[room] = coveredAxes(room, have);

// An image outside the covered axes answers a key the site will not ask for
// while that axis is dark, so it stays on disk and out of the manifest.
const reachable = {};
for (const [key, sizes] of Object.entries(images)) {
  const [room, ...values] = key.split('|');
  const live = axes[room] ?? [];
  if (AXES.every((axis, i) => live.includes(axis) || values[i] === PINNED[axis])) reachable[key] = sizes;
}

const manifest = {
  generated: new Date().toISOString(),
  defaults: PINNED,
  axes,
  images: reachable,
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n${made} of ${jobs.length} photoreal images prepared.`);
const dark = Object.entries(axes)
  .filter(([room, live]) => (PHOTOREAL_AXES[room] ?? []).some((a) => !live.includes(a)))
  .map(([room, live]) => `${room} (${(PHOTOREAL_AXES[room] ?? []).filter((a) => !live.includes(a)).join(', ')})`);
if (dark.length) {
  console.log(`${Object.keys(reachable).length} in the manifest; axes still short of full coverage, so held back:`);
  console.log(`  ${dark.join(', ')}`);
}
if (skipped.length) {
  console.log(`${skipped.length} still to generate: ${skipped.slice(0, 6).join(', ')}${skipped.length > 6 ? ' …' : ''}`);
}
