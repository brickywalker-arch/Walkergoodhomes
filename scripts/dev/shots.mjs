/**
 * Development helper: screenshots the running site section by section and
 * exercises the interactive parts, reporting any page errors it saw.
 *
 * Sections are captured at the viewport rather than with fullPage, because a
 * fullPage capture of a long page with a sticky header re-composites that
 * header into the middle of the image.
 *
 *   npx next start -p 3210 &  node scripts/dev/shots.mjs
 */
import { chromium } from 'playwright-core';

const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const base = process.env.BASE_URL || 'http://127.0.0.1:3210';
const out = process.env.SHOT_DIR || '/tmp';

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
const errs = [];

function watch(page, name) {
  page.on('pageerror', (e) => errs.push(`${name}: ${e}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(`${name} console: ${m.text()}`);
  });
  page.on('requestfailed', (r) => errs.push(`${name} request failed: ${r.url()}`));
}

/** Captures each named section at the viewport on one page load. */
async function tour(label, viewport, sections, actions) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  watch(page, label);
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  if (actions) await actions(page);
  for (const [name, selector] of sections) {
    if (selector) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -84)); // clear the sticky header
    } else {
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${out}/shot-${label}-${name}.png` });
  }
  await page.close();
}

async function single(name, url, viewport, actions) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  watch(page, name);
  await page.goto(base + url, { waitUntil: 'networkidle' });
  if (actions) await actions(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/shot-${name}.png`, fullPage: true });
  await page.close();
}

const SECTIONS = [
  ['top', null],
  ['plots', '#plots'],
  ['drawings', '#drawings'],
  ['inside', '#inside'],
  ['spec', '#spec'],
  ['buyers', '#buyers'],
  ['enquire', '#enquire'],
  ['footer', 'footer'],
];

await tour('desktop', { width: 1440, height: 1000 }, SECTIONS);
await tour('mobile', { width: 390, height: 844 }, SECTIONS);

// The interior explorer, driven: second floor, sage units, oak doors.
await tour('explorer', { width: 1440, height: 1250 }, [['second', '#inside']], async (page) => {
  await page.locator('#inside').scrollIntoViewIfNeeded();
  await page.getByRole('tab', { name: 'SECOND FLOOR' }).click();
  await page.getByRole('button', { name: /^Sage$/ }).click();
  await page.getByRole('button', { name: /Oak veneer/ }).click();
  await page.waitForTimeout(900);
});

await tour('explorer-kitchen', { width: 1440, height: 1250 }, [['kitchen', '#inside']], async (page) => {
  await page.locator('#inside').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /^KITCHEN/ }).first().click();
  await page.getByRole('button', { name: /Light oak/ }).click();
  await page.getByRole('button', { name: /Warm clay/ }).click();
  await page.waitForTimeout(900);
});

// The enquiry form, submitted end to end.
await tour('enquiry-sent', { width: 1440, height: 1100 }, [['confirm', '#enquire']], async (page) => {
  await page.locator('#enquire').scrollIntoViewIfNeeded();
  await page.getByPlaceholder('Full name').fill('Test Buyer');
  await page.getByPlaceholder('you@email.com').fill('test@example.com');
  await page.getByRole('button', { name: 'Plot 1', exact: true }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Send my enquiry/i }).click();
  await page.getByText(/Thank you,/).waitFor({ timeout: 15_000 });
  await page.getByRole('button', { name: /Sat 26 Sep · 11:30/ }).click();
  await page.getByText(/confirmed — meet at the site gate/).waitFor({ timeout: 15_000 });
  await page.waitForTimeout(400);
});

await single('privacy', '/privacy', { width: 1440, height: 1000 });
await single('buyers-signin', '/buyers', { width: 1440, height: 1000 });

// The buyer portal behind the access code, if one is configured. Each page
// gets its own browser context, so both captures sign in for themselves.
if (process.env.BUYER_ACCESS_CODE) {
  const signIn = async (page) => {
    await page.getByPlaceholder('From your reservation agreement').fill(process.env.BUYER_ACCESS_CODE);
    await page.getByRole('button', { name: /^Sign in$/i }).click();
    await page.getByText(/Roof stage/).waitFor({ timeout: 15_000 });
    await page.waitForTimeout(400);
  };
  await single('buyers-portal', '/buyers', { width: 1440, height: 1000 }, signIn);
  await single('buyers-portal-mobile', '/buyers', { width: 390, height: 844 }, signIn);
}

console.log(errs.length ? `ERRORS:\n${errs.join('\n')}` : 'no page errors');
await browser.close();
