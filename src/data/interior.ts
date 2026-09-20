/**
 * Room records, plan geometry and the finishes catalogue.
 *
 * Plan geometry is in millimetres off dwg 26/1362/03, measured x/y from the
 * front-left internal corner within a 5645 × 9490 external envelope (350 mm
 * walls). The plan graphic draws the front elevation at the top and the rear
 * garden at the bottom.
 */

export type FloorTag = 'GROUND' | 'FIRST' | 'SECOND';

export const FLOOR_TAGS: FloorTag[] = ['GROUND', 'FIRST', 'SECOND'];

/** External envelope of one dwelling, in millimetres. */
export const ENVELOPE = { width: 5645, depth: 9490 } as const;

export type PlanCell = {
  key: string;
  short: string;
  dims: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * The second-floor landing is a 0.98 m strip the en-suite is drawn inside,
   * so there is nowhere in it to put a name that the en-suite's would not sit
   * on top of. The cell still highlights and still clicks; the list beside the
   * plan and the cell's own tooltip carry the name.
   */
  noLabel?: true;
};

export type PlanFloor = {
  tag: FloorTag;
  name: string;
  note: string;
  foot: string;
  rooms: PlanCell[];
};

export const PLAN: PlanFloor[] = [
  {
    tag: 'GROUND',
    name: 'GROUND FLOOR',
    note: 'Hall, kitchen, dining, living',
    foot: 'FRONT ELEVATION AT THE TOP · REAR GARDEN AT THE BOTTOM',
    rooms: [
      { key: 'hall', short: 'HALL', dims: '2.00 × 3.61', x: 350, y: 350, w: 2000, h: 3610 },
      { key: 'kitchen', short: 'KITCHEN', dims: '2.81 × 3.61', x: 2490, y: 350, w: 2805, h: 3610 },
      { key: 'wc', short: 'W/C', dims: '1.06 × 1.68', x: 350, y: 4060, w: 1060, h: 1675 },
      { key: 'dining', short: 'DINING', dims: '3.79 × 1.68', x: 1510, y: 4060, w: 3785, h: 1675 },
      { key: 'living', short: 'LIVING', dims: '4.95 × 3.23', x: 350, y: 5885, w: 4945, h: 3230 },
    ],
  },
  {
    tag: 'FIRST',
    name: 'FIRST FLOOR',
    note: 'Master suite, bathroom, bedroom 3',
    foot: 'FRONT AT THE TOP · LANDING DOWN THE OUTER WALL',
    rooms: [
      { key: 'landing', short: 'LANDING', dims: '2.00 × 5.94', x: 350, y: 350, w: 2000, h: 5935 },
      { key: 'bed3', short: 'BEDROOM 3', dims: '2.80 × 2.95', x: 2490, y: 350, w: 2795, h: 2950 },
      { key: 'bath', short: 'BATHROOM', dims: '2.80 × 1.70', x: 2490, y: 3440, w: 2795, h: 1700 },
      { key: 'ensuite', short: 'EN-SUITE', dims: '1.10 × 2.76', x: 350, y: 6385, w: 1100, h: 2760 },
      { key: 'master', short: 'MASTER BED', dims: '3.75 × 2.76', x: 1550, y: 6385, w: 3745, h: 2760 },
    ],
  },
  {
    tag: 'SECOND',
    name: 'SECOND FLOOR',
    note: 'Bedroom 2 suite and stores',
    foot: 'FRONT AT THE TOP · ROOMS UNDER THE 40° PITCH',
    rooms: [
      { key: 'store', short: 'STORE', dims: '1.30 deep', x: 350, y: 350, w: 4945, h: 1300 },
      { key: 'landing2', short: 'LANDING', dims: '0.98 wide', x: 350, y: 1750, w: 975, h: 4890, noLabel: true },
      { key: 'ensuite2', short: 'EN-SUITE', dims: '0.98 × 2.61', x: 350, y: 2920, w: 975, h: 2610 },
      { key: 'bed2', short: 'BEDROOM 2', dims: '3.93 × 5.70', x: 1425, y: 1810, w: 3930, h: 5695 },
      { key: 'store2', short: 'STORE', dims: '1.45 deep', x: 350, y: 7695, w: 4945, h: 1450 },
    ],
  },
];

export type Room = {
  key: string;
  label: string;
  floor: FloorTag;
  level: string;
  size: string;
  openings: string;
  desc: string;
};

/**
 * Descriptive copy is written against the drawings and is the client-approved
 * wording — it is not paraphrased here.
 */
export const ROOMS: Room[] = [
  {
    key: 'hall',
    label: 'ENT. HALL',
    floor: 'GROUND',
    level: 'Ground floor · front, off the drive',
    size: '2.00 × 3.61 m',
    openings: 'Front door D07 · window W07 · stairs to all three floors · smoke alarm',
    desc: 'You come in at the front, beside the kitchen, into a proper entrance hall with the staircase rising through all three floors — not a corridor. Somewhere to put coats and boots down before the rest of the house begins. The staircase and balustrade are Howdens, and which of the three sets goes in is yours to choose.',
  },
  {
    key: 'kitchen',
    label: 'KITCHEN',
    floor: 'GROUND',
    level: 'Ground floor · front',
    size: '2.81 × 3.61 m',
    openings: 'Window W06 · heat alarm · mechanical extract',
    desc: 'The kitchen sits at the front of the plan next to the entrance hall, lit by a wide front window (W06 on the elevations). Units run in a U on three walls, opening to the door — at 2.81 m wide the room takes two facing runs and a proper gangway between them.',
  },
  {
    key: 'wc',
    label: 'W/C',
    floor: 'GROUND',
    level: 'Ground floor · middle, off the hall',
    size: '1.06 × 1.68 m',
    openings: 'Obscure-glazed W08 · extract fan',
    desc: 'A ground-floor W/C in the middle of the plan beside the stair, with obscured glazing and the same Al Murad tiling and brassware family as the bathrooms above.',
  },
  {
    key: 'dining',
    label: 'DINING ROOM',
    floor: 'GROUND',
    level: 'Ground floor · middle',
    size: '3.79 × 1.68 m',
    openings: 'Doors D03 / D04 off the hall',
    desc: 'The dining room occupies the middle band of the ground floor, between the kitchen at the front and the living room at the rear, so the table sits at the heart of the house rather than in a corner of it.',
  },
  {
    key: 'living',
    label: 'LIVING ROOM',
    floor: 'GROUND',
    level: 'Ground floor · rear, garden doors',
    size: '4.95 × 3.23 m',
    openings: 'Garden doors D01 · window W01 · steel beam over',
    desc: 'The full width of the house at the back — 4.95 m wide by 3.23 m — with external garden doors (D01) and window W01 beside them in the same wall, the window nearest the outer corner. Away from the drive and open to the rear garden. The render shows a media wall on the return wall with a television and an inset electric fire; that is a fit-out idea rather than anything on the drawings, and it is not included.',
  },
  {
    key: 'master',
    label: 'MASTER BEDROOM',
    floor: 'FIRST',
    level: 'First floor · rear',
    size: '3.75 × 2.76 m',
    openings: 'Window W10 · door D10 off the landing',
    desc: 'The principal bedroom takes the rear of the first floor, 3.75 m wide, looking over the garden, with its own en-suite and a fitted cupboard off the landing.',
  },
  {
    key: 'ensuite',
    label: 'EN-SUITE',
    floor: 'FIRST',
    level: 'First floor · off the master bedroom',
    size: '1.10 × 2.76 m',
    openings: 'Obscure-glazed W09 · door D09 off the master · extract',
    desc: 'A walk-in shower room to the master bedroom — glazed screen, large-format tiling, heated towel rail. Mechanically extracted, as noted on the plan. Tiled to match the family bathroom, from your Al Murad selection.',
  },
  {
    key: 'bath',
    label: 'BATHROOM',
    floor: 'FIRST',
    level: 'First floor · middle',
    size: '2.80 × 1.70 m',
    openings: 'Door D11 off the landing · mechanical extract',
    desc: 'The family bathroom sits in the middle of the first floor beside the landing, 2.80 m by 1.70 m. The plan puts the W/C and the basin along the long wall at the landing end and a 1500 mm bath across the far end against the party wall, with 100 mm clear at each end — which is exactly why the room is 1700 deep. Bath with overhead shower and a glazed screen, large-format tiling and a heated towel rail. Tiles are chosen from Al Murad; the four the renders show are a starting point, and the full range is open to you.',
  },
  {
    key: 'bed3',
    label: 'BEDROOM 3',
    floor: 'FIRST',
    level: 'First floor · front',
    size: '2.80 × 2.95 m',
    openings: 'Window W16 to the front · door D12 off the landing',
    desc: 'The third bedroom looks out over the front of the house, 2.80 m by 2.95 m — a comfortable single or double, or a generous study.',
  },
  {
    key: 'bed2',
    // Settled against sheet 26/1362/03 read at full resolution: the room is
    // dimensioned 3930 x 5695 on the drawing itself. The two figures that
    // used to disagree here — 2560 from the plan graphic and 3930 from the
    // description — were both wrong about the depth.
    label: 'BEDROOM 2',
    floor: 'SECOND',
    level: 'Second floor · the whole top storey',
    size: '3.93 × 5.70 m',
    openings: 'Rooflight RL01',
    desc: 'The top floor is one large bedroom under a 40° pitched roof — 3.93 m by 5.70 m, dimensioned on the plan — with its own en-suite, a store and a rooflight. The biggest room in the house by a distance.',
  },
  {
    key: 'landing',
    label: 'LANDING',
    floor: 'FIRST',
    level: 'First floor · down the outer wall',
    size: '2.00 × 5.94 m',
    openings: 'Window W17 · cupboard (Cup’d) · smoke alarm SD',
    desc: 'The first-floor landing runs 5.94 m down the outer wall and is a full 2.00 m wide — the same band the entrance hall occupies below it, which is what lets the staircase run up this side of the house through all three storeys. It serves every room on this floor, with the fitted cupboard marked Cup’d off it and a mains-powered interconnected smoke alarm shown on the plan.',
  },
  {
    key: 'landing2',
    label: 'TOP LANDING',
    floor: 'SECOND',
    level: 'Second floor · outer wall',
    size: '0.98 m wide',
    openings: 'Stair from the first floor · smoke alarm SD',
    desc: 'The top landing is 0.98 m wide against the outer wall, taking the stair up from the first floor and opening onto bedroom 2, its en-suite and both eaves stores.',
  },
  {
    key: 'ensuite2',
    label: 'EN-SUITE 2',
    floor: 'SECOND',
    level: 'Second floor · off bedroom 2',
    size: '0.98 × 2.61 m',
    openings: 'Door D17 · extract · SVP alongside',
    desc: 'The second en-suite serves bedroom 2 — 0.98 m by 2.61 m off the top landing, with the soil and vent pipe alongside and a mechanical extract into the eaves. Tiled from the same Al Murad selection as the rooms below.',
  },
  {
    key: 'store2',
    label: 'REAR STORE',
    floor: 'SECOND',
    level: 'Second floor · rear, in the eaves',
    size: '1.45 m deep',
    openings: 'Doors D21 / D22 into the eaves',
    desc: 'The rear eaves store, 1.45 m deep across the full width at the back of the top floor — the second of the two stores drawn into the roof space.',
  },
  {
    key: 'store',
    label: 'FRONT STORE',
    floor: 'SECOND',
    level: 'Second floor · front, in the eaves',
    size: '1.30 m deep',
    openings: 'Doors D18 / D22 into the eaves',
    desc: 'Two stores are drawn into the eaves on the top floor either side of the landing — the sort of storage most new homes lose.',
  },
];

export type FinishOption = { id: string; label: string; swatch: string; note?: string };
export type FinishGroupKey = 'kitchen' | 'walls' | 'doors' | 'floors' | 'carpet' | 'tiles' | 'stairs';
export type FinishGroup = { name: string; hint?: string; options: FinishOption[] };

export const FINISHES: Record<FinishGroupKey, FinishGroup> = {
  kitchen: {
    // Howdens, Shaker-style doors, confirmed with the client. The colour is
    // still the buyer's choice, which is what these four options are.
    name: 'Kitchen units',
    options: [
      { id: 'graphite', label: 'Graphite', swatch: '#3d4348' },
      { id: 'sage', label: 'Sage', swatch: '#7e8b73' },
      { id: 'oak', label: 'Light oak', swatch: '#c49a63' },
      { id: 'ivory', label: 'Ivory', swatch: '#e6dfd0' },
    ],
  },
  walls: {
    name: 'Wall paint',
    options: [
      { id: 'chalk', label: 'Chalk white', swatch: '#efece4' },
      { id: 'clay', label: 'Warm clay', swatch: '#d8c8b4' },
      { id: 'slate', label: 'Soft slate', swatch: '#9aa6ad' },
    ],
  },
  doors: {
    name: 'Internal doors',
    options: [
      { id: 'white', label: 'White panel', swatch: '#f2f2ef' },
      { id: 'oak', label: 'Oak veneer', swatch: '#b1855a' },
      { id: 'grey', label: 'Dark grey', swatch: '#4c5257' },
    ],
  },
  floors: {
    // The boarded floor, which is what goes down everywhere the buyer walks
    // shod: the hall, the kitchen, the dining and living rooms and both
    // landings. The bedrooms take a carpet instead and the tiled rooms take
    // their floor from the tile choice, so neither varies on this.
    name: 'Floor boards',
    hint: 'Downstairs and on both landings',
    options: [
      { id: 'oak', label: 'Natural oak', swatch: '#b08a5f', note: 'Pale natural-oak engineered board' },
      { id: 'smoked', label: 'Smoked oak', swatch: '#7c5c3e', note: 'Deep smoked-oak engineered board' },
      { id: 'grey', label: 'Grey wash', swatch: '#a8a29a', note: 'Grey-washed engineered board' },
      { id: 'stone', label: 'Stone', swatch: '#c2baae', note: 'Pale stone-effect plank' },
    ],
  },
  carpet: {
    // The bedroom carpet, chosen separately from the boards below stairs —
    // the two need to sit together but they are not the same decision, and a
    // buyer who wants a smoked-oak hall and a pale bedroom can have both.
    name: 'Carpets',
    hint: 'The three bedrooms',
    options: [
      { id: 'wool', label: 'Wool white', swatch: '#bdb6a9', note: 'Pale wool-look fitted carpet' },
      { id: 'greige', label: 'Greige', swatch: '#aea496', note: 'Warm greige fitted carpet' },
      { id: 'pebble', label: 'Pebble grey', swatch: '#aaa9a6', note: 'Cool pebble-grey fitted carpet' },
      { id: 'oatmeal', label: 'Oatmeal', swatch: '#c0b6a3', note: 'Oatmeal fitted carpet' },
    ],
  },
  tiles: {
    // Al Murad ranges. Al Murad is a UK tile retailer with a Huddersfield
    // presence, and the four below are ranges they list. The buyer picks the
    // exact tile in store; these four are what the renders show.
    name: 'Bathroom tiles',
    hint: 'Al Murad ranges — bathroom, en-suites and the W/C',
    options: [
      { id: 'calacatta', label: 'Calacatta Marmi', swatch: '#eeece6', note: 'Bright white marble effect with soft grey veining, Cosmopolitan range' },
      { id: 'capel', label: 'Capel Gold', swatch: '#e6dcc8', note: 'Warm white marble effect with gold veining' },
      { id: 'bardiglio', label: 'Bardiglio', swatch: '#98999a', note: 'Mid-grey marble effect' },
      { id: 'noir', label: 'Noir Grey', swatch: '#4c4d50', note: 'Deep charcoal, 297 × 598' },
    ],
  },
  stairs: {
    // Howdens stair parts, which is the joinery supplier used throughout.
    // Howdens' own stair-parts brand is Richard Burbidge, which is where the
    // glass panel option comes from.
    name: 'Staircase',
    hint: 'Howdens stair parts — hall and landings',
    options: [
      { id: 'chamfered', label: 'Painted chamfered', swatch: '#f4f2ed', note: 'Stop-chamfered spindles and newels, primed and painted, oak handrail' },
      { id: 'oak', label: 'Square oak', swatch: '#b1855a', note: 'Square oak spindles with oak newel caps and an oak handrail' },
      { id: 'glass', label: 'Glass panel', swatch: '#cfe0e6', note: 'Richard Burbidge glass stair panels with an oak handrail' },
    ],
  },
};

export type Finishes = {
  kitchen: string;
  walls: string;
  doors: string;
  floors: string;
  carpet: string;
  tiles: string;
  stairs: string;
};

export const DEFAULT_FINISHES: Finishes = {
  kitchen: 'graphite',
  walls: 'chalk',
  doors: 'white',
  floors: 'oak',
  carpet: 'wool',
  tiles: 'calacatta',
  stairs: 'chamfered',
};

export const FINISH_GROUP_KEYS: FinishGroupKey[] = [
  'kitchen',
  'walls',
  'doors',
  'floors',
  'carpet',
  'tiles',
  'stairs',
];

/** How each group reads in a sentence: "Graphite kitchen", "Bardiglio tiles". */
const FINISH_NOUN: Record<FinishGroupKey, string> = {
  kitchen: 'kitchen',
  walls: 'walls',
  doors: 'doors',
  floors: 'boards',
  carpet: 'carpet',
  tiles: 'tiles',
  stairs: 'staircase',
};

export function finishOption(group: FinishGroupKey, id: string): FinishOption {
  return FINISHES[group].options.find((o) => o.id === id) ?? FINISHES[group].options[0];
}

/**
 * The selection written out, for the enquiry and for the summary line.
 *
 * `groups` narrows it to the axes that change the room on screen, so the line
 * under the image describes what the visitor is actually looking at rather
 * than listing six choices four of which are not in the picture.
 */
export function finishSummary(
  finishes: Finishes,
  groups: FinishGroupKey[] = FINISH_GROUP_KEYS,
): string {
  return groups
    .map((g) => `${finishOption(g, finishes[g]).label} ${FINISH_NOUN[g]}`)
    .join(' · ');
}

export function planFloor(floor: FloorTag): PlanFloor {
  return PLAN.find((p) => p.tag === floor) ?? PLAN[0];
}

/** Title case for the room heading: "Ent. hall", "W/C", "Master bedroom". */
export function roomTitle(label: string): string {
  if (label === 'W/C') return 'W/C';
  return label.charAt(0) + label.slice(1).toLowerCase();
}
