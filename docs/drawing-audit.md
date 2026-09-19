# Room dimensions — audited against sheet 26/1362/03

Everything the site publishes about room sizes has to come off the architect's
drawings. This is the record of reading them properly, at a resolution where
the dimension strings are legible, and what had to change as a result.

## How the sheet was read

`public/assets/sheets/03-floor-plans-*.webp` is rasterised at scale 1.5 for the
site, which is enough to look at and not enough to measure. The figures below
were read from `public/assets/pdf/03-floor-plans.pdf` rendered at scale 6 —
about 14,300 px across an A1 sheet — where the dimension strings along the
edges of each plan can simply be read off rather than measured in pixels.

Measuring a raster is what produced most of the errors in the first place.
**Read the figures. Do not scale off the drawing.** Where a room is not
dimensioned, derive it from the strings that are, and check the derivation adds
up to the envelope.

## Orientation

On all three of the architect's plans the **rear garden is at the top and the
front elevation at the bottom**. The site's own plan graphic is drawn the other
way up, with `y` increasing from the front — that is deliberate and is
documented in `src/data/interior.ts`. Do not "correct" one to match the other.

## The envelope, which every derivation has to close against

| | |
|---|---|
| External | 5645 × 9490 per dwelling |
| Internal | 4945 × 8790 (350 external walls) |
| Overall, both dwellings | 10940 |

## First floor — corrected

The front dimension string reads **350 | 2000 | 140 | 2795 | 350**. That is the
external wall, the landing, the dividing wall, the bedroom 3 / bathroom band,
and the party wall. It closes: 350 + 2000 + 140 + 2795 + 350 = 5635 ≈ 5645.

| Room | Was published | Sheet 03 | Where the figure comes from |
|---|---|---|---|
| Landing | 1.11 m wide | **2.00 × 5.935** | 2000 in the front string; 5935 in the left string |
| Bedroom 3 | 3.75 × 2.95 | **2.795 × 2.950** | 2795 in the front string; 2950 dimensioned in the room |
| Bathroom | 3.75 × 1.70 | **2.795 × 1.700** | 2795 in the front string; 1700 dimensioned in the room |
| Master bedroom | 3.64 × 2.76 | **3.745 × 2.760** | 3745 dimensioned in the room; 2760 in the left string |
| En-suite | 1.21 × 2.76 | **1.100 × 2.760** | derived: 4945 − 3745 − 100 |

The landing figure was the tell. At 1110 it was a corridor, and it contradicted
the entrance hall directly beneath it, which the site has always had at 2000
wide. They are the same band: that is what lets the staircase run up this side
of the house through all three storeys.

### The bathroom's layout, not just its size

The client's own note — *"the main bathroom layout isnt like that"* — is what
sent this audit back to the drawing, and the plan is explicit:

- The **W/C** stands against the long rear wall at the landing end, with a
  boxed cistern behind it.
- The **basin** sits beside it on the same wall.
- A **1500 bath** runs across the far end, hard against the party wall, with
  **100 clear at each end** — which is precisely why the room is 1700 deep.
- **D11** is in the landing wall at the front corner, opening into the room.
- The long front wall, shared with bedroom 3, is left clear.

The model had all of that reversed: a bath down the long wall at the landing
end and the W/C at the party wall, in a room 955 mm too wide.

## Second floor — corrected

Two figures the published copy carried an open query against are dimensioned on
the drawing and can now be closed.

| Room | Was published | Sheet 03 |
|---|---|---|
| Bedroom 2 | 2.56 × 4.89 (and 3.93 in the description) | **3.930 × 5.695** |
| En-suite 2 | 1.21 × 1.90 | **0.975 × 2.610** |

Bedroom 2 starts 1810 back from the front wall and RL01 sits near its rear,
which is why the room's ceiling is at its highest where the bed is. RL02 is
plot 2's rooflight, not a second one in this room.

## Still open

- **The two second-floor stores.** The plan draws them inside the landing band
  rather than across the full width, and the site models them as full-width
  eaves spaces. The left dimension string on that plan carries 1450, 855, 4890,
  1300 and 1505, and which of those bound the stores as rooms — rather than the
  eaves voids behind them — is not something to settle by measuring pixels.
  Ask the architect.
- **First-floor window widths.** The top string reads 665 | 675 | 1790 | 1585,
  with W09 and W10 labelled beneath it, but the segments do not obviously
  reconcile with the rooms behind them. The model carries W10 at 1790, which
  may be the pier rather than the opening.

## The rule this is all downstream of

Fittings are drawn too. The kitchen island that had to come out was invented,
and the room copy then claimed it followed the drawn layout. The bathroom was
the same failure in a different room: a plausible arrangement, modelled from
assumption, in a room whose size had never been checked against the string that
gives it. Read the plan for what is actually drawn — the fittings as much as
the walls — before modelling any of it.
