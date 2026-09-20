/**
 * Emits one generation batch for the photoreal cascade.
 *
 *   node scripts/dev/photoreal-batch.mjs living wc > batch.json
 *
 * A batch is everything outstanding for the named rooms, in an order the
 * canvas can be wired from: an image whose parent is already accepted needs a
 * LoadImage node with that file uploaded to it, and everything downstream of
 * it is wired node-to-node, so the cascade runs in a single pass and nothing
 * is uploaded twice.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, '.photoreal/plan.json'), 'utf8'));
const rooms = process.argv.slice(2);
if (!rooms.length) {
  console.error('usage: photoreal-batch.mjs <room> [room...]');
  process.exit(1);
}

const jobs = plan.pending.filter((j) => rooms.includes(j.room));
const pendingSlugs = new Set(jobs.map((j) => j.slug));

// A job is wired from its parent node when the parent is generated in this
// same batch, and from an uploaded file when it is not.
const uploads = [];
const seen = new Set();
for (const j of jobs) {
  if (j.from && pendingSlugs.has(j.from)) continue;
  if (!j.parentFile) {
    console.error(`no parent image on disk for ${j.slug} (parent ${j.from ?? 'render reference'})`);
    process.exit(1);
  }
  if (seen.has(j.parentFile)) continue;
  seen.add(j.parentFile);
  uploads.push({ for: j.from ?? j.slug, file: j.parentFile });
}

const byFile = new Map(uploads.map((u, i) => [u.file, i]));
const generate = jobs
  .slice()
  .sort((a, b) => a.depth - b.depth || a.slug.localeCompare(b.slug))
  .map((j) => ({
    slug: j.slug,
    room: j.room,
    depth: j.depth,
    prompt: j.prompt,
    // Exactly one of these is set.
    fromSlug: j.from && pendingSlugs.has(j.from) ? j.from : null,
    fromUpload: j.from && pendingSlugs.has(j.from) ? null : byFile.get(j.parentFile),
  }));

console.log(JSON.stringify({ rooms, uploads, generate, count: generate.length }, null, 1));
