/**
 * Rasterises the architect's issued PDF sheets to WebP at build time.
 *
 * The handoff is explicit that browser-side rasterising is not an option: an
 * <object> embed renders blank in-app and pdf.js hangs the main thread on the
 * A1 floor-plan sheet. So the sheets become images here, once, and the PDF
 * stays the "open full size" target.
 */
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const PDF_DIR = path.join(process.cwd(), 'public/assets/pdf');
const OUT_DIR = path.join(process.cwd(), 'public/assets/sheets');

// Scale is per-sheet: an A1 at 1:50 carries far more line work than an A4 at
// 1:1250, so it gets more pixels rather than one scale flattening them all.
const SHEETS = [
  { file: '01-location-plan.pdf', slug: '01-location-plan', scale: 2.4 },
  { file: '02-existing-block-plan.pdf', slug: '02-existing-block-plan', scale: 2.4 },
  { file: '03-floor-plans.pdf', slug: '03-floor-plans', scale: 1.5 },
  { file: '04-section.pdf', slug: '04-section', scale: 2.0 },
  { file: '05-elevations.pdf', slug: '05-elevations', scale: 1.8 },
  { file: '06-block-plan.pdf', slug: '06-block-plan', scale: 2.4 },
];

const WIDTHS = [640, 1280, 2048];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const manifest = [];

  for (const sheet of SHEETS) {
    const doc = await pdf(path.join(PDF_DIR, sheet.file), { scale: sheet.scale });
    let page = 1;
    for await (const buffer of doc) {
      if (page > 1) break; // every sheet is a single page
      const base = sharp(buffer).flatten({ background: '#ffffff' });
      const { width, height } = await base.metadata();

      const sizes = [];
      for (const w of WIDTHS) {
        if (w > width * 1.05) continue;
        const out = `${sheet.slug}-${w}.webp`;
        await base.clone().resize({ width: w }).webp({ quality: 88 }).toFile(path.join(OUT_DIR, out));
        sizes.push({ width: w, file: `/assets/sheets/${out}` });
      }
      // Always emit a full-resolution copy so a sheet narrower than the
      // smallest breakpoint still has an image to show.
      const full = `${sheet.slug}-full.webp`;
      await base.clone().webp({ quality: 90 }).toFile(path.join(OUT_DIR, full));

      manifest.push({
        slug: sheet.slug,
        width,
        height,
        aspect: +(width / height).toFixed(4),
        full: `/assets/sheets/${full}`,
        sizes,
      });
      console.log(`  ${sheet.slug}  ${width}×${height}  → ${sizes.length + 1} images`);
      page += 1;
    }
  }

  await fs.writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
  console.log(`\nWrote ${manifest.length} sheets to public/assets/sheets/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
