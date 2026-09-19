/**
 * Prepares the development's exterior visual for the web.
 *
 * Two sources exist, and the second is derived from the first.
 *
 * `reference/client-supplied/hero-exterior.png` is the client's approved
 * marketing banner: the exterior visual on the left, and a navy panel on the
 * right carrying the logo, the headline and the contact strip, with
 * "COMING SOON / PLOTS 1 & 2" set over the bottom of the photograph itself.
 * None of that overlay can appear on the site, so PLATE lifts the clean plate
 * out from inside the gold frame and above the caption. That plate is only
 * 864 px wide, so every size the hero serves is an upscale of it.
 *
 * `reference/generated/hero-exterior-stone.jpg` is that same approved
 * composition re-rendered at 5056 x 3392 to carry real Marshalls 'Epoch'
 * stone coursing — the walling the homes are actually being built in — rather
 * than the soft blocks an 864 px upscale can manage. It is the source the site
 * uses. It changes no part of the composition the client approved: same two
 * homes, same handing, same drive, same dusk light.
 *
 * Two things the re-render introduced are removed again below. It put a
 * manufacturer's name across the bonnet of the left-hand car and it invented
 * two registrations. Neither is ours to publish, so ANONYMISE blurs them out.
 *
 *   node scripts/prepare-photo.mjs
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BANNER = path.join(ROOT, 'reference/client-supplied/hero-exterior.png');
const STONE = path.join(ROOT, 'reference/generated/hero-exterior-stone.jpg');
const OUT = path.join(ROOT, 'public/assets/photo');

/** The clean photograph inside the banner's gold frame, above the caption. */
const PLATE = { left: 24, top: 102, width: 864, height: 552 };

/** The stone re-render is already a clean plate, so it is used whole. */
const STONE_SIZE = { width: 5056, height: 3392 };

/**
 * Regions of the stone plate to blur out, in its own pixels.
 *
 * A badge the re-render put on a car and the two registrations it made up.
 * Real plates and real marques belong to real people, and these are neither —
 * they are noise the upscaler added to a picture of two houses.
 */
const ANONYMISE = [
  { what: 'bonnet badge', left: 1450, top: 2298, width: 430, height: 66 },
  { what: 'near plate', left: 1522, top: 2462, width: 268, height: 70 },
  { what: 'far plate', left: 3904, top: 3024, width: 266, height: 70 },
];

/**
 * Portrait crops for the plot cards, 4:5 and the full height of the plate.
 * Plot 1 is the left-hand home, plot 2 the right-hand home stepped down the
 * slope — the handed pair, each with its own door and drive.
 *
 * Held as fractions of the plate so the same figures cut either source: the
 * banner plate is 1.565:1 and the stone plate 1.491:1, so a pixel box measured
 * on one lands in the wrong place on the other.
 */
const CARD_ASPECT = 4 / 5;
const CARDS = [
  { slug: 'plot-1', centre: 0.335 },
  { slug: 'plot-2', centre: 0.668 },
];

const HERO_WIDTHS = [864, 1300, 1728, 2400];
const CARD_WIDTHS = [442, 884, 1326];

async function emit(pipeline, slug, widths, native) {
  const files = {};
  for (const w of widths) {
    const name = `${slug}-${w}.webp`;
    let img = pipeline.clone().resize({ width: w, kernel: 'lanczos3' });
    // Upscaling softens; a light sharpen holds it together. Downsampling from
    // the stone plate needs none, and sharpening it only adds crunch.
    if (w > native) img = img.sharpen({ sigma: 0.7, m1: 0.4, m2: 0.9 });
    await img.webp({ quality: 88, effort: 6 }).toFile(path.join(OUT, name));
    files[w] = `/assets/photo/${name}`;
  }
  return files;
}

/** Blurs each ANONYMISE box in place and returns the flattened PNG buffer. */
async function anonymise(buf) {
  const patches = [];
  for (const box of ANONYMISE) {
    const region = { left: box.left, top: box.top, width: box.width, height: box.height };
    // Blur at a fraction of the size and scale back, which flattens lettering
    // completely rather than leaving a legible ghost under a gaussian. The two
    // resizes have to be separate pipelines: sharp applies one resize per
    // pipeline, so chaining them silently keeps only the second.
    const small = Math.max(3, Math.round(box.width / 26));
    const tiny = await sharp(buf)
      .extract(region)
      .resize({ width: small, kernel: 'lanczos3' })
      .png()
      .toBuffer();
    const patch = await sharp(tiny)
      .resize({ width: box.width, height: box.height, kernel: 'cubic' })
      .blur(6)
      .png()
      .toBuffer();
    patches.push({ input: patch, left: box.left, top: box.top });
    console.log(`  blurred ${box.what}  ${box.width}x${box.height} at ${box.left},${box.top}`);
  }
  return sharp(buf).composite(patches).png().toBuffer();
}

/** The plate the site is built from, plus where it came from. */
async function sourcePlate() {
  const hasStone = await fs
    .access(STONE)
    .then(() => true)
    .catch(() => false);

  if (!hasStone) {
    console.warn(`! ${path.relative(ROOT, STONE)} is missing — falling back to the banner plate.`);
    const meta = await sharp(BANNER).metadata();
    if (meta.width !== 1774 || meta.height !== 887) {
      console.warn(`! the banner is ${meta.width}x${meta.height}, not the 1774x887 PLATE was measured against.`);
    }
    return {
      buf: await sharp(BANNER).extract(PLATE).png().toBuffer(),
      native: { width: PLATE.width, height: PLATE.height },
      source: 'reference/client-supplied/hero-exterior.png',
    };
  }

  const meta = await sharp(STONE).metadata();
  if (meta.width !== STONE_SIZE.width || meta.height !== STONE_SIZE.height) {
    console.warn(
      `! the stone plate is ${meta.width}x${meta.height}, not the ${STONE_SIZE.width}x${STONE_SIZE.height} ` +
        'the ANONYMISE boxes were measured against. Re-measure them before trusting this output.',
    );
  }
  return {
    buf: await anonymise(await sharp(STONE).png().toBuffer()),
    native: { width: meta.width, height: meta.height },
    source: 'reference/generated/hero-exterior-stone.jpg',
  };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  const plate = await sourcePlate();
  const { width: pw, height: ph } = plate.native;

  const manifest = {
    generated: new Date().toISOString(),
    source: plate.source,
    approved: 'reference/client-supplied/hero-exterior.png',
    native: plate.native,
    images: {},
  };

  manifest.images.hero = await emit(sharp(plate.buf), 'exterior-dusk', HERO_WIDTHS, pw);
  console.log(`  exterior-dusk  ${pw}x${ph} native → ${HERO_WIDTHS.length} widths`);

  const cardW = Math.round(ph * CARD_ASPECT);
  for (const card of CARDS) {
    const left = Math.min(Math.max(0, Math.round(card.centre * pw - cardW / 2)), pw - cardW);
    const buf = await sharp(plate.buf)
      .extract({ left, top: 0, width: cardW, height: ph })
      .png()
      .toBuffer();
    manifest.images[card.slug] = await emit(sharp(buf), card.slug, CARD_WIDTHS, cardW);
    console.log(`  ${card.slug}  ${cardW}x${ph} native at x=${left} → ${CARD_WIDTHS.length} widths`);
  }

  await fs.writeFile(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('\nWrote public/assets/photo/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
