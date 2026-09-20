/**
 * Exports the reference renders the photoreal pass uploads.
 *
 * The renders ship as WebP, which the generation API may not accept, so each
 * one is written out as a high-quality JPEG under the job's slug.
 *
 *   node scripts/photoreal-refs.mjs [outDir]
 *
 * Defaults to .photoreal/refs, which is gitignored — these are derived files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photorealChain } from '../cgi/photoreal/jobs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(ROOT, process.argv[2] ?? '.photoreal/refs');

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public/assets/cgi/manifest.json'), 'utf8'),
);

fs.mkdirSync(OUT, { recursive: true });

// Only the chain roots come from a render. Everything else is an edit of an
// image that already exists, so exporting a reference for it would be 255
// JPEGs nothing reads.
const jobs = photorealChain().filter((j) => j.depth === 0);
const missing = jobs.filter((j) => !manifest.variants[j.reference]);
if (missing.length) {
  console.error(`${missing.length} job(s) reference a render that does not exist:`);
  for (const j of missing) console.error(`  - ${j.slug} wants ${j.reference}`);
  process.exit(1);
}

let written = 0;
for (const job of jobs) {
  const src = path.join(ROOT, 'public', manifest.variants[job.reference]['1600']);
  const dest = path.join(OUT, `${job.slug}.jpg`);
  const info = await sharp(src).jpeg({ quality: 95, chromaSubsampling: '4:4:4' }).toFile(dest);
  written += 1;
  console.log(`${job.slug}.jpg  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}kB`);
}

console.log(`\n${written} reference images in ${path.relative(ROOT, OUT)}`);
console.log(`${jobs.length} chain roots, one per room`);
