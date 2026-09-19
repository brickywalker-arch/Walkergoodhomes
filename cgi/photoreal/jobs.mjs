/**
 * The photoreal generation jobs: one per image, each pairing a rendered
 * reference with the prompt that describes it.
 *
 * The renders are the structural reference. Everything factual in a prompt
 * comes off sheets 26/1362/01-06 — room size, openings, storey — and the
 * fit-out wording is the confirmed Howdens specification. Nothing here
 * describes a feature the drawings do not show.
 *
 * Used by scripts/photoreal-refs.mjs to export the reference images and by
 * scripts/photoreal-run.mjs to drive the generation.
 */

/** Only these rooms are worth generating. See docs/photoreal-plan.md. */
export const PHOTOREAL_ROOMS = ['kitchen', 'living', 'dining', 'master', 'bath', 'bed2', 'hall'];

/**
 * Which finish axes change a photoreal image. Coarser than the renders' axes:
 * the internal-door colour is barely visible in these rooms, so it is pinned
 * and the door axis collapses.
 *
 * An axis listed here is not necessarily generated across — see
 * PHOTOREAL_VALUES. Listing it is what makes the fallback work.
 */
export const PHOTOREAL_AXES = {
  kitchen: ['kitchen', 'walls', 'floors'],
  living: ['walls', 'floors'],
  dining: ['walls', 'floors'],
  master: ['walls', 'floors'],
  bath: ['walls', 'tiles'],
  bed2: ['walls', 'floors'],
  hall: ['walls', 'floors', 'stairs'],
};

/** Pinned values for the axes a photoreal image does not vary. */
export const PINNED = {
  kitchen: 'graphite',
  walls: 'chalk',
  doors: 'white',
  floors: 'oak',
  tiles: 'calacatta',
  stairs: 'chamfered',
};

/** The order the axes appear in a manifest key. Must match src/lib/cgi.ts. */
export const AXES = ['kitchen', 'walls', 'doors', 'floors', 'tiles', 'stairs'];

export const KITCHEN_FINISHES = ['graphite', 'sage', 'oak', 'ivory'];
export const WALL_FINISHES = ['chalk', 'clay', 'slate'];
export const TILE_FINISHES = ['calacatta', 'capel', 'bardiglio', 'noir'];

/**
 * The values each axis is actually generated across.
 *
 * Where this lists only the pinned value, the axis is declared in
 * PHOTOREAL_AXES but not generated: a buyer choosing anything else gets a key
 * the photoreal manifest has no image for, and `roomImage` falls back to the
 * render — which does show their choice. Leaving the axis undeclared instead
 * would have served the same photograph for every value and made the chooser
 * look broken.
 *
 * Floors and stairs sit there for now. Tiles do not: the bathroom is the one
 * room where the finish *is* the room, and a photograph of grey stone served
 * as a white marble selection would be a claim about what is being fitted.
 */
export const PHOTOREAL_VALUES = {
  kitchen: KITCHEN_FINISHES,
  walls: WALL_FINISHES,
  tiles: TILE_FINISHES,
  floors: [PINNED.floors],
  stairs: [PINNED.stairs],
};

/** Wall paint as it should read in a photograph. */
const TILE_DESC = {
  calacatta: 'bright white Calacatta marble-effect porcelain with soft grey veining',
  capel: 'warm white Calacatta Gold marble-effect porcelain with gold veining',
  bardiglio: 'mid-grey Bardiglio marble-effect porcelain with darker grey veining',
  noir: 'deep charcoal porcelain with a subtle darker figure',
};

/** Unit-door colour as it should read in a photograph. */
const KITCHEN_DESC = {
  graphite: 'dark graphite grey',
  sage: 'muted sage green',
  oak: 'light natural oak',
  ivory: 'soft ivory',
};

/** Wall paint as it should read in a photograph. */
const WALL_DESC = {
  chalk: 'chalk-white painted walls',
  clay: 'warm clay-beige painted walls',
  slate: 'soft slate-blue painted walls',
};

/**
 * Per-room scene copy. `subject` states the room off the drawings; `light`
 * states where daylight comes from, which the openings fix.
 */
const ROOM_SCENE = {
  kitchen: {
    subject:
      'a new-build UK kitchen, 2.81 x 3.61 m, at the front of the ground floor. One wide window (W06) in the front elevation wall',
    fitout:
      'Howdens Shaker-style kitchen — rails and stiles around a recessed panel on every door — laid out as a U on three walls opening to the door, with a light quartz worktop, brushed-steel bar handles, the sink under the window, a tall oven housing closing one leg, and a metro-tile splashback. There is no island: the room is only 2.81 m wide and the two facing runs leave a gangway between them',
    floor: 'engineered oak floor',
    light:
      'daylight from the wide front window, two pendants down the middle of the gangway, warm interior lighting',
  },
  living: {
    subject:
      'a new-build UK living room, 4.95 x 3.23 m, across the full width of the rear ground floor. External garden doors (D01) and a window (W01) in the rear wall, the window nearest the outer corner',
    fitout:
      'a low fabric sofa with cushions and a throw over one arm set against the rear wall to the left of the garden doors, a media wall on the return wall opposite with an inset electric fire and a wall-mounted television over it, an armchair turned in toward the fire, a solid timber coffee table with a tray and books on it, a floor lamp and a large low-pile rug',
    floor: 'engineered oak floor',
    light:
      'strong daylight flooding in through the rear garden doors, soft bounce onto the ceiling, warm lamplight in the corner and a low amber glow from the fire',
  },
  dining: {
    subject:
      'a new-build UK dining room, 3.79 x 1.68 m, in the middle band of the ground floor between the kitchen at the front and the living room at the rear. No external window — doors D03/D04 off the hall',
    fitout:
      'a solid timber dining table with a rail under the top and six upholstered chairs, a sideboard against the long wall, a pendant centred over the table',
    floor: 'engineered oak floor',
    light:
      'borrowed daylight through the open doorways from the rooms either side, warm pendant light over the table as the key source',
  },
  master: {
    subject:
      'a new-build UK master bedroom, 3.64 x 2.76 m, at the rear of the first floor looking over the garden. One wide window (W10) in the rear wall',
    fitout:
      'a double bed with layered linen that drapes and folds, two bedside tables with lamps, a wardrobe against the side wall',
    floor: 'soft pale carpet',
    light: 'morning daylight from the wide rear window, warm bedside lamps',
  },
  bath: {
    subject:
      'a new-build UK family bathroom, 3.75 x 1.70 m, in the middle of the first floor. No external window — mechanically extracted, doors D11/D12',
    fitout:
      'a bath with an overhead shower and a glazed screen, large-format wall and floor tiling, a wall-hung basin with a mirror over, a heated towel rail, chrome brassware',
    floor: 'large-format tiled floor',
    light:
      'even warm ceiling downlights as the only source, soft reflections in the tiling and the glass screen',
  },
  hall: {
    subject:
      'a new-build UK entrance hall, 2.00 x 3.61 m, at the front of the ground floor beside the kitchen. A window (W07) and the front door (D07) side by side in the front wall behind the camera, and a door through to the kitchen',
    fitout:
      'a straight staircase rising against the outer side wall and carrying on up through all three floors, with a Howdens stop-chamfered balustrade — square-topped spindles chamfered along their middles, capped newel posts, a stained hardwood handrail and a closed painted string. A console table with a lamp and a mirror over it against the party wall, a runner on the floor, coat hooks and boots at the far end, and a cupboard door under the flight',
    floor: 'engineered oak floor',
    light:
      'daylight coming in over the shoulder from the front door and window, a pendant down the middle, the stairwell above falling away into shadow',
  },
  bed2: {
    subject:
      'a new-build UK bedroom on the top floor under a 40 degree pitched roof, 4.89 m long, with the ceiling sloping down to low eaves on both sides. A single rooflight (RL01) in the slope is its only opening — both side walls are internal',
    fitout:
      'a double bed set along the low eaves wall, bedside tables with lamps, a low chest where the ceiling comes down at the rear',
    floor: 'soft pale carpet',
    light:
      'daylight falling steeply through the rooflight onto the bed and floor, and nothing else — the room is lit from above',
  },
};

/** The shared tail: what makes it read as a photograph rather than a render. */
const CAMERA =
  'Architectural interior photography, 35mm lens, verticals kept vertical, natural exposure, realistic indirect bounce light and soft contact shadows. Yorkshire new-build, restrained and premium, styled but not cluttered. No people, no text, no watermark.';

/**
 * The manifest key an image answers to. Mirrors src/lib/cgi.ts: axes that do
 * not change this room's image are pinned.
 */
export function photorealKey(room, finishes) {
  const axes = PHOTOREAL_AXES[room] ?? [];
  const pick = (axis) => (axes.includes(axis) ? finishes[axis] : PINNED[axis]);
  return [room, ...AXES.map(pick)].join('|');
}

/** The render that is this job's structural reference, by its CGI manifest key. */
export function referenceKey(room, finishes) {
  const axes = PHOTOREAL_AXES[room] ?? [];
  const pick = { ...PINNED };
  for (const a of axes) pick[a] = finishes[a];
  return [room, ...AXES.map((a) => pick[a])].join('|');
}

function buildPrompt(room, finishes) {
  const scene = ROOM_SCENE[room];
  const walls = WALL_DESC[finishes.walls];
  let fitout = scene.fitout;
  if (room === 'kitchen') {
    fitout = fitout.replace(
      'Howdens Shaker-style kitchen',
      `Howdens Shaker-style kitchen in ${KITCHEN_DESC[finishes.kitchen]}`,
    );
  }
  // In a bathroom the tile is the room, so the range goes in the fit-out
  // rather than being left to the generic "large-format tiling".
  if (room === 'bath') {
    fitout = fitout.replace(
      'large-format wall and floor tiling',
      `large-format wall and floor tiling in ${TILE_DESC[finishes.tiles]}`,
    );
  }
  const floor = room === 'bath' ? `a floor tiled to match in ${TILE_DESC[finishes.tiles]}` : scene.floor;

  return [
    `Photoreal interior photograph of ${scene.subject}.`,
    `${fitout[0].toUpperCase()}${fitout.slice(1)}.`,
    `${walls[0].toUpperCase()}${walls.slice(1)}, ${floor}, white-painted skirting and a four-panel moulded internal door.`,
    `${scene.light[0].toUpperCase()}${scene.light.slice(1)}.`,
    'Match the reference image exactly for room shape, wall positions, window and door positions, furniture layout and camera angle — change only the material realism and the lighting.',
    CAMERA,
  ].join(' ');
}

/** The slug a job's files are named by: the room's own axes, in order. */
export function slugFor(room, finishes) {
  return `${room}--${(PHOTOREAL_AXES[room] ?? []).map((a) => finishes[a]).join('-')}`;
}

/**
 * Every job, in a stable order.
 *
 * One per combination of the values each of the room's axes is generated
 * across, with everything else pinned. Axis-driven rather than hardcoded to
 * units and walls, because the bathroom varies on its tile range and the hall
 * would vary on its balustrade if the budget went that way.
 */
export function photorealJobs() {
  const jobs = [];
  for (const room of PHOTOREAL_ROOMS) {
    const axes = PHOTOREAL_AXES[room] ?? [];
    let combos = [{ ...PINNED }];
    for (const axis of axes) {
      const next = [];
      for (const base of combos) {
        for (const value of PHOTOREAL_VALUES[axis] ?? [PINNED[axis]]) next.push({ ...base, [axis]: value });
      }
      combos = next;
    }
    for (const finishes of combos) {
      jobs.push({
        room,
        finishes,
        key: photorealKey(room, finishes),
        reference: referenceKey(room, finishes),
        slug: slugFor(room, finishes),
        prompt: buildPrompt(room, finishes),
      });
    }
  }
  return jobs;
}

/* ------------------------------------------------------------------ chain */

/**
 * The generation chain.
 *
 * Generating each colourway independently from its own render gave twelve
 * kitchens that read as twelve different kitchens: the model re-interprets the
 * room every time, and there is no seed to lock. So each room is generated
 * once as a base, and every other colourway is an edit of that finished
 * photoreal image rather than a fresh interpretation of a render. The edit is
 * then trivial — repaint a surface — and the geometry cannot drift.
 *
 * `from` is the slug this job is generated from: null means it comes from the
 * render, otherwise it comes from that job's accepted image.
 */
export function photorealChain() {
  const jobs = photorealJobs();
  const bySlug = new Map(jobs.map((j) => [j.slug, j]));
  const chain = [];
  const add = (slug, from, change) => {
    const job = bySlug.get(slug);
    if (!job) throw new Error(`chain references unknown job "${slug}"`);
    chain.push({ ...job, from, change });
  };
  const seen = new Set();
  const once = (slug, from, change) => {
    if (seen.has(slug)) return;
    seen.add(slug);
    add(slug, from, change);
  };

  for (const room of PHOTOREAL_ROOMS) {
    const axes = PHOTOREAL_AXES[room] ?? [];
    const base = slugFor(room, PINNED);

    // Wave 0 — the room's base, the only image made from a render.
    once(base, null, null);

    // Wave 1 — every axis except the walls, varied off that base. These are
    // the changes that alter a material rather than a colour, so each one is
    // an edit of the finished photograph and the geometry cannot drift.
    const others = axes.filter((a) => a !== 'walls');
    const roots = [{ finishes: { ...PINNED }, slug: base }];
    for (const axis of others) {
      for (const value of PHOTOREAL_VALUES[axis] ?? []) {
        if (value === PINNED[axis]) continue;
        const finishes = { ...PINNED, [axis]: value };
        const slug = slugFor(room, finishes);
        once(slug, base, `${axis}:${value}`);
        roots.push({ finishes, slug });
      }
    }

    // Wave 2 — the wall colours, each off the matching chalk-walled image.
    if (!axes.includes('walls')) continue;
    for (const root of roots) {
      for (const w of PHOTOREAL_VALUES.walls) {
        if (w === PINNED.walls) continue;
        once(slugFor(room, { ...root.finishes, walls: w }), root.slug, `walls:${w}`);
      }
    }
  }
  return chain;
}

/** Unit-door colour, for a recolour instruction. */
const UNIT_PLAIN = { graphite: 'dark graphite grey', sage: 'muted sage green', oak: 'light natural oak', ivory: 'soft ivory' };
const WALL_PLAIN = { chalk: 'chalk white', clay: 'warm clay beige', slate: 'soft slate blue' };

/**
 * The prompt for a chained edit: repaint one surface and leave the photograph
 * otherwise untouched.
 */
export function recolourPrompt(change) {
  const [axis, value] = change.split(':');
  let what;
  if (axis === 'kitchen') {
    what = `Repaint only the kitchen unit doors and drawer fronts to ${UNIT_PLAIN[value]}. The worktop stays light quartz, the splashback stays white metro tile, the handles stay brushed steel, the walls and floor are unchanged.`;
  } else if (axis === 'tiles') {
    // A tile swap is not a repaint, so it says so: same tiles in the same
    // places and the same sizes, a different stone.
    what =
      `Replace the material of the wall and floor tiles with ${TILE_DESC[value]}. Every tile stays exactly where it is, the same size, in the same layout, with the same grout joints in the same places — only the stone they are cut from changes. The sanitaryware, the shower screen, the brassware, the vanity, the towel rail, the painted walls and the ceiling are all unchanged.`;
  } else {
    what = `Repaint only the painted wall surfaces to ${WALL_PLAIN[value]}. Tiling, joinery, skirting, doors, flooring, furniture and fittings all keep their existing colours.`;
  }
  return [
    'Take this photograph and change one thing.',
    what,
    'Everything else must be pixel-for-pixel the same photograph: identical room shape, identical camera and framing, identical window and door positions, identical furniture in identical places, identical lighting, shadows and reflections. Do not restyle, re-light, re-stage or re-interpret the room. This is a paint change, nothing more.',
    'No people, no text, no watermark.',
  ].join(' ');
}
