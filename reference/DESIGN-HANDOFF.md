# Handoff: Walker Good Homes — Hoyle Ing development website

## Overview

A single-page marketing and buyer-portal website for **Walker Good Homes Ltd**, selling two
new-build homes on *Land Adjacent 2 Hoyle Ing, Linthwaite, Huddersfield, HD7 5RX*
(planning/Building Regs drawing set 26/1362). It serves two audiences on one page:

1. **Prospective buyers** — explore the two plots, read the architect's drawings, walk the
   interior room by room, read the specification, register interest and book a site visit.
2. **Reserved buyers** — a "follow your build" section with stage progress, a build timeline
   and document/payment tiles (presentational in this design; not yet an authenticated area).

It is desktop-and-mobile fluid, but was explicitly briefed to **look excellent on a phone**.

## About the design files

The files in `design/` are **design references created in HTML** — prototypes showing the
intended look, copy and behaviour. They are *not* production code to lift wholesale.

They are authored in a bespoke in-house "Design Component" (DC) format: a `.dc.html` file
containing a template (with `{{ hole }}` interpolation, `<sc-for>`, `<sc-if>`) plus a
`class Component extends DCLogic` logic class, driven by the bundled `support.js` runtime.
**Do not try to adopt that runtime.** Treat each `.dc.html` as a spec: the template is the
markup and inline styling, the logic class is the state, data and event handlers.

The task is to **recreate these designs in the target codebase's own environment** — React,
Next.js, Vue, Astro, plain templated HTML, whatever the project already uses — following its
established component patterns, routing and styling conventions. If no codebase exists yet,
this design maps very cleanly onto a static-first framework (Next.js or Astro) since almost
everything is content; only the interior explorer and the enquiry form need client JS.

## Fidelity

**High fidelity.** Colours, typography, spacing, copy and interaction states are final and
exact. Recreate pixel-for-pixel. Every value is listed in *Design tokens* below and appears
inline in the source. Two known content gaps, flagged in the UI itself and not defects:

- Interior CGIs are **preview resolution** (540–930 px stills recovered from an earlier sales
  pack). High-resolution renders are to be supplied and swapped in.
- Per-colourway renders do not exist yet; the finishes switcher resolves a variant path and
  falls back to the base image (see *Interior explorer*).

## Design system

The project is bound to an in-house design system called **Industry** — a technical /
blueprint wireframe language: square corners, hairline borders, `+` registration marks at the
corners of framed objects, Barlow Condensed headings over Barlow body, duotoned photography.
Its stylesheet and bundle are included at `design/_ds/industry-…/`
(`styles.css` carries the tokens as `--color-*`, `--font-*`, `--space-*`).

**Important:** this site does *not* use Industry's steel-blue palette. It keeps Industry's
**structure** (square corners, hairline rules, corner marks, condensed headings, modular grid,
spec-sheet register tables) but substitutes the **Walker Good Homes navy-and-gold** brand
palette. Preserve that combination. The one Industry idiom used verbatim is the corner mark:
four absolutely-positioned `+` glyphs on framed plates (`.mk` in the source).

## Screens / views

It is one scrolling page, `#top`, with sticky header nav anchoring to six sections.

### 1. Sticky header

- `position: sticky; top: 0; z-index: 40`, background `rgba(6,34,58,.96)` with
  `backdrop-filter: blur(10px)`, bottom border `1px solid rgba(239,207,145,.22)`.
- Inner `.wrap` (max-width 1220px, padding `0 clamp(18px,4vw,40px)`), `min-height: 76px`,
  flex, space-between, `gap: 20px`, wraps on narrow screens.
- Left: the logo image, `height: clamp(40px,4.6vw,52px)`, links to `#top`.
- Right: nav links at `600 9.5px Barlow`, `letter-spacing: .14em`, colour `#dbe4ea`,
  `gap: clamp(12px,2vw,26px)`: PLOTS 1 & 2, DRAWINGS, INSIDE, SPECIFICATION,
  RESERVED BUYERS — then a gold `REGISTER INTEREST` button (`min-height: 42px`).

### 2. Hero (`<section>` on `#041a2d`)

Ordered deliberately: **logo first, then what's coming**.

1. Centred brand block: logo `width: min(100%,540px)` (needs `max-width: none` — the design
   system's global `img { max-width: 100% }` otherwise blocks the upscale); a gold hairline
   divider `linear-gradient(90deg,transparent,rgba(239,207,145,.65),transparent)`,
   `max-width: 640px`; eyebrow `Coming soon`; `<h1>` *Plots 1 & 2, Hoyle Ing / Linthwaite,
   Huddersfield* at `clamp(34px,5.2vw,64px)`; lead paragraph, `max-width: 56ch`, centred.
2. Full-bleed exterior photograph: wrapper `aspect-ratio: 16/9; max-height: 620px;
   overflow: hidden`, image at `width: 204%; margin-left: -2%; margin-top: -20%;
   max-width: none` — this crop deliberately pushes the banner's own baked-in logo, headline
   and gold CTA strip out of frame, leaving only the photograph. A bottom gradient
   `linear-gradient(180deg,rgba(4,26,45,.18),rgba(4,26,45,0) 42%,rgba(4,26,45,.9))` carries
   the `Coming soon · Plots 1 & 2 · Hoyle Ing, Linthwaite` eyebrow.
   *If a clean photograph without the overlay is supplied, use it and drop the crop maths.*
3. Below the image: `<h2>` *Beautiful homes. / Built with purpose.* at `clamp(40px,5.8vw,76px)`
   beside a lead paragraph and two CTAs (gold `REGISTER YOUR INTEREST`, outline
   `VIEW THE DRAWINGS`).
4. A four-cell quick-nav strip on `#06223a`, `grid-template-columns: repeat(auto-fit,
   minmax(min(100%,190px),1fr))`, cells separated by `1px solid rgba(255,255,255,.12)`,
   each with a gold `01`–`04` in Barlow Condensed 26px over a `600 9.5px` label:
   EXPLORE PLOTS 1 & 2 / ARCHITECT DRAWINGS / STEP INSIDE THE HOME / REGISTER YOUR INTEREST.

### 3. `#plots` — the development

- Two-column intro (`.two`: `repeat(auto-fit,minmax(min(100%,300px),1fr))`,
  `gap: clamp(20px,3.5vw,54px)`): `<h2>` *Two homes. One carefully considered site.* left;
  right, a paragraph citing the real figures (5.47 × 9.49 m footprint each, three storeys,
  Marshalls 'Epoch' stone coursing, piled foundations, 40° pitched roof) plus a bordered
  cream note plate (`#fbf8f2`, `1px solid #d8cfbf`, corner marks) stating the exterior
  reference is locked — no generic CGI substitutions.
- Two plot cards, `aspect-ratio: 4/5`, each a differently-aimed crop of the same exterior
  photograph (`width: 454.5%`; plot 1 `margin-left: -22.7%; margin-top: -27.3%`,
  plot 2 `-111.4% / -34.1%`), gradient
  `linear-gradient(180deg,rgba(4,26,45,0) 34%,rgba(4,26,45,.93))`, gold corner marks, and
  bottom-anchored copy: kicker (*Plot 1 · Left-hand home* / *Plot 2 · Right-hand home,
  handed*), `Home 01`/`Home 02` at `clamp(30px,3.6vw,42px)`, a meta line and a state-dependent
  CTA (`SEE THE DETAIL →` / `SHOWING BELOW`). **Clicking a card selects that plot.**
- A five-cell fact strip, cells `#fbf8f2` on a `#d8cfbf` 1px grid: `3` bedrooms · `Three`
  storeys · `2 + 1` en-suites + bathroom · `5.47 × 9.49 m` footprint per plan · `Freehold`
  tenure. Below it: `SHOWING: Plot 1 · the left-hand home` (or *the right-hand home, the same
  plan handed*).

Plot 2 is the same plan **handed** — never describe them as higher/lower.

### 4. `#drawings` — the architect's drawing register

Background `#fbf8f2`, hairline top and bottom borders.

`<h2>` *See exactly what we're building.* over a lead paragraph, then a **register table** —
not a viewer. Six rows, `grid-template-columns: auto minmax(0,1fr) auto`,
`gap: clamp(14px,2.5vw,28px)`, `min-height: 64px`, `border-bottom: 1px solid #d8cfbf`
(register's own top border `1px solid #06223a`), row hover `rgba(11,52,84,.05)`. Each row:
gold sheet number, then title in Barlow Condensed `clamp(23px,2.6vw,30px)` with a
`400 12.5px` meta line, then `OPEN ↗` in gold. Each row is an `<a target="_blank">` to the PDF.

| # | Title | Meta | File |
|---|---|---|---|
| 01 | Location plan | Dwg 26/1362/01 · A4 at 1:1250 · the site in its street | `01-location-plan.pdf` |
| 02 | Existing block plan | Dwg 26/1362/02 · A4 at 1:500 · the land as it stands | `02-existing-block-plan.pdf` |
| 03 | Proposed floor plans | Dwg 26/1362/03 · A1 at 1:50 · all three storeys, both plots | `03-floor-plans.pdf` |
| 04 | Proposed section | Dwg 26/1362/04 · A3 at 1:50 · floor-to-floor build-up | `04-section.pdf` |
| 05 | Proposed elevations | Dwg 26/1362/05 · A2 at 1:100 · stone coursing and openings | `05-elevations.pdf` |
| 06 | Proposed block plan | Dwg 26/1362/06 · A4 at 1:500 · parking, drainage, boundaries | `06-block-plan.pdf` |

Footnote: *Sheets open as the architect issued them — PDF, to scale. All levels and dimensions
to be site verified.*

**Implementation history worth knowing:** earlier iterations tried an inline `<iframe>`/
`<object>` PDF embed and then client-side rasterising with pdf.js. Both failed — the embed
rendered blank in-app, and pdf.js hung the main thread on the A1 sheet (63,000+ draw ops).
If you want inline previews in production, **pre-render the PDFs to WebP/PNG server-side at
build time** (e.g. pdftoppm / ImageMagick / a Sharp pipeline) and ship images, keeping the PDF
as the "open full size" target. Do not rasterise in the browser.

### 5. `#inside` — the interior explorer (the most complex component)

Background `#06223a`. Two-column intro, then three coupled controls:

**a. Floor tabs** — GROUND FLOOR / FIRST FLOOR / SECOND FLOOR. `min-height: 44px`,
`padding: 0 20px`, `700 10px Barlow`, `letter-spacing: .13em`. Active: gold fill, `#06223a`
ink. Inactive: transparent, `#dbe4ea` ink, `1px solid rgba(255,255,255,.28)`. Selecting a tab
selects that floor's first room.

**b. An interactive floor plan**, drawn to the real millimetre geometry off sheet 03. The
outer container is `aspect-ratio: 5645/9490` with `border: 2px solid rgba(239,207,145,.6)`;
each room is an absolutely-positioned `<button>` whose `left/top/width/height` are percentages
of 5645 × 9490 mm. **Front elevation is at the top, rear garden at the bottom.** Each cell
shows the room name (`700 clamp(8px,1.05vw,12px)`, `letter-spacing: .09em`) above its
dimensions (`400 clamp(7px,0.85vw,10.5px)`, `opacity: .72`), centred, `overflow: hidden`.
Selected cell: gold fill, `#06223a` ink. Kitchen cell (when not selected): fill
`color-mix(in oklab, <kitchen swatch> 34%, #0b3454)` with the raw swatch as its border — so
the chosen kitchen colour reads on the plan while the label stays legible. All others:
`rgba(255,255,255,.05)` fill, `rgba(239,207,145,.45)` border, `#eef3f6` ink.

Room geometry, in millimetres, `x/y` from the front-left internal corner
(external envelope 5645 × 9490; 350 mm walls):

*Ground floor* — note `Hall, kitchen, dining, living`, footer *FRONT ELEVATION AT THE TOP ·
REAR GARDEN AT THE BOTTOM*

| key | label | dims | x | y | w | h |
|---|---|---|---|---|---|---|
| hall | HALL | 2.00 × 3.61 | 350 | 350 | 2000 | 3610 |
| kitchen | KITCHEN | 2.81 × 3.61 | 2490 | 350 | 2805 | 3610 |
| wc | W/C | 1.06 × 1.68 | 350 | 4060 | 1060 | 1675 |
| dining | DINING | 3.79 × 1.68 | 1510 | 4060 | 3785 | 1675 |
| living | LIVING | 4.95 × 3.23 | 350 | 5885 | 4945 | 3230 |

*First floor* — note `Master suite, bathroom, bedroom 3`, footer *FRONT AT THE TOP · LANDING
DOWN THE OUTER WALL*

| key | label | dims | x | y | w | h |
|---|---|---|---|---|---|---|
| landing | LANDING | 1.11 wide | 350 | 350 | 1110 | 6035 |
| bed3 | BEDROOM 3 | 3.75 × 2.95 | 1560 | 350 | 3735 | 2950 |
| bath | BATHROOM | 3.75 × 1.70 | 1560 | 3400 | 3735 | 1700 |
| ensuite | EN-SUITE | 1.21 × 2.76 | 350 | 6385 | 1210 | 2760 |
| master | MASTER BED | 3.64 × 2.76 | 1660 | 6385 | 3635 | 2760 |

*Second floor* — note `Bedroom 2 suite and stores`, footer *FRONT AT THE TOP · ROOMS UNDER THE
40° PITCH*

| key | label | dims | x | y | w | h |
|---|---|---|---|---|---|---|
| store | STORE | 1.30 deep | 350 | 350 | 4945 | 1300 |
| landing2 | LANDING | 0.98 wide | 350 | 1750 | 975 | 4890 |
| ensuite2 | EN-SUITE | 1.21 × 1.90 | 1425 | 1750 | 1210 | 1900 |
| bed2 | BEDROOM 2 | 2.56 × 4.89 | 2735 | 1750 | 2560 | 4890 |
| store2 | STORE | 1.45 deep | 350 | 7695 | 4945 | 1450 |

Every one of the fifteen cells must map to a room record — a cell with no record is a dead
click target that still looks interactive.

**c. Room list** beside the plan — only the current floor's rooms, as full-width buttons
(`min-height: 48px`, label left, dimensions right at `opacity: .75`), same selected styling as
the tabs. Plan cell and list row are two views of one selection.

**d. Room detail**, `grid-template-columns: repeat(auto-fit,minmax(min(100%,340px),1fr))`,
`gap: clamp(18px,2.5vw,28px)`, `align-items: start`:

- Left: the CGI in a fixed `aspect-ratio: 3/2` plate, `object-fit: cover`,
  `1px solid rgba(239,207,145,.4)`, with a caption bar over the bottom
  (`rgba(4,24,43,.82)`, `600 9px Barlow`, `letter-spacing: .14em`, gold) reading
  `Preview-resolution image · <finish summary>` on the left and
  `<FLOOR> FLOOR · HD RENDER AWAITED` on the right. **Do not let this plate stretch to the
  copy column's height** and do not put the card's white background on the grid wrapper —
  both were bugs; the white belongs on the copy column only.
- Right, on `#fff`, `padding: clamp(24px,3.4vw,42px)`: the room's level eyebrow, its title at
  `clamp(30px,3.8vw,46px)`, its description, then a two-cell fact grid — the plan dimension
  labelled *off dwg 26/1362/03*, and the room's openings labelled *openings on the plan* —
  then the finishes switcher (below).

Room records (label · floor · level · size · openings · image):

| key | label | floor | size | openings |
|---|---|---|---|---|
| hall | ENT. HALL | GROUND | 2.00 × 3.61 m | Front door D07 · stairs to all three floors · smoke alarm |
| kitchen | KITCHEN | GROUND | 2.81 × 3.61 m | Windows W05 / W06 · heat alarm · mechanical extract |
| wc | W/C | GROUND | 1.06 × 1.68 m | Obscure-glazed W08 · extract fan |
| dining | DINING ROOM | GROUND | 3.79 × 1.68 m | Doors D03 / D04 off the hall |
| living | LIVING ROOM | GROUND | 4.95 × 3.23 m | Garden doors D01 · window W01 · steel beam over |
| master | MASTER BEDROOM | FIRST | 3.64 × 2.76 m | Windows W10 / W11 · door D10 |
| ensuite | EN-SUITE | FIRST | 1.21 × 2.76 m | Obscure-glazed W09 · door D09 · extract |
| bath | BATHROOM | FIRST | 3.75 × 1.70 m | Doors D11 / D12 · mechanical extract |
| bed3 | BEDROOM 3 | FIRST | 3.75 × 2.95 m | Windows W16 / W17 to the front |
| landing | LANDING | FIRST | 1.11 m wide | Cupboard (Cup'd) · smoke alarm SD |
| bed2 | BEDROOM 2 | SECOND | 2.56 × 4.89 m | Rooflights RL01 / RL02 · window W18 |
| ensuite2 | EN-SUITE 2 | SECOND | 1.21 × 1.90 m | Door D17 · extract · SVP alongside |
| landing2 | TOP LANDING | SECOND | 0.98 m wide | Stair from the first floor · smoke alarm SD |
| store | FRONT STORE | SECOND | 1.30 m deep | Doors D18 / D22 into the eaves |
| store2 | REAR STORE | SECOND | 1.45 m deep | Doors D21 / D22 into the eaves |

Full descriptive copy for each room is in the `rooms` array in the logic class — lift it
verbatim; it is written against the drawings.

**e. Finishes switcher** (the extensibility the client asked for). Three groups, each a wrapping
row of swatch buttons (`min-height: 44px`, a 20 × 20 px swatch chip with
`1px solid rgba(6,34,58,.35)` beside the label; selected = `#06223a` fill, gold ink):

| Group | Options (id · label · swatch) |
|---|---|
| Kitchen units | graphite `#3d4348` · sage `#7e8b73` · oak (Light oak) `#c49a63` · ivory `#e6dfd0` |
| Wall paint | chalk (Chalk white) `#efece4` · clay (Warm clay) `#d8c8b4` · slate (Soft slate) `#9aa6ad` |
| Internal doors | white (White panel) `#f2f2ef` · oak (Oak veneer) `#b1855a` · grey (Dark grey) `#4c5257` |

Defaults: `{ kitchen: 'graphite', walls: 'chalk', doors: 'white' }`. The selection produces a
summary string — `"Graphite kitchen · Chalk white walls · white panel doors"` — shown beside the
group heading and in the image caption, and it tints the kitchen cell on the plan.

**Variant render lookup:** the key is `` `${roomKey}|${kitchen}|${walls}|${doors}` `` against a
`VARIANTS` map (empty today). On a hit, show that image and the note *"This combination has a
render on file — shown above."*; on a miss, show the base image and *"Your selection carries
through the plans above and is recorded with your enquiry. Photoreal renders are produced per
colourway; the base image stays on screen until yours is issued."* In production this should be
a per-room/per-colourway asset manifest, ideally resolved server-side, and the selection should
be submitted with the enquiry.

### 6. `#spec` — specification

`<h2>` *Accuracy first. Then aspiration.* left with a gold `REGISTER INTEREST` CTA; right, a
six-item accordion (`border-top: 1px solid #06223a`, items `border-bottom: 1px solid #d8cfbf`,
header `min-height: 62px`, gold `01`–`06` index, Barlow Condensed `clamp(22px,2.4vw,28px)`
title, `+`/`–` at `300 24px`, hover `rgba(11,52,84,.04)`). One open at a time; clicking the
open one closes it (index `-1`). Items render as `—`-prefixed lines at `400 14px/1.65`.

Sections: **Walls & structure**, **Floors & roof**, **Windows & doors**, **Safety &
ventilation**, **Drainage & externals**, **Interior finishes** — all read off the drawings
(Marshalls 'Epoch' coursing, Dritherm 32, pile foundations with 450 × 450 RC ground beams,
beam-and-block with 150 mm Celotex XR4000, 170 × 47 C24 joists at 400 centres, 40° roof,
mains interconnected alarms, 8 m³ Polypipe Polystorm attenuation, etc.). Full item lists are in
the `spec` array. **Anything not on the drawings says "to be confirmed with buyer" — keep that
discipline; do not invent finishes.**

### 7. `#buyers` — reserved buyers

Background `#0b3454`. Left: heading, lead, then a bordered status plate
(`1px solid rgba(239,207,145,.35)`, gold corner marks) — `PLOT 1 · RESERVED 14 FEB 2026`,
*Roof stage — watertight this week.*, a 6 px progress bar (`rgba(255,255,255,.16)` track, gold
fill at 62%), and `62% COMPLETE` / `STAGE 4 OF 7 · TARGET NOV 2026`. Below, four tiles on
`#06223a` on a `rgba(255,255,255,.16)` 1 px grid: Progress photos (12 new this week),
Documents (Reservation, all six sheets, warranty), Stage payments (3 of 5 paid),
Message Michael (Replies within the hour).

Right, on `#fbf8f2`: a seven-stage build timeline — dot column (11 px dots; complete = gold
fill, current = white fill with gold ring, future = transparent with `#b3bec6` ring) and a
1 px `#d8cfbf` connector; stage in Barlow Condensed 21px (`#14283b` up to current,
`#8a9298` after), date at `400 12px`. Stages: Groundworks & foundations *Complete · March
2026*; Stone shell to first floor *Complete · June 2026*; First floor & internal walls
*Complete · August 2026*; Roof & watertight *In progress · this week* (current); First fix &
plastering *Expected October 2026*; Kitchen, bathrooms & finishes *Expected November 2026*;
Handover & keys *Target late November 2026*.

This is presentational. Productionising it means auth, a real build-status source and secured
document storage.

### 8. `#enquire` — register interest

Left: heading *Get in touch early.*, lead about early registration and personalising finishes,
contact details (`walkergoodhomesltd@gmail.com`, *Hoyle Ing, Linthwaite, Huddersfield*), and
the strapline *Designed for living. Built to last.* in italic gold.

Right, a cream card (`#fbf8f2`, `1px solid #d8cfbf`, corner marks) containing the form:
Your name, Email, Phone (optional) — inputs `min-height: 50px`, `padding: 12px 14px`,
`1px solid #cfc6b8`, `#fff`, `400 16px Barlow` (16 px prevents iOS zoom-on-focus), focus
`outline: 2px solid #d2a454; outline-offset: 1px`; labels `600 9.5px Barlow`,
`letter-spacing: .16em`, uppercase. Then **Plot of interest** as three `flex: 1 1 90px`
buttons — Plot 1 / Plot 2 / Either (default *Either*), selected `#06223a` + gold. Submit:
`SEND MY ENQUIRY`, gold, `min-height: 54px`.

Validation, client-side, on submit only:
- empty name → *"Please add your name so we know who to reply to."*
- email failing `/.+@.+\..+/` → *"That email address doesn't look right."*
- errors render in a `1px solid #b4523c` / `#fdf1ee` / `#8f3a27` plate above the button.

On success the card swaps to a confirmation: eyebrow `Enquiry sent`, *Thank you,
&lt;first name&gt;.*, *"We've noted your interest in &lt;Plot 1|Plot 2|both plots&gt;. Michael
will be in touch from walkergoodhomesltd@gmail.com — usually within a few hours."*, then a
**site-visit booking** list: four slots (`Sat 26 Sep · 10:00`, `Sat 26 Sep · 11:30`,
`Sat 3 Oct · 10:00`, `Sat 3 Oct · 14:00`) as `min-height: 52px` rows with a right-hand tag
(`AVAILABLE`, `POPULAR` on the second, `CONFIRMED` once chosen); selected row `#06223a` +
gold. Confirming shows *"&lt;slot&gt; confirmed — meet at the site gate on Hoyle Ing. Hard hats
and boots provided."*

**Nothing is submitted anywhere** in the prototype — no endpoint, no persistence. Production
needs a real handler (email to `walkergoodhomesltd@gmail.com` plus a stored lead), spam
protection, a privacy notice and GDPR consent wording, and real slot availability. The design
promises *"We reply personally, usually the same day — no mailing list."* — honour it.

### 9. Footer

`#04182b`, three columns (`repeat(auto-fit,minmax(min(100%,220px),1fr))`): brand + *Yorkshire
craftsmanship. Exceptional homes. Established 2024.*; DEVELOPMENT address; ENQUIRIES email with
an outline `REGISTER INTEREST` button. Then a hairline rule and the legal line: *"Computer-
generated images and interior visuals are illustrative. Room locations and dimensions follow
the architect's issued drawings; finishes may be subject to change. © 2026 Walker Good Homes
Ltd."*

## Interactions & behaviour

- **Nav** — in-page anchors with `html { scroll-behavior: smooth }`. Header is sticky and
  translucent; it must clear anchored section tops (add scroll-margin in production).
- **Plot selection** — clicking either plot card sets the active plot, updating the fact strip,
  the `SHOWING:` line and the card CTAs. No navigation.
- **Floor tabs** — select the floor's first room.
- **Plan cell / room row** — both set the selected room; selection is single and shared.
- **Finish selection** — updates the summary, the caption, the kitchen tint on the plan and the
  variant lookup. Persist it with the enquiry in production.
- **Spec accordion** — single-open, click-to-close.
- **Form** — validate on submit; success swaps the card to the confirmation + booking state.
- **Slot selection** — single-select, immediate confirmation line.
- **Transitions** — deliberately minimal: `background .18s` on buttons and hover tints only.
  No entrance animations, no parallax. Keep it that way.
- **Responsive** — fully fluid, no media queries: `clamp()` for type and spacing,
  `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` for every grid, `min-width: 0` /
  `minmax(0,1fr)` where text must shrink. Phone rendering is the priority: all tap targets
  ≥ 44 px, form inputs at 16 px.
- **Accessibility** — plan cells and room rows are real `<button>`s; keep them focusable and
  add `aria-pressed` for selection in production. The plan needs a text equivalent (the room
  list is it — keep them adjacent). Body text meets 4.5:1 on its ground; verify again if the
  palette is adjusted.

## State management

All local UI state; no server state, no fetching.

| State | Type | Default | Drives |
|---|---|---|---|
| `plot` | `1 \| 2` | `1` | Plot card CTAs, fact strip, `SHOWING:` line |
| `room` | index into `rooms` | `0` | Floor tabs, plan highlight, room list, room detail, variant lookup |
| `spec` | open index, `-1` = none | `0` | Specification accordion |
| `finishes` | `{ kitchen, walls, doors }` | `graphite / chalk / white` | Swatch selection, summary, kitchen tint, variant key |
| `name`, `email`, `phone` | string | `''` | Enquiry inputs |
| `pick` | `'Plot 1' \| 'Plot 2' \| 'Either'` | `'Either'` | Plot-of-interest choice |
| `err` | string | `''` | Validation message |
| `sent`, `sentName`, `sentPlot` | bool / string | `false` | Confirmation state and copy |
| `booked` | string | `''` | Selected visit slot |

Derived, not stored: current floor (from the selected room's `floor`), the finish summary
string, the variant key and whether a variant exists.

Two props are exposed as design-time tweaks and can become theme config or be inlined:
`accent` (default `#d2a454`, alternatives `#c79a4b`, `#b98a3c`, `#e0b869`) and `cornerMarks`
(boolean, default true).

## Design tokens

**Colour — Walker Good Homes navy & gold**

| Token | Value | Use |
|---|---|---|
| Navy darkest | `#04182b` | Footer, status bar, quick-nav ground |
| Navy deep | `#041a2d` | Hero section ground |
| Navy | `#06223a` | Header, Inside section, selected controls, dark tiles |
| Navy mid | `#0b3454` | Reserved-buyers ground, plot-card base, ink accents |
| Navy hover | `#123f61` | Dark tile hover |
| Gold (accent) | `#d2a454` | Primary buttons, selection, progress, rules |
| Gold light | `#efcf91` | Type on navy, logo ink, hover fill |
| Gold deep | `#a8823c` | Eyebrows and links on light grounds (contrast-safe) |
| Paper | `#f3eee5` | Page ground |
| Paper warm | `#fbf8f2` | Cards, spec ground, timeline plate |
| White | `#fff` | Room detail column, drawing plate |
| Rule | `#d8cfbf` | Hairline borders on light |
| Rule strong | `#06223a` | Register/accordion top rule |
| Input border | `#cfc6b8` | Form fields |
| Ink | `#14283b` | Headings |
| Ink body | `#4c5a64` | Body copy |
| Ink muted | `#7b848b` / `#8a9298` | Meta and captions |
| Ink on navy | `#dbe4ea` / `#c3d0d9` | Body copy reversed |
| Ink faint on navy | `#8fa2b1` / `#9fb1bf` | Meta reversed |
| Error | `#b4523c` border / `#fdf1ee` bg / `#8f3a27` text | Validation |

Alphas in use: `rgba(239,207,145,.22/.3/.35/.45/.55/.6)` gold hairlines;
`rgba(255,255,255,.04/.05/.12/.16/.28)` on navy; `rgba(6,34,58,.25)`;
`rgba(4,26,45,.82/.9/.93)` image scrims; `rgba(11,52,84,.04/.05)` hover on light.

**Typography** — Barlow Condensed 400–700 and Barlow 300–700 (Google Fonts).

| Role | Spec |
|---|---|
| H1 (hero) | Barlow Condensed 500, `clamp(34px,5.2vw,64px)`, `line-height: .98`, `letter-spacing: -.005em` |
| H2 (section) | Barlow Condensed 500, `clamp(38px,5.4vw,70px)` |
| H2 (hero sub) | Barlow Condensed 500, `clamp(40px,5.8vw,76px)` |
| H3 (room) | Barlow Condensed 500, `clamp(30px,3.8vw,46px)` |
| Card/row title | Barlow Condensed, `clamp(21px,2.6vw,30px)` |
| Numeric figure | Barlow Condensed, 22–26px |
| Lead / body | Barlow 400, `clamp(15px,1.25vw,17.5px)`, `line-height: 1.75`, `text-wrap: pretty` |
| Body small | Barlow 400, 13.5–14px, `line-height: 1.65–1.7` |
| Eyebrow | Barlow 700, 9.5–10px, `letter-spacing: .24em`, uppercase |
| Button | Barlow 800, 10–10.5px, `letter-spacing: .14em`, uppercase |
| Nav / label | Barlow 600, 9–9.5px, `letter-spacing: .12–.16em`, uppercase |
| Input | Barlow 400, 16px (never smaller — iOS zoom) |
| Legal | Barlow 400, 11px, `line-height: 1.7` |

Headings use `text-wrap: balance`; body uses `text-wrap: pretty`.

**Spacing & layout** — container `max-width: 1220px`, padding `0 clamp(18px,4vw,40px)`;
section padding `clamp(52px,7vw,104px) 0`; two-column gap `clamp(20px,3.5vw,54px)`; card
padding `clamp(22px,3vw,34px)`; grid gaps `clamp(14px,2.5vw,28px)`; 1 px hairline separators
in place of gaps on fact/tile grids.

**Radius** — `0` everywhere. Square corners are the system. **Shadows** — none, except the hero
photograph's gradient scrims. Depth comes from hairlines and grounds.

**Registration marks** — `.mk { position: absolute; font: 15px/1 'Barlow'; color:
rgba(6,34,58,.5) }`, four per framed plate at roughly `5–7px` from each corner; gold
(`rgba(239,207,145,.7–.75)`) on dark grounds.

**Link defaults** — `a { color: #0b3454 }`, `a:hover { color: #a8823c }`.

## Assets

All in `assets/`.

- `hero-exterior.png` (1774 × 887) — the exterior visual, supplied by the client. **It has the
  logo, a headline and a gold CTA bar baked in**; the site crops all three out. A clean plate
  would be better — ask the client.
- `brand/logo.png` (573 × 232, transparent) — the Walker Good Homes mark, extracted from the
  banner and knocked out to transparency. A real vector logo (SVG) should replace it.
- `cgi/*.jpg` — 10 interior stills recovered from the client's earlier sales clickthrough:
  `kitchen`, `dining`, `living`, `hallway`, `cloakroom`, `bedroom-1`, `bedroom-2`,
  `bedroom-3`, `bathroom`, `en-suite`. **540–930 px — preview resolution only.** Request the
  originals at 2000 px+, plus per-colourway variants, and serve as responsive WebP/AVIF.
  Note `bedroom-1` is the master and `cloakroom` is the ground-floor W/C; `hallway` currently
  doubles for both landings and `en-suite` for the second-floor rooms and stores.
- `pdf/01`–`06` — the six architect's sheets (26/1362/01–06), as issued. Link them; pre-render
  images from them at build time if you want inline previews.

Fonts load from Google Fonts — self-host in production.

## Screenshots

`screenshots/` holds reference captures of the built design — use these as the visual source
of truth alongside the measurements in this README.

**Desktop (`*-desktop.png`, in order)**

1. `01` — hero: logo, coming-soon heading, exterior photograph
2. `02` — `#plots`: intro, the two plot cards, fact strip
3. `03` — `#drawings`: the six-sheet drawing register
4. `04` — `#inside`: floor tabs, ground-floor plan, room list
5. `05` — kitchen selected: gold plan cell and matching room row
6. `06` — second floor: bedroom 2 suite and the two eaves stores
7. `07` — `#spec`: the accordion with the first section open
8. `08` — `#buyers`: build status plate, tiles and timeline
9. `09` — `#enquire`: the enquiry form and contact column
10. `10` — footer

**Mobile (`*-mobile.png`, 390 px wide)**

1. `01` — hero at phone width
2. `02` — plot cards stacked
3. `03` — the interior explorer: plan above the room list
4. `04` — the enquiry form

The mobile captures are the same page at a 390 px container — there are no media queries and no
separate mobile build.

## Files

```
design/
  Hoyle Ing Website.dc.html      ← the design (this handoff's subject)
  Hoyle Ing Mobile Site.dc.html  ← earlier phone-framed exploration; superseded, kept for reference
  support.js                     ← the DC runtime the prototypes need to open; do not port
  _ds/industry-…/                ← the Industry design system: styles.css (tokens), bundle, readme
assets/                          ← as above
screenshots/                     ← reference captures, desktop and mobile
README.md                        ← this file
```

Open `design/Hoyle Ing Website.dc.html` in a browser to see it running; `assets/` paths in the
file are project-relative (`cgi/…`, `pdf/…`, `brand/…`) and will need repointing if you move it.

## Content rules to carry over

Non-negotiables established with the client:

1. **Logo first, then the coming-soon development** — that order opens the page.
2. **Everything factual comes off the drawings.** Room names, dimensions, window and door
   references and the specification are read from sheets 26/1362/01–06. Nothing invented.
3. **Unconfirmed means unconfirmed** — buyer-choice items say "to be confirmed with buyer".
4. **The homes are three storeys**, three bedrooms, two en-suites plus a family bathroom.
5. **The plots are a handed pair**, not higher/lower.
6. **Images are labelled honestly** — the interiors are preview-resolution stills and the page
   says so until HD renders arrive.
7. **Tone is restrained and premium** — plain English, no exclamation, no emoji, no stock-photo
   gloss.
