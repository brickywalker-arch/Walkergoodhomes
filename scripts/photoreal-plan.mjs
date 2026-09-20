/**
 * Works out what is left to generate, and in what order.
 *
 * The photoreal set is a cascade: every image past a room's base is an edit of
 * an image one axis away from it, so nothing can be generated before its
 * parent exists. This reads what is already accepted on disk, walks the chain,
 * and writes the outstanding work to .photoreal/plan.json grouped into waves —
 * everything in a wave can be generated at once.
 *
 *   node scripts/photoreal-plan.mjs
 *
 * Rooms come out in PRIORITY order rather than plan order, because the set is
 * generated against a credit budget and the rooms a buyer opens first should
 * be the ones that are complete.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { photorealChain, recolourPrompt } from '../cgi/photoreal/jobs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ACCEPTED = path.join(ROOT, '.photoreal/accepted');
const REFS = path.join(ROOT, '.photoreal/refs');
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Which rooms matter most.
 *
 * Six rooms already carry the development and a buyer opens them first; the
 * wet rooms are where the tile choice is the whole point; the landings and the
 * stores are circulation. If the budget runs out it should run out at the
 * bottom of this list, and it should run out between rooms rather than inside
 * one — half a room in photographs and half in renders is the inconsistency
 * this whole pass exists to remove.
 */
const PRIORITY = [
  'kitchen', 'living', 'dining', 'master', 'bed2', 'hall',
  'bath', 'wc', 'ensuite', 'ensuite2', 'bed3',
  'store', 'store2', 'landing', 'landing2',
];

function onDisk(dir, slug) {
  for (const ext of EXTS) {
    const p = path.join(dir, slug + ext);
    if (fs.existsSync(p)) return path.relative(ROOT, p);
  }
  return null;
}

const chain = photorealChain();
const done = new Map(chain.map((j) => [j.slug, onDisk(ACCEPTED, j.slug)]).filter(([, v]) => v));

const pending = chain
  .filter((j) => !done.has(j.slug))
  .map((j) => ({
    slug: j.slug,
    key: j.key,
    room: j.room,
    depth: j.depth,
    from: j.from,
    change: j.change,
    /* Where the parent image is now: a file to upload, or nothing yet because
     * the parent is itself pending in an earlier wave of this run. */
    parentFile: j.from ? (done.get(j.from) ?? null) : onDisk(REFS, j.slug),
    prompt: j.from ? recolourPrompt(j.change, j.room) : j.prompt,
  }));

const rank = (room) => {
  const i = PRIORITY.indexOf(room);
  return i < 0 ? PRIORITY.length : i;
};
pending.sort((a, b) => rank(a.room) - rank(b.room) || a.depth - b.depth || a.slug.localeCompare(b.slug));

const waves = {};
for (const j of pending) (waves[j.depth] ??= []).push(j);

const perRoom = {};
for (const j of pending) perRoom[j.room] = (perRoom[j.room] ?? 0) + 1;

fs.mkdirSync(path.dirname(path.join(ROOT, '.photoreal/plan.json')), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, '.photoreal/plan.json'),
  JSON.stringify({ generated: new Date().toISOString(), total: chain.length, done: done.size, pending }, null, 1),
);

console.log(`${chain.length} images in the full set, ${done.size} accepted, ${pending.length} outstanding`);
console.log('\noutstanding by room, in priority order:');
for (const room of PRIORITY) if (perRoom[room]) console.log(`  ${room.padEnd(9)} ${String(perRoom[room]).padStart(3)}`);
console.log('\noutstanding by wave (a wave can be generated all at once):');
for (const d of Object.keys(waves).sort()) console.log(`  depth ${d}  ${String(waves[d].length).padStart(3)}`);
const missingRef = pending.filter((j) => !j.from && !j.parentFile);
if (missingRef.length) {
  console.log(`\n${missingRef.length} base(s) have no reference JPEG yet — run scripts/photoreal-refs.mjs:`);
  for (const j of missingRef) console.log(`  ${j.slug}`);
}
