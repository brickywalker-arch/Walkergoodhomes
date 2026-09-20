/**
 * The photoreal generation jobs: one per image, each pairing a rendered
 * reference with the prompt that describes it.
 *
 * The renders are the structural reference. Everything factual in a prompt
 * comes off sheets 26/1362/01-06 — room size, openings, storey — and the
 * fit-out wording is the confirmed Howdens specification. Nothing here
 * describes a feature the drawings do not show.
 *
 * Used by scripts/photoreal-refs.mjs to export the reference images, by
 * scripts/photoreal-plan.mjs to work out what is still outstanding, and by
 * scripts/prepare-photoreal.mjs to size the accepted results.
 */

/** Every room a visitor can open, which is every room on the plan. */
export const PHOTOREAL_ROOMS = [
  'hall', 'kitchen', 'wc', 'dining', 'living',
  'master', 'ensuite', 'bath', 'bed3', 'landing',
  'bed2', 'ensuite2', 'landing2', 'store', 'store2',
];

/**
 * Which finish axes change a photoreal image.
 *
 * Coarser than the renders' axes on one count only: the internal-door colour
 * is pinned, because at 0-7% of the frame across every room it is not
 * something a photograph can be trusted to hold steady. Everything else a
 * buyer can pick is generated, because it is visible — checked against the
 * renders rather than assumed. Listed in the canonical axis order, which is
 * what `slugFor` names a file by, so these lists must not be reordered.
 */
export const PHOTOREAL_AXES = {
  hall: ['walls', 'doors', 'floors', 'stairs'],
  kitchen: ['kitchen', 'walls', 'doors', 'floors'],
  wc: ['walls', 'tiles'],
  dining: ['walls', 'doors', 'floors'],
  living: ['walls', 'doors', 'floors'],
  master: ['walls', 'doors', 'carpet'],
  ensuite: ['walls', 'tiles'],
  bath: ['walls', 'tiles'],
  bed3: ['walls', 'doors', 'carpet'],
  landing: ['walls', 'doors', 'floors', 'stairs'],
  bed2: ['walls', 'doors', 'carpet'],
  ensuite2: ['walls', 'tiles'],
  landing2: ['walls', 'doors', 'floors', 'stairs'],
  store: ['walls'],
  store2: ['walls'],
};

/** Pinned values for the axes a photoreal image does not vary. */
export const PINNED = {
  kitchen: 'graphite',
  walls: 'chalk',
  doors: 'white',
  floors: 'oak',
  carpet: 'wool',
  tiles: 'calacatta',
  stairs: 'chamfered',
};

/** The order the axes appear in a manifest key. Must match src/lib/cgi.ts. */
export const AXES = ['kitchen', 'walls', 'doors', 'floors', 'carpet', 'tiles', 'stairs'];

export const KITCHEN_FINISHES = ['graphite', 'sage', 'oak', 'ivory'];
export const WALL_FINISHES = ['chalk', 'clay', 'slate'];
export const TILE_FINISHES = ['calacatta', 'capel', 'bardiglio', 'noir'];
export const FLOOR_FINISHES = ['oak', 'smoked', 'grey', 'stone'];
export const CARPET_FINISHES = ['wool', 'greige', 'pebble', 'oatmeal'];
export const DOOR_FINISHES = ['white', 'oak', 'grey'];
export const STAIR_FINISHES = ['chamfered', 'oak', 'glass'];

/**
 * The values each axis is generated across — every value the chooser offers.
 *
 * It used to list only the pinned value for floors and stairs, which meant a
 * buyer who changed either one dropped off the photoreal set and back onto the
 * render. That is the inconsistency this set exists to remove: an option is
 * either worth offering, in which case it is worth photographing, or it is not
 * offered at all.
 */
export const PHOTOREAL_VALUES = {
  kitchen: KITCHEN_FINISHES,
  walls: WALL_FINISHES,
  tiles: TILE_FINISHES,
  floors: FLOOR_FINISHES,
  carpet: CARPET_FINISHES,
  doors: DOOR_FINISHES,
  stairs: STAIR_FINISHES,
};

/**
 * The order a room's axes are generated in.
 *
 * Every image past the base is an edit of the one before it, so error
 * accumulates with depth. The hardest change to hold — the balustrade, which
 * is geometry rather than colour — goes closest to the base, and the most
 * forgiving ones go last.
 *
 * Doors are last for a second reason: they were added to a set that was
 * already complete without them, so putting them at the end makes every image
 * that already exists the parent of its own two door variants, and nothing
 * generated before has to be generated again.
 */
const CHAIN_ORDER = ['stairs', 'tiles', 'kitchen', 'floors', 'carpet', 'walls', 'doors'];

/** Tile range as it should read in a photograph. */
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
 * Floor covering as it should read in a photograph.
 *
 * Two materials on two separate axes: the boards go down on the ground floor
 * and the landings, the carpet goes down in the bedrooms, and a room takes one
 * or the other. `ROOM_SCENE[room].covering` says which, and that also picks
 * which axis the room varies on.
 */
const FLOOR_DESC = {
  board: {
    oak: 'a pale natural-oak engineered board floor',
    smoked: 'a deep smoked-oak engineered board floor',
    grey: 'a grey-washed engineered board floor',
    stone: 'a pale stone-effect plank floor',
  },
  carpet: {
    wool: 'a pale wool-look fitted carpet',
    greige: 'a warm greige fitted carpet',
    pebble: 'a cool pebble-grey fitted carpet',
    oatmeal: 'an oatmeal fitted carpet',
  },
};

/** Which axis a room's floor covering is chosen on. */
const COVERING_AXIS = { board: 'floors', carpet: 'carpet' };

/**
 * Internal doors as they should read in a photograph.
 *
 * The leaf is the same four-panel moulded door throughout — it is the finish
 * the buyer chooses, not the door — so each of these describes the same door
 * in a different finish and nothing else about it.
 */
const DOOR_DESC = {
  white: 'a white-painted four-panel moulded internal door with a brushed-steel lever handle',
  oak: 'an oak-veneered four-panel internal door in a clear satin lacquer, with a brushed-steel lever handle',
  grey: 'a dark grey painted four-panel moulded internal door with a brushed-steel lever handle',
};

/** Balustrade as it should read in a photograph. */
const STAIR_DESC = {
  chamfered:
    'a Howdens stop-chamfered balustrade — square-topped spindles chamfered along their middles, capped newel posts, a stained hardwood handrail and a closed painted string',
  oak: 'a Howdens square oak balustrade — plain square-section oak spindles, oak newel posts with square caps, an oak handrail and a closed painted string',
  glass:
    'a Richard Burbidge glass-panel balustrade — clear toughened glass panels in place of spindles, held top and bottom in oak rails, with oak newel posts, an oak handrail and a closed painted string',
};

/**
 * Per-room scene copy.
 *
 * `subject` states the room off the drawings and `light` states where daylight
 * comes from, which the openings fix. `covering` says which of the two floor
 * materials this room takes, and is absent where the floor is tiled or boarded
 * out and the floor axis does not apply.
 */
const ROOM_SCENE = {
  hall: {
    subject:
      'a new-build UK entrance hall, 2.00 x 3.61 m, at the front of the ground floor beside the kitchen. A window (W07) and the front door (D07) side by side in the front wall behind the camera, and a door through to the kitchen',
    fitout:
      'a straight staircase rising against the outer side wall and carrying on up through all three floors, with BALUSTRADE. A console table with a lamp and a mirror over it against the party wall, a runner on the floor, coat hooks and boots at the far end, and a cupboard door under the flight',
    covering: 'board',
    light:
      'daylight coming in over the shoulder from the front door and window, a pendant down the middle, the stairwell above falling away into shadow',
  },
  kitchen: {
    subject:
      'a new-build UK kitchen, 2.81 x 3.61 m, at the front of the ground floor. One wide window (W06) in the front elevation wall',
    fitout:
      'Howdens Shaker-style kitchen — rails and stiles around a recessed panel on every door — laid out as a U on three walls opening to the door, with a light quartz worktop, brushed-steel bar handles, the sink under the window, a tall oven housing closing one leg, and a metro-tile splashback. There is no island: the room is only 2.81 m wide and the two facing runs leave a gangway between them',
    covering: 'board',
    light:
      'daylight from the wide front window, two pendants down the middle of the gangway, warm interior lighting',
  },
  wc: {
    subject:
      'a very small new-build UK ground-floor cloakroom W/C, 1.06 x 1.68 m, in the middle of the plan beside the stair. One small obscure-glazed window (W08) set high in the long external wall, and the door in the wall at the near end',
    fitout:
      'a back-to-wall W/C with a concealed cistern and a tiled shelf over it, a small wall-hung basin with a mirror above, a slim chrome towel rail on the facing wall, large-format wall and floor tiling and chrome brassware',
    light:
      'soft daylight through the obscured glazing and one warm ceiling downlight, soft reflections in the tiling',
  },
  dining: {
    subject:
      'a new-build UK dining room, 3.79 x 1.68 m, in the middle band of the ground floor between the kitchen at the front and the living room at the rear. No external window — doors D03/D04 off the hall',
    fitout:
      'a solid timber dining table with a rail under the top and six upholstered chairs, a sideboard against the long wall, a pendant centred over the table',
    covering: 'board',
    light:
      'borrowed daylight through the open doorways from the rooms either side, warm pendant light over the table as the key source',
  },
  living: {
    subject:
      'a new-build UK living room, 4.95 x 3.23 m, across the full width of the rear ground floor. External garden doors (D01) and a window (W01) in the rear wall, the window nearest the outer corner',
    fitout:
      'a low fabric sofa with cushions and a throw over one arm set against the rear wall to the left of the garden doors, a media wall on the return wall opposite with an inset electric fire and a wall-mounted television over it, an armchair turned in toward the fire, a solid timber coffee table with a tray and books on it, a floor lamp and a large low-pile rug',
    covering: 'board',
    view:
      'Through the glazing, the enclosed rear garden only: lawn, a close-boarded timber fence along the boundary, and mature trees rising behind it. No other houses, no roofs and no roads are visible from this room',
    light:
      'strong daylight flooding in through the rear garden doors, soft bounce onto the ceiling, warm lamplight in the corner and a low amber glow from the fire',
  },
  master: {
    subject:
      'a new-build UK master bedroom, 3.75 x 2.76 m, at the rear of the first floor looking over the garden. One wide window (W10) in the rear wall',
    fitout:
      'a double bed with layered linen that drapes and folds, two bedside tables with lamps, a wardrobe against the side wall',
    covering: 'carpet',
    view:
      'Through the window, the enclosed rear garden only: lawn, a close-boarded timber fence along the boundary, and open green country rising behind it. No other houses are visible from this room',
    light: 'morning daylight from the wide rear window, warm bedside lamps',
  },
  ensuite: {
    subject:
      'a narrow new-build UK en-suite shower room, 1.10 x 2.76 m, off the master bedroom at the rear of the first floor. One small obscure-glazed window (W09) set high in the wall at the far end, and the door (D09) in the wall at the near end',
    fitout:
      'a walk-in shower at the window end on a level tiled tray behind a single fixed glazed screen, with a large round overhead rose and a hand shower on a rail; a wall-hung basin with a mirror over it on the long wall, a back-to-wall W/C at the near end, a slim heated towel rail opposite, large-format wall and floor tiling and chrome brassware',
    light:
      'daylight through the obscured window at the far end and warm ceiling downlights, soft reflections in the tiling and the glass screen',
  },
  bath: {
    subject:
      'a long narrow new-build UK family bathroom, 2.80 x 1.70 m, in the middle of the first floor. No external window — mechanically extracted, one door (D11) in the short wall at the near end',
    fitout:
      'a 1500 bath set across the far end of the room hard against the end wall, with an overhead shower and a glazed screen at its tap end; a back-to-wall W/C and a wall-hung basin with a mirror over it ranged along the long side wall; a heated towel rail on the opposite long wall; large-format wall and floor tiling, chrome brassware',
    light:
      'even warm ceiling downlights as the only source, soft reflections in the tiling and the glass screen',
  },
  bed3: {
    subject:
      'a new-build UK third bedroom at the front of the first floor, 2.80 x 2.95 m. One wide window (W16) centred in the front wall, and the door (D12) in the long side wall at the rear end',
    fitout:
      'a double bed along the party wall with its head to the rear and layered linen, a small bedside chest with a lamp on it, a desk and chair under the window, and a two-door wardrobe against the rear wall',
    covering: 'carpet',
    view:
      'Through the window, soft daylight and green planting beyond. No other houses, no roofs and no roads are visible from this room',
    light: 'daylight from the wide front window falling across the desk, warm lamplight by the bed',
  },
  landing: {
    subject:
      'a new-build UK first-floor landing, 2.00 m wide and 5.94 m long, running down the outer wall of the house. A window (W17) in the wall at the far end, three internal doors along the opposite side with the middle one standing open, and the stairwell opening in the floor on the near left',
    fitout:
      'BALUSTRADE guarding the stairwell on the left and carrying on up the next flight to the top floor; a fitted two-door cupboard at the far end past the last door, a runner on the floor and a ceiling-mounted smoke alarm',
    covering: 'board',
    light:
      'daylight from the window at the far end, a pendant down the middle, the stairwell falling away into shadow on the left',
  },
  bed2: {
    subject:
      'a new-build UK bedroom on the top floor under a 40 degree pitched roof, 3.93 x 5.70 m, with the ceiling sloping down to low eaves on both sides. A single rooflight (RL01) in the slope is its only opening — both side walls are internal',
    fitout:
      'a double bed set along the low eaves wall, bedside tables with lamps, a low chest where the ceiling comes down at the rear',
    covering: 'carpet',
    light:
      'daylight falling steeply through the rooflight onto the bed and floor, and nothing else — the room is lit from above',
  },
  ensuite2: {
    subject:
      'a narrow new-build UK en-suite shower room on the top floor under a 40 degree pitched roof, 0.98 x 2.61 m, off bedroom 2. No window — mechanically extracted into the eaves — with the ceiling sloping down on one side and the door in the wall at the far end',
    fitout:
      'a walk-in shower at the near end on a level tiled tray behind a single fixed glazed screen with a round overhead rose, a wall-hung basin with a mirror over it, a back-to-wall W/C at the far end, a boxed soil pipe in the corner beside it, large-format wall and floor tiling and chrome brassware',
    light:
      'warm ceiling downlights as the only source, soft reflections in the tiling and the glass screen',
  },
  landing2: {
    subject:
      'a narrow new-build UK top-floor landing under a 40 degree pitched roof, 0.98 m wide and 4.89 m long, against the outer wall. No window of its own — it borrows light from the rooms off it — with two doors along one side, the nearer one standing open, and a low eaves-store door in the end wall ahead',
    fitout:
      'BALUSTRADE guarding the stairwell in the near foreground on the left, where the flight arrives from the first floor, and a plain landing running away beyond it',
    covering: 'board',
    light:
      'soft borrowed daylight through the open door on the right and a warm ceiling downlight, the sloping ceiling catching most of it',
  },
  store: {
    subject:
      'a boarded-out eaves storage space in a new-build UK roof, 4.95 m wide and 1.30 m deep, running across the front of the top floor behind the rooms. The ceiling follows a 40 degree pitch down to a low outer eaves, and a low access door about a metre high stands open in the wall behind the camera',
    fitout:
      'plain painted plasterboard and a boarded floor, a low timber shelf along the back wall, a few neatly stacked storage boxes and a folded stepladder — clean and dry, a proper storage room rather than a junk space',
    floor: 'a plain boarded floor',
    joinery: 'plain painted plasterboard reveals and a low boarded access door — no skirting and no panelled doors in here',
    light: 'a single ceiling bulkhead light and daylight spilling in low through the open access door',
  },
  store2: {
    subject:
      'a boarded-out eaves storage space in a new-build UK roof, 4.95 m wide and 1.45 m deep, running across the rear of the top floor behind the rooms. The ceiling follows a 40 degree pitch down to a low outer eaves, and a low access door about a metre high stands open in the wall behind the camera',
    fitout:
      'plain painted plasterboard and a boarded floor, a low timber shelf along the back wall, a few neatly stacked storage boxes and a folded stepladder, and a capped air admittance valve standing in the eaves as noted on the drawing',
    floor: 'a plain boarded floor',
    joinery: 'plain painted plasterboard reveals and a low boarded access door — no skirting and no panelled doors in here',
    light: 'a single ceiling bulkhead light and daylight spilling in low through the open access door',
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

/** The floor this room takes, in the words a photograph needs. */
function floorPhrase(room, finishes) {
  const scene = ROOM_SCENE[room];
  if (!scene.covering) return scene.floor ?? `a floor tiled to match in ${TILE_DESC[finishes.tiles]}`;
  return FLOOR_DESC[scene.covering][finishes[COVERING_AXIS[scene.covering]]];
}

function buildPrompt(room, finishes) {
  const scene = ROOM_SCENE[room];
  const axes = PHOTOREAL_AXES[room] ?? [];
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
  if (axes.includes('tiles')) {
    fitout = fitout.replace(
      'large-format wall and floor tiling',
      `large-format wall and floor tiling in ${TILE_DESC[finishes.tiles]}`,
    );
  }
  // The balustrade is named where the room has one in frame.
  fitout = fitout.replace('BALUSTRADE', STAIR_DESC[finishes.stairs]);

  // A habitable room has skirting and a panelled door; a tiled wet room and a
  // boarded eaves store do not, and saying they do invents joinery. Where the
  // door is in shot its finish is the buyer's, so it is named rather than
  // assumed white.
  const joinery = scene.joinery
    ?? (axes.includes('doors')
      ? `white-painted skirting and ${DOOR_DESC[finishes.doors]}`
      : scene.covering
        ? 'white-painted skirting and a four-panel moulded internal door'
        : 'white-painted joinery');

  return [
    `Photoreal interior photograph of ${scene.subject}.`,
    `${fitout[0].toUpperCase()}${fitout.slice(1)}.`,
    `${walls[0].toUpperCase()}${walls.slice(1)}, ${floorPhrase(room, finishes)}, ${joinery}.`,
    scene.view ? `${scene.view}.` : null,
    `${scene.light[0].toUpperCase()}${scene.light.slice(1)}.`,
    'Match the reference image exactly for room shape, wall positions, window and door positions, furniture layout and camera angle — change only the material realism and the lighting.',
    CAMERA,
  ].filter(Boolean).join(' ');
}

/** The slug a job's files are named by: the room's own axes, in order. */
export function slugFor(room, finishes) {
  return `${room}--${(PHOTOREAL_AXES[room] ?? []).map((a) => finishes[a]).join('-')}`;
}

/**
 * Every job, in a stable order: one per combination of the values each of the
 * room's axes is generated across, with everything else pinned.
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
 * once as a base, and every other combination is reached by editing an image
 * that already exists, one axis at a time. The edit is then trivial — repaint
 * a surface, swap a material — and the geometry cannot drift.
 *
 * It is a cascade rather than a star: the axes are expanded in CHAIN_ORDER,
 * and each new image is an edit of the image that differs from it in exactly
 * one axis and has every later axis still at its pinned value. That reaches
 * the full cross product with every step a single change, and puts the change
 * that is hardest to hold — the balustrade — closest to the base.
 *
 * `from` is the slug this job is generated from; null means it comes from the
 * render. `depth` is how many edits deep it sits, so a caller can run a whole
 * generation in waves: everything at one depth can be generated at once.
 */
export function photorealChain() {
  const chain = [];
  const bySlug = new Map(photorealJobs().map((j) => [j.slug, j]));

  for (const room of PHOTOREAL_ROOMS) {
    const axes = CHAIN_ORDER.filter((a) => (PHOTOREAL_AXES[room] ?? []).includes(a));
    let combos = [{ ...PINNED }];

    // Wave 0 — the room's base, the only image made from a render.
    chain.push({ ...bySlug.get(slugFor(room, PINNED)), from: null, change: null, depth: 0 });

    let depth = 0;
    for (const axis of axes) {
      depth += 1;
      const grown = [...combos];
      for (const parent of combos) {
        for (const value of PHOTOREAL_VALUES[axis] ?? []) {
          if (value === PINNED[axis]) continue;
          const finishes = { ...parent, [axis]: value };
          chain.push({
            ...bySlug.get(slugFor(room, finishes)),
            from: slugFor(room, parent),
            change: `${axis}:${value}`,
            depth,
          });
          grown.push(finishes);
        }
      }
      combos = grown;
    }
  }
  return chain;
}

/** Unit-door colour, for a recolour instruction. */
const UNIT_PLAIN = { graphite: 'dark graphite grey', sage: 'muted sage green', oak: 'light natural oak', ivory: 'soft ivory' };
const WALL_PLAIN = { chalk: 'chalk white', clay: 'warm clay beige', slate: 'soft slate blue' };

/**
 * The prompt for a chained edit: change one thing and leave the photograph
 * otherwise untouched.
 *
 * `room` is kept for the axes whose wording depends on which room is being
 * edited; the boards and the carpet are separate axes now, so the floor case
 * no longer has to work out which material the room takes.
 */
export function recolourPrompt(change, room) {
  const [axis, value] = change.split(':');
  let what;
  if (axis === 'kitchen') {
    what = `Repaint only the kitchen unit doors and drawer fronts to ${UNIT_PLAIN[value]}. The worktop stays light quartz, the splashback stays white metro tile, the handles stay brushed steel, the walls and floor are unchanged.`;
  } else if (axis === 'tiles') {
    // A tile swap is not a repaint, so it says so: same tiles in the same
    // places and the same sizes, a different stone.
    what =
      `Replace the material of the wall and floor tiles with ${TILE_DESC[value]}. Every tile stays exactly where it is, the same size, in the same layout, with the same grout joints in the same places — only the stone they are cut from changes. Every fitting in the room is unchanged and nothing is added to it: the sanitaryware, the brassware, the towel rail, any glazed screen or mirror already present, the painted walls and the ceiling all stay exactly as they are.`;
  } else if (axis === 'floors' || axis === 'carpet') {
    const covering = axis === 'carpet' ? 'carpet' : 'board';
    what =
      `Replace the floor covering with ${FLOOR_DESC[covering][value]}. It covers exactly the same area and meets the skirting on the same line, and everything standing on it — furniture, rugs, doors, fittings — stays exactly where it is and keeps its own colour. The walls, ceiling, joinery and lighting are unchanged.`;
  } else if (axis === 'doors') {
    // The door is a small part of most of these frames, so the instruction
    // says what not to touch at least as firmly as what to change: a model
    // given a nearly-identical picture will otherwise repaint the skirting
    // and the architrave along with the leaf.
    //
    // It also has to be told not to make more doors. On a landing with three
    // of them in shot the first attempts turned the fitted cupboard into a
    // single door and hung a new one on a blank wall — a change to the plan,
    // not to the finish. And built-in joinery has to be told apart from
    // furniture: a fitted wardrobe matching the doors is right, a freestanding
    // one repainted to match them is a picture of different furniture.
    // A kitchen is wall-to-wall built-in cupboards, so the joinery sentence
    // below would hand the buyer's door finish to every unit in the room. The
    // units are their own axis and are named as off-limits before anything
    // else is said.
    const unitsSafe = room === 'kitchen'
      ? ' The fitted kitchen is not an internal door and does not change: every unit door, drawer front, tall housing, end panel and plinth keeps exactly the colour and material it has now.'
      : '';
    what =
      `Refinish the internal doors that are already in this photograph so that each one reads as ${DOOR_DESC[value]}.${unitsSafe} This means the internal doors only: the external doors and the windows are not internal doors, so the front door, any garden or patio doors and every window keep exactly the frame colour and material they have now. Count the internal doors first and end with exactly the same ones: do not add a door anywhere, do not take one away, and do not turn a wall, a panel, a recess or a cupboard front into a door. Every door stays exactly where it is, the same width and height, the same number of panels, hung on the same side, standing open or closed exactly as it is now, with its architrave, frame and hinges unchanged and its handle the same handle in the same place. A cupboard built into the fabric of the room — a fitted wardrobe, an airing cupboard, an under-stair door — is joinery and takes the same finish, keeping its own shape, its own number of leaves and its own handles. Furniture standing on the floor is not: a freestanding wardrobe, a chest, a desk or a bedside table keeps its own colour and its own material. The skirting, the architraves, the walls, the floor, any staircase or balustrade in shot, the furniture and the lighting all keep their existing colours.`;
  } else if (axis === 'stairs') {
    what =
      `Replace only the staircase balustrade with ${STAIR_DESC[value]}. The flight itself is unchanged: the same treads and risers in the same places, the same pitch, the same painted string, the same position in the room. Only the spindles, the newel posts and the handrail change. The walls, floor, doors, furniture and lighting are unchanged.`;
  } else {
    what = `Repaint only the painted wall surfaces to ${WALL_PLAIN[value]}. Tiling, joinery, skirting, doors, flooring, furniture and fittings all keep their existing colours.`;
  }
  return [
    'Take this photograph and change one thing.',
    what,
    'Everything else must be pixel-for-pixel the same photograph: identical room shape, identical camera and framing, identical window and door positions, identical furniture in identical places, identical lighting, shadows and reflections. Do not restyle, re-light, re-stage or re-interpret the room.',
    'No people, no text, no watermark.',
  ].join(' ');
}
