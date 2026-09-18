/**
 * Development helper: renders a few rooms or exterior views straight to a
 * contact sheet, for judging lighting and framing without a full run.
 *
 *   node scripts/dev/preview.mjs living kitchen bath
 *   node scripts/dev/preview.mjs view:hero view:garden
 */
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PORT = 8244;
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = process.env.PREVIEW_OUT || '/tmp/preview.png';
const FINISHES = { kitchen: 'graphite', walls: 'chalk', doors: 'white' };

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('usage: node scripts/dev/preview.mjs <room|view:name> …');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent((req.url || '/').split('?')[0]));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (err, body) => {
    if (err) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'content-type': file.endsWith('.html') ? 'text/html' : 'text/javascript' });
    res.end(body);
  });
});
await new Promise((r) => server.listen(PORT, r));

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
page.on('pageerror', (e) => console.error('page error:', String(e)));
await page.goto(`http://127.0.0.1:${PORT}/cgi/index.html`);
await page.waitForFunction('window.__CGI_READY === true', null, { timeout: 60_000 });

const tiles = [];
for (const target of targets) {
  const t0 = Date.now();
  if (target.startsWith('view:')) {
    const view = target.slice(5);
    await page.evaluate(([v, w, h]) => window.CGI.renderExterior(v, w, h), [view, 1600, 900]);
  } else {
    await page.evaluate(([r, f, w, h]) => window.CGI.renderRoom(r, f, w, h), [target, FINISHES, 1400, 933]);
  }
  const url = await page.evaluate('window.CGI.capture()');
  const png = Buffer.from(url.slice('data:image/png;base64,'.length), 'base64');
  tiles.push(await sharp(png).resize(520, 347, { fit: 'cover' }).png().toBuffer());
  console.log(`  ${target}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

const cols = Math.min(2, tiles.length);
const cw = 524;
const ch = 351;
await sharp({
  create: {
    width: cols * cw,
    height: Math.ceil(tiles.length / cols) * ch,
    channels: 3,
    background: '#ffffff',
  },
})
  .composite(tiles.map((input, i) => ({ input, left: (i % cols) * cw, top: Math.floor(i / cols) * ch })))
  .png()
  .toFile(OUT);
console.log(`\n${OUT}`);

await browser.close();
server.close();
