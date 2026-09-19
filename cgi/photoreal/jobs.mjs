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
export const PHOTOREAL_ROOMS = ['kitchen', 'living', 'dining', 'master', 'bath', 'bed2'];

/**
 * Which finish axes change a photoreal image. Coarser than the renders'
 * axes: the internal-door colour is barely visible in these six rooms, so it
 * is pinned and the door axis collapses.
 */
export const PHOTOREAL_AXES = {
  kitchen: ['kitchen', 'walls'],
  living: ['walls'],
  dining: ['walls'],
  master: ['walls'],
  bath: ['walls'],
  bed2: ['walls'],
};

/** Pinned values for the axes a photoreal image does not vary. */
export const PINNED = { kitchen: 'graphite', walls: 'chalk', doors: 'white' };

export const KITCHEN_FINISHES = ['graphite', 'sage', 'oak', 'ivory'];
export const WALL_FINISHES = ['chalk', 'clay', 'slate'];

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
      'a new-build UK kitchen, 2.81 x 3.61 m, at the front of the ground floor. Two windows (W05 and W06) in the front elevation wall',
    fitout:
      'Howdens Shaker-style kitchen — rails and stiles around a recessed panel on every door — laid out as a U on three walls opening to the door, with a light quartz worktop, brushed-steel bar handles, the sink under the windows, a tall oven housing closing one leg, and a metro-tile splashback. There is no island: the room is only 2.81 m wide and the two facing runs leave a gangway between them',
    floor: 'engineered oak floor',
    light:
      'daylight from the two front windows, two pendants down the middle of the gangway, warm interior lighting',
  },
  living: {
    subject:
      'a new-build UK living room, 4.95 x 3.23 m, across the full width of the rear ground floor. External garden doors (D01/D02) and a window (W01) in the rear wall',
    fitout:
      'a low fabric sofa with cushions, a slim media unit, a floor lamp and a large low-pile rug',
    floor: 'engineered oak floor',
    light:
      'strong daylight flooding in through the rear garden doors, soft bounce onto the ceiling, warm lamplight in the corner',
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
      'a new-build UK master bedroom, 3.64 x 2.76 m, at the rear of the first floor looking over the garden. Two windows (W10 and W11) in the rear wall',
    fitout:
      'a double bed with layered linen that drapes and folds, two bedside tables with lamps, a wardrobe against the side wall',
    floor: 'soft pale carpet',
    light: 'morning daylight from the two rear windows, warm bedside lamps',
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
  bed2: {
    subject:
      'a new-build UK bedroom on the top floor under a 40 degree pitched roof, 4.89 m long, with the ceiling sloping down to low eaves on both sides. Two rooflights (RL01, RL02) in the slope and a window (W18) in the gable',
    fitout:
      'a double bed set along the low eaves wall, a bedside table with a lamp, a small armchair under the gable window',
    floor: 'soft pale carpet',
    light:
      'daylight falling steeply through the two rooflights onto the bed and floor, softer light from the gable window',
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
  return `${room}|${pick('kitchen')}|${pick('walls')}|${pick('doors')}`;
}

/** The render that is this job's structural reference, by its CGI manifest key. */
export function referenceKey(room, finishes) {
  const kitchen = room === 'kitchen' ? finishes.kitchen : PINNED.kitchen;
  return `${room}|${kitchen}|${finishes.walls}|${PINNED.doors}`;
}

function buildPrompt(room, finishes) {
  const scene = ROOM_SCENE[room];
  const walls = WALL_DESC[finishes.walls];
  const fitout =
    room === 'kitchen'
      ? scene.fitout.replace('Howdens Shaker-style kitchen', `Howdens Shaker-style kitchen in ${KITCHEN_DESC[finishes.kitchen]}`)
      : scene.fitout;

  return [
    `Photoreal interior photograph of ${scene.subject}.`,
    `${fitout[0].toUpperCase()}${fitout.slice(1)}.`,
    `${walls[0].toUpperCase()}${walls.slice(1)}, ${scene.floor}, white-painted skirting and a four-panel moulded internal door.`,
    `${scene.light[0].toUpperCase()}${scene.light.slice(1)}.`,
    'Match the reference image exactly for room shape, wall positions, window and door positions, furniture layout and camera angle — change only the material realism and the lighting.',
    CAMERA,
  ].join(' ');
}

/** All 27 jobs, in a stable order. */
export function photorealJobs() {
  const jobs = [];
  for (const room of PHOTOREAL_ROOMS) {
    const kitchens = room === 'kitchen' ? KITCHEN_FINISHES : [PINNED.kitchen];
    for (const kitchen of kitchens) {
      for (const walls of WALL_FINISHES) {
        const finishes = { kitchen, walls, doors: PINNED.doors };
        jobs.push({
          room,
          finishes,
          key: photorealKey(room, finishes),
          reference: referenceKey(room, finishes),
          slug: `${room}--${kitchen}-${walls}`,
          prompt: buildPrompt(room, finishes),
        });
      }
    }
  }
  return jobs;
}
