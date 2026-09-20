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

**All fifteen rooms, and every value of every axis a buyer can change.**

This started as six rooms on the reasoning that the narrow utility spaces would
not photograph well. Two things overturned it. The drawing audit corrected the
first-floor landing from 1110 to 2000 wide — it is the same band the entrance
hall occupies below it, not a corridor — and, more importantly, a partial set
is its own defect: a chooser where some rooms are photographs and some are
renders, and where changing the floor changes how good the picture is rather
than just what is in it, reads as broken. An option is either worth offering,
in which case it is worth photographing, or it is not offered.

So the set is the full cross product, 270 images:

| Room | Axes | Images |
|---|---|---|
| kitchen | units × walls × floors | 4 × 3 × 4 = 48 |
| hall, landing, landing2 | walls × floors × stairs | 3 × 4 × 3 = 36 each |
| dining, living, master, bed2, bed3 | walls × floors | 3 × 4 = 12 each |
| wc, ensuite, bath, ensuite2 | walls × tiles | 3 × 4 = 12 each |
| store, store2 | walls | 3 each |

The one axis still pinned is the internal-door colour. That is measured rather
than assumed: comparing each room's render against the same render with the
door colour changed moves 0–7% of the frame, which is not something a
generated photograph can be trusted to hold steady. Everything else a buyer
can pick is generated.

**Check the images, not the metric.** The same pixel comparison said the hall
floor moves 4.4% of the frame and the top-landing balustrade 6.5% — both
looked droppable. Put side by side at full size, the hall floor is a large
warm-to-grey change across the lower frame and the top landing's balustrade
stands in the near foreground. Both stayed. A percentage is a hint about where
to look, not a decision.

### Collapsing the finish axes

`public/assets/cgi/manifest.json` already records, per room, which finish axes
change that room's render, and `src/lib/cgi.ts` pins the ones that do not — so
choosing sage units still resolves the exact image for a bedroom, because the
kitchen cannot be seen from in there.

This matters more since the chooser went to six axes — kitchen units, wall
paint, internal doors, floor coverings, bathroom tiles and the staircase.
Unpinned that is 576 combinations per room and 8,640 renders; pinned it is
**702**, because a bedroom does not change when the tiles do and the four wet
rooms never show a door.

Photoreal images use a **coarser** set of axes again, because the
internal-door colour is barely visible in most rooms:

| Room | Photoreal axes | Images |
|---|---|---|
| kitchen | units × walls | 4 × 3 = 12 |
| living, dining, master, bath, bed2 | walls | 5 × 3 = 15 |
| | | **27 total** |

At roughly 10–20 credits an image that is 270–540 credits. There is room for
two or three variations per image to choose from.

The floor covering and the tile range are **declared** in the photoreal axes
but only the default of each has been generated. That is deliberate: declaring
them means a buyer who picks smoked oak gets a key the photoreal manifest has
no image for, and `roomImage()` falls back to the render — which does show
smoked oak. Leaving them undeclared would have served the oak photograph for
every floor choice and made the chooser look broken. Generating the other
three floors and three tile ranges is the obvious next spend: it would take
the photoreal set from 27 images to roughly 96.

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
> Howdens Shaker-style kitchen in graphite, laid out as a U on three walls
> opening to the door, with a light quartz worktop, bar handles, the sink
> under the windows, a tall oven housing closing the party-wall leg, and a
> metro-tile splashback. There is no island: the room is only 2.81 m wide.
> Chalk-white painted walls, engineered oak floor. Two pendants down the
> gangway. Daylight from the front windows, warm interior lighting.
> Yorkshire new-build, restrained and premium, no clutter.
> Architectural photography, 35mm, verticals vertical, natural exposure.

Keep the structural-fidelity setting high enough that the window positions and
room proportions do not drift — if they drift, the image contradicts the
drawings and cannot be used.

## The pipeline, as built

Everything below the generation step is in the repository and working. Only
the generation itself is outstanding.

```shell
node scripts/photoreal-refs.mjs       # 27 reference JPEGs -> .photoreal/refs/
#   ... generate, review, keep the good ones ...
#   accepted images go to .photoreal/accepted/<slug>.jpg
node scripts/prepare-photoreal.mjs    # sizes them and writes the manifest
npm run check                         # asserts every claimed image resolves
```

`cgi/photoreal/jobs.mjs` holds the 27 jobs — room, finish combination,
which render is its structural reference, and the prompt. Both scripts read
it, so the slug, the key and the prompt can never drift apart.

`src/lib/cgi.ts` already prefers a photoreal image and falls back to the
render, and `ResolvedImage.kind` tells the page which it got. A partial set is
therefore safe at any point: every selection without a photoreal image keeps
serving exactly what it serves today.

### Generation settings

Confirmed against the node catalogue:

| | |
|---|---|
| Node chain | `LoadImage` -> `NanoBananaProGenerate` |
| Mode | `edit` (the reference goes in on `edge-in`) |
| Aspect ratio | `3:2` — the renders are 1600 x 1067 |
| Resolution | `2K` |
| `num_images` | 2 or 3, to choose from |

Nano Banana Pro is the photorealism-led model in the catalogue and is what the
account's existing project already uses. Its own guidance is to direct an
image like a scene rather than tag it like a stock prompt, which is how the
prompts in `jobs.mjs` are written: subject and composition, then the fit-out,
then the finish, then the lighting, then the camera.

Every prompt ends with an instruction to hold the reference's room shape,
opening positions, layout and camera, and to change only material realism and
lighting. If an image drifts off that, it contradicts the drawings and is
rejected — see below.

## When the geometry moves, the photographs are void

A photoreal image is a photograph of a render. When the render changes, the
photograph is of a room that is not being built any more, and no amount of it
looking good makes it usable.

The drawing audit (`docs/drawing-audit.md`) moved several rooms, and the
photoreal set was reconciled against it rather than left to rot:

| Room | What happened |
|---|---|
| kitchen, dining | Geometry unchanged — kept, renamed to the new slug |
| bath | Superseded: both the layout and the size were wrong |
| bedroom 2 | Superseded: depth corrected 4890 → 5695 |
| master | Superseded: width corrected 3640 → 3745, and the bed moved |
| living | Superseded: the media wall did not exist when it was generated |
| hall | New to the set — it is where the staircase choice shows |

The slug format changed with the axes: it now names only the axes that room
actually varies on, so a bedroom's file is not stamped with a tile range that
is nowhere in the picture. `slugFor()` in `cgi/photoreal/jobs.mjs` is the one
place that decides it, and both scripts read it.

## What must not change

- **Honest labelling.** These are computer-generated images and the page says
  so. The caption should keep distinguishing a render of the visitor's exact
  selection from a fallback.
- **Nothing invented.** Room sizes, openings and the specification come off
  sheets 26/1362/01–06. If a generated image shows something the drawings do
  not support — a window that is not there, a room the wrong shape — it is
  rejected, however good it looks.
- **Fittings are drawn too, and get checked against the plan.** The kitchen
  originally carried an island. Sheet 03 draws units on three walls with an
  empty centre, and at 2810 wide an island would have left about 370 to the
  opposite run — not a gangway anyone can use. It was invented, and the room
  copy then claimed it followed the drawn layout. Read the plan for what is
  actually drawn before modelling a fitting, and check the clearance it leaves.
- **The plots are a handed pair in plan** — the same drawing, mirrored — and
  they **step down the sloping site**, plot 1 higher and plot 2 lower. Both are
  true and neither replaces the other: do not describe them as two different
  house types, and do not draw them level.

## Prerequisite — done

`api.youart.ai` and `static.youart.ai` are reachable: the environment's
network access was set to **Custom** with `youart.ai` and `*.youart.ai`
allowed, keeping the default package-manager list. Verify from any session
with:

```shell
curl -sS -o /dev/null -w "%{http_code}\n" https://api.youart.ai/
```

See https://code.claude.com/docs/en/cloud-environments for where that is
configured. The network policy is read when a container starts, so a change
needs a new session or a restarted one.
