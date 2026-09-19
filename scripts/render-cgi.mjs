/**
 * Renders the development's CGIs.
 *
 * The house is modelled parametrically from the architect's issued drawings
 * (sheets 26/1362/03 and /04), so every image is geometrically the building
 * being built rather than a stand-in. Because the model is parametric we can
 * render each room in every buyer-selectable finish combination, which is what
 * the interior explorer's variant manifest resolves against.
 *
 *   node scripts/render-cgi.mjs                 # everything
 *   node scripts/render-cgi.mjs --rooms kitchen # one room, all combinations
 *   node scripts/render-cgi.mjs --exterior-only
 *   node scripts/render-cgi.mjs --base-only     # one render per room
 *   node scripts/render-cgi.mjs --fresh         # rebuild the manifest from scratch
 */
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/assets/cgi');
const PORT = 8123;
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Rendered at twice the largest display size, then downsampled. The chain
// already runs SMAA, but supersampling on top is what keeps mullions, skirtings
// and grout lines from stippling at the sizes the site actually serves.
const ROOM_RENDER = { w: 3200, h: 2133 };
const ROOM_OUT = [1600, 1000, 640];
// Exteriors render to the aspect the view declares, at a fixed long edge.
const EXT_LONG_EDGE = 4400;
const EXT_OUT = [2800, 2000, 1280, 800];

function extSize(aspect) {
  const [aw, ah] = aspect;
  return aw >= ah
    ? { w: EXT_LONG_EDGE, h: Math.round((EXT_LONG_EDGE * ah) / aw) }
    : { h: EXT_LONG_EDGE, w: Math.round((EXT_LONG_EDGE * aw) / ah) };
}

const FINISHES = {
  kitchen: ['graphite', 'sage', 'oak', 'ivory'],
  walls: ['chalk', 'clay', 'slate'],
  doors: ['white', 'oak', 'grey'],
  floors: ['oak', 'smoked', 'grey', 'stone'],
  tiles: ['calacatta', 'capel', 'bardiglio', 'noir'],
  stairs: ['chamfered', 'oak', 'glass'],
};
const AXES = Object.keys(FINISHES);
const DEFAULTS = {
  kitchen: 'graphite',
  walls: 'chalk',
  doors: 'white',
  floors: 'oak',
  tiles: 'calacatta',
  stairs: 'chamfered',
};

/**
 * Which finish axes actually change a given room's render.
 *
 * Every axis a room does not carry is pinned to its default, which collapses
 * the matrix hard: without this, six axes would be 576 renders per room and
 * 8,640 in total. The manifest records the list so the site can tell "we have
 * no render for that" apart from "that choice does not change this room",
 * which would otherwise look the same to a visitor.
 *
 *   kitchen  only the kitchen has kitchen units in it.
 *   floors   the rooms with a boarded or carpeted floor. The wet rooms take
 *            their floor from the tile choice and the eaves stores are boarded
 *            out, so neither varies on it.
 *   tiles    the bathroom, both en-suites and the W/C.
 *   doors    pinned in the four wet rooms and the two stores, where the door
 *            is behind the camera and never appears in the picture.
 *   stairs   the hall and the two landings, which is everywhere a balustrade
 *            is in shot.
 */
const WET = ['wc', 'bath', 'ensuite', 'ensuite2'];
const STORES = ['store', 'store2'];
const WITH_STAIRS = ['hall', 'landing', 'landing2'];

function axesFor(roomKey) {
  const axes = ['walls'];
  if (roomKey === 'kitchen') axes.unshift('kitchen');
  if (!WET.includes(roomKey) && !STORES.includes(roomKey)) axes.push('doors');
  if (!WET.includes(roomKey) && !STORES.includes(roomKey)) axes.push('floors');
  if (WET.includes(roomKey)) axes.push('tiles');
  if (WITH_STAIRS.includes(roomKey)) axes.push('stairs');
  return axes;
}

/** Every combination of the axes this room varies on, defaults for the rest. */
function combinationsFor(roomKey) {
  const live = axesFor(roomKey);
  let out = [{ ...DEFAULTS }];
  for (const axis of live) {
    const next = [];
    for (const base of out) for (const value of FINISHES[axis]) next.push({ ...base, [axis]: value });
    out = next;
  }
  return out;
}

/** The manifest key for a combination, with the unused axes pinned. */
function keyFor(roomKey, finishes) {
  const live = axesFor(roomKey);
  return [roomKey, ...AXES.map((a) => (live.includes(a) ? finishes[a] : DEFAULTS[a]))].join('|');
}

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : null;
};

function serve() {
  const types = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.css': 'text/css',
  };
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent((req.url || '/').split('?')[0]);
    const file = path.join(ROOT, rel === '/' ? 'cgi/index.html' : rel);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    fs.readFile(file, (err, body) => {
      if (err) {
        res.writeHead(404);
        return res.end('not found');
      }
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    });
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

/** Pulls the rendered frame off the canvas as PNG bytes. */
async function grab(page) {
  const dataUrl = await page.evaluate('window.CGI.capture()');
  return Buffer.from(dataUrl.slice('data:image/png;base64,'.length), 'base64');
}

async function writeVariants(png, slug, widths, quality) {
  const base = sharp(png);
  const files = {};
  for (const w of widths) {
    const name = `${slug}-${w}.webp`;
    await base.clone().resize({ width: w, kernel: 'lanczos3' })
      .webp({ quality, effort: 6 }).toFile(path.join(OUT, name));
    files[w] = `/assets/cgi/${name}`;
  }
  return files;
}

const MANIFEST = path.join(OUT, 'manifest.json');

/** Reads the existing manifest so a partial run adds to it instead of replacing it. */
async function readManifest() {
  if (flag('fresh') || !fs.existsSync(MANIFEST)) return null;
  try {
    return JSON.parse(await fsp.readFile(MANIFEST, 'utf8'));
  } catch {
    return null;
  }
}

/** Writes the manifest, merged over whatever was already indexed. */
async function writeManifest(manifest) {
  const prev = await readManifest();
  const merged = prev
    ? {
        generated: manifest.generated,
        defaults: manifest.defaults ?? prev.defaults,
        axes: { ...prev.axes, ...(manifest.axes ?? {}) },
        exterior: { ...prev.exterior, ...manifest.exterior },
        rooms: { ...prev.rooms, ...manifest.rooms },
        variants: { ...prev.variants, ...manifest.variants },
      }
    : manifest;
  await fsp.writeFile(MANIFEST, `${JSON.stringify(merged, null, 2)}\n`);
  return merged;
}

async function main() {
  await fsp.mkdir(OUT, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.on('pageerror', (e) => console.error('  page error:', String(e)));

  await page.goto(`http://127.0.0.1:${PORT}/cgi/index.html`);
  await page.waitForFunction('window.__CGI_READY === true', null, { timeout: 60_000 });

  const manifest = {
    generated: new Date().toISOString(),
    defaults: DEFAULTS,
    axes: {},
    exterior: {},
    rooms: {},
    variants: {},
  };
  const started = Date.now();

  /* -------------------------------------------------------------- exterior */
  if (!flag('rooms') && !opt('rooms')) {
    const views = await page.evaluate('window.CGI.views');
    const aspects = await page.evaluate('window.CGI.viewAspects');
    for (const view of views) {
      const t0 = Date.now();
      const { w, h } = extSize(aspects[view] ?? [16, 9]);
      await page.evaluate(([v, vw, vh]) => window.CGI.renderExterior(v, vw, vh), [view, w, h]);
      manifest.exterior[view] = await writeVariants(await grab(page), `exterior-${view}`, EXT_OUT, 87);
      console.log(`  exterior/${view}  ${w}x${h}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  }
  if (flag('exterior-only')) {
    delete manifest.axes;
    const merged = await writeManifest(manifest);
    console.log(`\n${Object.keys(merged.exterior).length} exterior views indexed`);
    await browser.close();
    server.close();
    return;
  }

  /* -------------------------------------------------------------- interiors */
  const allRooms = await page.evaluate('window.CGI.rooms');
  const only = opt('rooms');
  const rooms = only ? only.split(',').map((s) => s.trim()) : allRooms;

  for (const room of rooms) {
    if (!allRooms.includes(room)) throw new Error(`Unknown room "${room}"`);
    manifest.axes[room] = axesFor(room);
    const combos = flag('base-only') ? [DEFAULTS] : combinationsFor(room);
    for (const finishes of combos) {
      const t0 = Date.now();
      const key = keyFor(room, finishes);
      // The slug names only the axes this room varies on, so a bedroom's file
      // is not stamped with a tile range that is not in the picture.
      const slug = `${room}--${axesFor(room).map((a) => finishes[a]).join('-')}`;
      await page.evaluate(
        ([r, f, w, h]) => window.CGI.renderRoom(r, f, w, h),
        [room, finishes, ROOM_RENDER.w, ROOM_RENDER.h],
      );
      manifest.variants[key] = await writeVariants(await grab(page), slug, ROOM_OUT, 88);
      const isDefault = AXES.every((a) => finishes[a] === DEFAULTS[a]);
      if (isDefault) manifest.rooms[room] = manifest.variants[key];
      console.log(`  ${slug}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  }

  const merged = await writeManifest(manifest);

  const total = Object.keys(merged.variants).length;
  console.log(`\n${total} interior renders indexed, ${Object.keys(merged.exterior).length} exterior views`);
  console.log(`Total ${((Date.now() - started) / 1000 / 60).toFixed(1)} min → public/assets/cgi/`);

  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
