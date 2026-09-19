/**
 * Asserts that the rendered assets actually cover what the site offers.
 *
 * The interior explorer promises that the image a visitor sees is a render of
 * their own finish selection. That only holds if every selection resolves to a
 * render, so this walks all of them rather than trusting the render log.
 *
 *   node scripts/verify-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const cgi = read('public/assets/cgi/manifest.json');
const photoreal = read('public/assets/photoreal/manifest.json');
const photo = read('public/assets/photo/manifest.json');
const sheets = read('public/assets/sheets/manifest.json');

// The catalogues the UI renders, kept in step with src/data/interior.ts.
const FINISHES = {
  kitchen: ['graphite', 'sage', 'oak', 'ivory'],
  walls: ['chalk', 'clay', 'slate'],
  doors: ['white', 'oak', 'grey'],
};
const ROOMS = [
  'hall', 'kitchen', 'wc', 'dining', 'living',
  'master', 'ensuite', 'bath', 'bed3', 'landing',
  'bed2', 'ensuite2', 'landing2', 'store', 'store2',
];
const EXTERIOR_VIEWS = [
  'hero', 'plot-1', 'plot-2', 'frontage', 'garden', 'street',
  'plot-1-card', 'plot-2-card',
];
/** The approved exterior visual, prepared by scripts/prepare-photo.mjs. */
const PHOTO_KEYS = ['hero', 'plot-1', 'plot-2'];
const SHEET_SLUGS = [
  '01-location-plan', '02-existing-block-plan', '03-floor-plans',
  '04-section', '05-elevations', '06-block-plan',
];

const problems = [];
const fail = (msg) => problems.push(msg);

/** Mirrors src/lib/cgi.ts: axes that cannot be seen in a room are pinned. */
function key(room, sel) {
  const relevant = cgi.axes?.[room] ?? ['kitchen', 'walls', 'doors'];
  const pick = (axis) => (relevant.includes(axis) ? sel[axis] : cgi.defaults[axis]);
  return `${room}|${pick('kitchen')}|${pick('walls')}|${pick('doors')}`;
}

/** Mirrors the photoreal branch of src/lib/cgi.ts. */
function photorealKey(room, sel) {
  const relevant = photoreal.axes?.[room];
  if (!relevant) return null;
  const pick = (axis) => (relevant.includes(axis) ? sel[axis] : photoreal.defaults[axis]);
  return `${room}|${pick('kitchen')}|${pick('walls')}|${pick('doors')}`;
}

const seen = new Set();
const photorealSeen = new Set();
let selections = 0;
let photorealSelections = 0;

for (const room of ROOMS) {
  if (!cgi.rooms[room]) fail(`no base render for room "${room}"`);
  if (!cgi.axes?.[room]) fail(`no finish axes recorded for room "${room}"`);

  for (const kitchen of FINISHES.kitchen) {
    for (const walls of FINISHES.walls) {
      for (const doors of FINISHES.doors) {
        selections += 1;
        const k = key(room, { kitchen, walls, doors });
        seen.add(k);
        if (!cgi.variants[k]) {
          fail(`selection ${room} / ${kitchen} / ${walls} / ${doors} resolves to "${k}", which has no render`);
        }

        // A photoreal image is optional, but if one is claimed for this
        // selection its files have to be there — otherwise the page would
        // serve a broken src in preference to a working render.
        const pk = photorealKey(room, { kitchen, walls, doors });
        if (pk && photoreal.images?.[pk]) {
          photorealSelections += 1;
          photorealSeen.add(pk);
        }
      }
    }
  }
}

// Every photoreal image has to be reachable, or it is dead weight that also
// silently fails to override the render it was made to replace.
for (const k of Object.keys(photoreal.images ?? {})) {
  if (!photorealSeen.has(k)) fail(`photoreal image "${k}" is not reachable from any selection`);
}

for (const view of EXTERIOR_VIEWS) {
  if (!cgi.exterior[view]) fail(`no render for exterior view "${view}"`);
}

for (const key of PHOTO_KEYS) {
  if (!photo.images?.[key]) fail(`no prepared exterior image for "${key}"`);
}

for (const slug of SHEET_SLUGS) {
  if (!sheets.some((s) => s.slug === slug)) fail(`no rasterised preview for sheet "${slug}"`);
}

// Every file the manifests point at has to be on disk.
let files = 0;
const checkFiles = (group) => {
  for (const sizes of Object.values(group)) {
    for (const file of Object.values(sizes)) {
      files += 1;
      if (!fs.existsSync(path.join(ROOT, 'public', file))) fail(`missing file ${file}`);
    }
  }
};
checkFiles(cgi.exterior);
checkFiles(cgi.rooms);
checkFiles(cgi.variants);
checkFiles(photoreal.images ?? {});
checkFiles(photo.images ?? {});
for (const sheet of sheets) {
  for (const s of [...sheet.sizes.map((x) => x.file), sheet.full]) {
    files += 1;
    if (!fs.existsSync(path.join(ROOT, 'public', s))) fail(`missing file ${s}`);
  }
}

// Renders nothing resolves to are dead weight in the repository.
const orphans = Object.keys(cgi.variants).filter((k) => !seen.has(k));

console.log(`${ROOMS.length} rooms × ${selections / ROOMS.length} selections = ${selections} selections`);
console.log(`${Object.keys(cgi.variants).length} interior renders, ${seen.size} reachable`);
console.log(`${Object.keys(cgi.exterior).length} exterior CGI views (reference), ${sheets.length} drawing sheets`);
console.log(`${Object.keys(photo.images ?? {}).length} approved exterior images, ${photo.native?.width}px native`);
console.log(
  `${Object.keys(photoreal.images ?? {}).length} photoreal images covering ${photorealSelections} of ${selections} selections ` +
    `(${selections - photorealSelections} served by renders)`,
);
console.log(`${files} image files checked`);
if (orphans.length) console.log(`note: ${orphans.length} renders are not reachable from any selection`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 25)) console.error(`  - ${p}`);
  if (problems.length > 25) console.error(`  … and ${problems.length - 25} more`);
  process.exit(1);
}
console.log('\nAll selections resolve to a render.');
