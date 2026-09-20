/**
 * Downloads accepted generations into .photoreal/accepted.
 *
 *   node scripts/dev/photoreal-ingest.mjs results.json
 *
 * results.json is {"<slug>": "<url>"} — the display name each generation node
 * carries is its slug, which is what ties an artifact back to the selection it
 * answers to. Files land named by slug, which is what prepare-photoreal.mjs
 * looks for.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, '.photoreal/accepted');
fs.mkdirSync(OUT, { recursive: true });

const results = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let ok = 0;
const bad = [];

for (const [slug, url] of Object.entries(results)) {
  const res = await fetch(url);
  if (!res.ok) { bad.push(`${slug}: HTTP ${res.status}`); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  // A generation that came back the wrong shape is a generation that did not
  // do what it was told, and it would crop badly in a 3:2 frame.
  if (Math.abs(meta.width / meta.height - 1.5) > 0.02) {
    bad.push(`${slug}: ${meta.width}x${meta.height} is not 3:2`);
    continue;
  }
  fs.writeFileSync(path.join(OUT, `${slug}.jpg`), buf);
  ok += 1;
  console.log(`${slug}  ${meta.width}x${meta.height}  ${(buf.length / 1024).toFixed(0)}kB`);
}

console.log(`\n${ok} downloaded`);
if (bad.length) {
  console.log(`${bad.length} rejected:`);
  for (const b of bad) console.log(`  ${b}`);
  process.exitCode = 1;
}
