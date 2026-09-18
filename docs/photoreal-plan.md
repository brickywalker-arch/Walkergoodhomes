# Photoreal interiors — the plan

The interiors are rendered from the architect's drawings, which makes them
geometrically true and lets every buyer-selectable finish combination be
rendered exactly. What they are not is photoreal, and the client's approved
exterior visual sets the bar they are being judged against.

This is how to close that gap without giving up the thing that makes the
renders worth having.

## Why the renderer cannot do it

The gap is indirect light. A rasteriser has none — in a real room most of what
you see is light that has already bounced off something else, and no number of
placed lights reproduces that. Only a path tracer solves it.

`three-gpu-pathtracer` was measured against this exact scene and does
initialise and run. But the renderer available here is SwiftShader — software,
no GPU — and it reached roughly **one sample per pixel per six seconds at
800 × 533**. A usable image needs a hundred or more samples. That is minutes
per image at a third of the size the site serves, and hours at full size; for
162 renders it is not viable.

On a machine with a real GPU it *is* viable, and the scene is already in a
state where it would work. That is the other option, if one is available.

## The approach: hybrid, not replacement

**The renders stay the source of truth.** They are the only images built to the
issued dimensions, and they are the only way to cover all 540 finish
selections consistently — diffusion cannot hold a room's geometry steady across
36 colourways, and a set of images where the walls move when you change the
door colour is worse than no photoreal at all.

So: each render becomes the **structural reference** for an image-to-image pass
at high structural fidelity. The geometry, the openings, the layout and the
camera all survive; what changes is the material and light realism.

## Which images to generate

Not all fifteen rooms. The narrow utility spaces — landing (1.11 m wide), top
landing (0.98 m), and the two eaves stores — will not photograph well however
they are rendered, and nothing is gained by spending on them. Six rooms carry
the development:

`kitchen`, `living`, `dining`, `master`, `bath`, `bed2`

### Collapsing the finish axes

`public/assets/cgi/manifest.json` already records, per room, which finish axes
change that room's render, and `src/lib/cgi.ts` pins the ones that do not — so
choosing sage units still resolves the exact image for a bedroom, because the
kitchen cannot be seen from in there.

Photoreal images can use a **coarser** set of axes than the renders, because
the internal-door colour is barely visible in most rooms:

| Room | Photoreal axes | Images |
|---|---|---|
| kitchen | units × walls | 4 × 3 = 12 |
| living, dining, master, bath, bed2 | walls | 5 × 3 = 15 |
| | | **27 total** |

At roughly 10–20 credits an image that is 270–540 credits, against 926
available. There is room for two or three variations per image to choose from.

Where no photoreal image exists for a selection, the site falls back to the
render — which is the behaviour `roomImage()` already has.

## Prompt structure

One prompt per room, with the render as the structural reference. Everything
factual comes off the drawings, and the fit-out is confirmed:

- **Fit-out:** Howdens. Kitchen is **Shaker-style** doors (rails and stiles
  around a recessed panel). Internal doors and joinery also Howdens.
- **Fabric:** Marshalls 'Epoch' stone externally, 40° pitched roof, three
  storeys. Second-floor rooms are under the pitch with sloping ceilings.
- **Per room:** its size off sheet 26/1362/03, its openings, its storey, and
  the finish being shown.

Worked example, kitchen with graphite units and chalk-white walls:

> Photoreal interior photograph of a new-build UK kitchen, 2.81 × 3.61 m, at
> the front of the ground floor. Two windows to the front elevation.
> Howdens Shaker-style kitchen in graphite with a light quartz worktop, bar
> handles, matching island with two stools, tall oven housing, metro-tile
> splashback. Chalk-white painted walls, engineered oak floor. Two pendants
> over the island. Daylight from the front windows, warm interior lighting.
> Yorkshire new-build, restrained and premium, no clutter.
> Architectural photography, 35mm, verticals vertical, natural exposure.

Keep the structural-fidelity setting high enough that the window positions and
room proportions do not drift — if they drift, the image contradicts the
drawings and cannot be used.

## Wiring the results in

1. Put the accepted images in `public/assets/photoreal/`.
2. Extend `scripts/prepare-photo.mjs`, or add a sibling, to size them to the
   same widths the renders use and write a manifest with the same shape:
   `{ defaults, axes, images: { "room|kitchen|walls|doors": {width: path} } }`.
3. In `src/lib/cgi.ts`, have `roomImage()` try the photoreal manifest first and
   fall back to the render manifest. The key canonicalisation already handles
   differing axes per room, so this is a small change.
4. `scripts/verify-assets.mjs` should assert that every photoreal key it holds
   resolves, and report how many selections are photoreal versus rendered.

## What must not change

- **Honest labelling.** These are computer-generated images and the page says
  so. The caption should keep distinguishing a render of the visitor's exact
  selection from a fallback.
- **Nothing invented.** Room sizes, openings and the specification come off
  sheets 26/1362/01–06. If a generated image shows something the drawings do
  not support — a window that is not there, a room the wrong shape — it is
  rejected, however good it looks.
- **The plots are a handed pair**, never higher/lower.

## Prerequisite

This needs `api.youart.ai` and `static.youart.ai` reachable from the session:
generation goes through MCP, but discovering node types, uploading the
reference renders and downloading the results all need direct HTTPS. Add them
to the environment's network policy and start a new session — the proxy is
configured when the container starts, so an existing session will not pick the
change up.

See https://code.claude.com/docs/en/claude-code-on-the-web for where
environments and their network access are configured.
