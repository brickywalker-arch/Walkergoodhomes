/**
 * Prepares the client's approved exterior visual for the web.
 *
 * `reference/client-supplied/hero-exterior.png` is a finished marketing banner:
 * the exterior visual on the left, and a navy panel on the right carrying the
 * logo, the headline and the contact strip, with "COMING SOON / PLOTS 1 & 2"
 * set over the bottom of the photograph itself.
 *
 * None of that overlay can appear on the site, so this lifts the clean plate
 * out from inside the gold frame and above the caption, then cuts the
 * portrait compositions the two plot cards need. The crop box is fixed
 * because the source is a fixed 1774 x 887 banner — if a new banner is
 * supplied at a different size, re-measure PLATE below.
 *
 *   node scripts/prepare-photo.mjs
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'reference/client-supplied/hero-exterior.png');
const OUT = path.join(ROOT, 'public/assets/photo');

/** The clean photograph inside the banner's gold frame, above the caption. */
const PLATE = { left: 24, top: 102, width: 864, height: 552 };

/**
 * Portrait crops for the plot cards, 4:5 and height-limited by the plate.
 * Plot 1 is the left-hand home, plot 2 the right-hand home stepped down the
 * slope — the handed pair, each with its own door and drive.
 */
const CARD = { width: 442, height: PLATE.height };
const CARDS = [
  { slug: 'plot-1', left: 60 },
  { slug: 'plot-2', left: 380 },
];

/**
 * The plate is 864px wide, so anything larger is an upscale. A 2x Lanczos
 * upscale with a light sharpen holds up on the hero, which is full-bleed
 * behind a gradient; beyond that it only softens. A clean, full-resolution
 * plate from the client would let these go further.
 */
const HERO_WIDTHS = [864, 1300, 1728];
const CARD_WIDTHS = [442, 884];

async function emit(pipeline, slug, widths, native) {
  const files = {};
  for (const w of widths) {
    const name = `${slug}-${w}.webp`;
    let img = pipeline.clone().resize({ width: w, kernel: 'lanczos3' });
    if (w > native) img = img.sharpen({ sigma: 0.7, m1: 0.4, m2: 0.9 });
    await img.webp({ quality: 90, effort: 6 }).toFile(path.join(OUT, name));
    files[w] = `/assets/photo/${name}`;
  }
  return files;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  const meta = await sharp(SRC).metadata();
  if (meta.width !== 1774 || meta.height !== 887) {
    console.warn(
      `! ${path.basename(SRC)} is ${meta.width}x${meta.height}, not the 1774x887 this crop box was measured against.`,
    );
    console.warn('  Re-measure PLATE in this script before trusting the output.');
  }

  const plate = sharp(SRC).extract(PLATE);
  const plateBuf = await plate.png().toBuffer();

  const manifest = {
    generated: new Date().toISOString(),
    source: 'reference/client-supplied/hero-exterior.png',
    native: { width: PLATE.width, height: PLATE.height },
    images: {},
  };

  manifest.images.hero = await emit(sharp(plateBuf), 'exterior-dusk', HERO_WIDTHS, PLATE.width);
  console.log(`  exterior-dusk  ${PLATE.width}x${PLATE.height} native → ${HERO_WIDTHS.length} widths`);

  for (const card of CARDS) {
    const buf = await sharp(plateBuf)
      .extract({ left: card.left, top: 0, width: CARD.width, height: CARD.height })
      .png()
      .toBuffer();
    manifest.images[card.slug] = await emit(sharp(buf), card.slug, CARD_WIDTHS, CARD.width);
    console.log(`  ${card.slug}  ${CARD.width}x${CARD.height} native → ${CARD_WIDTHS.length} widths`);
  }

  await fs.writeFile(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('\nWrote public/assets/photo/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
