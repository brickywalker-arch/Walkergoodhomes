# Walker Good Homes — Plots 1 & 2, Hoyle Ing

Marketing and buyer-portal website for **Walker Good Homes Ltd**, selling two
new-build homes on *Land Adjacent 2 Hoyle Ing, Linthwaite, Huddersfield,
HD7 5RX* (architect's Building Regulations set 26/1362).

It serves two audiences on one page: prospective buyers exploring the plots,
the drawings, the interior and the specification; and reserved buyers following
their build behind an access code at `/buyers`.

## Running it

```bash
npm install
cp .env.example .env.local     # then fill in what you need
npm run dev                    # http://localhost:3000
```

```bash
npm run build && npm start     # production
npm run check                  # typecheck + lint + asset coverage
```

Nothing in `.env.local` is needed to browse the site. Enquiries work without
it too — they are appended to `LEADS_DIR` — but see **Enquiries** below before
going live.

## The CGIs

Every image of the homes on this site is **rendered from a parametric model of
the building**, built to the dimensions on the architect's issued sheets:

| From | Used for |
|---|---|
| Sheet 26/1362/03 (floor plans, A1 at 1:50) | room sizes, positions, window and door openings |
| Sheet 26/1362/04 (section, A3 at 1:50) | storey heights (0 / 2.695 / 5.390 m), wall plate at 5.470 m, 40° pitch |
| Sheet 26/1362/05 (elevations, A2 at 1:100) | stone coursing, slate roof, the step in roof level between the two plots |

Because the model is parametric rather than drawn by hand, each room can be
rendered in **every finish combination the buyer can select** — so the image a
visitor sees is a render of their own choice, not a stand-in.

```bash
npm run cgi:sheets    # rasterise the six PDF sheets to WebP
npm run cgi:render    # render the CGIs (about 10 minutes)
npm run verify:assets # assert every selection resolves to a render
npm run assets        # all three
```

`verify:assets` walks all 15 rooms × 36 finish selections and checks each one
resolves to a render that exists on disk — the interior explorer's promise only
holds if it does.

`cgi:render` builds the scene with Three.js and captures it through headless
Chromium, writing WebP at three widths plus `manifest.json`:

- **162 interior renders** — 15 rooms; the kitchen across all 4 × 3 × 3
  unit/wall/door combinations, every other room across the 3 × 3 wall/door
  combinations that are visible from inside it.
- **8 exterior views** — `hero`, `frontage`, `garden`, `street`, a landscape
  and a portrait composition for each plot.

Useful flags:

```bash
node scripts/render-cgi.mjs --rooms kitchen,living   # just these rooms
node scripts/render-cgi.mjs --base-only              # one render per room
node scripts/render-cgi.mjs --exterior-only
node scripts/render-cgi.mjs --fresh                  # rebuild the manifest from scratch
```

The manifest is an incremental index, so a partial run adds to it rather than
replacing it. `src/lib/cgi.ts` resolves a room plus a selection against it,
pinning the finish axes that are not visible in that room to the render's own
defaults — choosing sage kitchen units still resolves the exact render for a
bedroom, because the kitchen colour cannot be seen from in there.

To change the model, edit `cgi/scene/`: `rooms.mjs` (room sets, cameras),
`exterior.mjs` (the pair and its setting), `materials.mjs` (finish palettes),
`kit.mjs` (walls, openings, joinery, furniture), `stage.mjs` (lighting and
procedural textures). `cgi/index.html` is the render stage the driver drives.

### Render quality

The look comes from four things, and all of them matter — drop any one and it
goes back to reading like a box model:

- **Image-based lighting.** A pre-filtered environment gives every surface soft
  directional fill and a reflection. Interiors use a neutral sky-and-floor
  environment; give them the garden instead and every ceiling picks up a green
  cast off the lawn.
- **Ground-truth ambient occlusion.** Contact shadow in every corner, under
  every worktop and around every skirting. The AO radius scales with the room —
  a 1 m W/C needs a far tighter radius than a 5 m living room.
- **Normal maps derived from the colour maps.** Stone coursing, slate laps,
  board joints and grout lines catch the light as relief rather than as a
  printed pattern.
- **Supersampling.** Rendered at twice the largest size served and downsampled,
  on top of SMAA.

The surface textures cost more to generate than a frame does to render, so they
are cached across the run — without that, redrawing them for all 162 renders
dominates the whole thing.

### Drawing previews

The six sheets are rasterised to WebP at build time and shown inline; the PDF
stays the "open full size" target. Nothing is rasterised in the browser — an
`<object>` embed renders blank in-app, and pdf.js locks the main thread on the
A1 sheet.

## Enquiries

`POST /api/enquiry` validates server-side, then writes to **three sinks**:

1. **Disk** — appended as JSONL to `LEADS_DIR` (`.data` by default).
2. **Netlify Blobs** — on Netlify only, where a function's filesystem does not
   survive a redeploy. Needs no extra account or key.
3. **Email** — sent via Resend when `RESEND_API_KEY` and `LEAD_FROM_EMAIL` are
   set.

A lead counts as captured if any sink accepted it. If all of them fail the
route answers 503 and the form tells the visitor to email directly, rather than
saying "sent" over a lost enquiry.

The visitor's finish selections are submitted with the enquiry, so Michael
knows what they were looking at.

Protections: a honeypot field, a minimum time-to-submit, and a per-IP sliding
window (in-process — behind more than one instance, put a shared limiter at the
edge).

`POST /api/visit` books one of the published site-visit slots against the
reference the enquiry returned.

> **On an ephemeral filesystem** (most serverless platforms) the disk sink does
> not survive a redeploy. On Netlify the Blobs sink covers this. Elsewhere,
> configure email delivery, point `LEADS_DIR` at a mounted volume, or add a
> sink in `src/lib/leads.ts`.

See [DEPLOY.md](DEPLOY.md) for the hosting setup and what to switch on.

## Reserved buyers

`/buyers` is gated by an access code. It needs **both** `BUYER_ACCESS_CODE` and
a `BUYER_SESSION_SECRET` of at least 32 characters; without them it stays
closed and says so rather than letting anyone in. Sign-in sets a short
HMAC-signed httpOnly cookie (12 hours). The code is compared in constant time.

Build status comes from `src/data/buyers.ts`. In service that should come from
wherever site progress is actually recorded.

## Layout

```
cgi/               the CGI model and render stage
  scene/           materials, kit, rooms, exterior, stage
  index.html       render stage the headless driver loads
scripts/
  render-cgi.mjs   renders the CGIs
  render-sheets.mjs rasterises the architect's PDFs
  verify-assets.mjs asserts every selection resolves to a render
  dev/             preview, screenshot and contact-sheet helpers
src/
  app/             routes, API handlers, global styles
  components/      page sections
  data/            content read off the drawings; nothing invented
  lib/             CGI resolver, lead handling, buyer sessions
public/assets/
  brand/ pdf/      logo and the six issued sheets
  cgi/             rendered CGIs + manifest.json
  sheets/          rasterised drawing previews + manifest.json
reference/         design handoff, its screenshots, and the client's own
                   supplied imagery (not served — see its README)
```

## Design

Keeps the **Industry** design system's structure — square corners, hairline
rules, `+` registration marks on framed plates, Barlow Condensed headings over
Barlow body, modular grids, spec-sheet register tables — over the **Walker Good
Homes navy-and-gold** palette. Tokens are in `src/app/globals.css`.

Fully fluid, with no media queries: `clamp()` for type and spacing,
`repeat(auto-fit, minmax(min(100%, Npx), 1fr))` for every grid. Phone
rendering is the priority: tap targets at 44 px minimum and form inputs at
16 px so iOS does not zoom on focus.

## Content rules

Non-negotiables established with the client, and the reason the data modules
read the way they do:

1. Logo first, then the coming-soon development — that order opens the page.
2. Everything factual comes off sheets 26/1362/01–06. Nothing invented.
3. Unconfirmed means unconfirmed — buyer-choice items say "to be confirmed
   with buyer".
4. The homes are three storeys, three bedrooms, two en-suites plus a family
   bathroom.
5. The plots are a **handed pair**, never higher/lower.
6. Images are labelled honestly: computer-generated, from the drawings,
   furniture illustrative.
7. Tone is restrained — plain English, no exclamation, no emoji.
