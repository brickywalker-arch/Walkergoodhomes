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
      { key: 'landing', short: 'LANDING', dims: '1.11 wide', x: 350, y: 350, w: 1110, h: 6035 },
      { key: 'bed3', short: 'BEDROOM 3', dims: '3.75 × 2.95', x: 1560, y: 350, w: 3735, h: 2950 },
      { key: 'bath', short: 'BATHROOM', dims: '3.75 × 1.70', x: 1560, y: 3400, w: 3735, h: 1700 },
      { key: 'ensuite', short: 'EN-SUITE', dims: '1.21 × 2.76', x: 350, y: 6385, w: 1210, h: 2760 },
      { key: 'master', short: 'MASTER BED', dims: '3.64 × 2.76', x: 1660, y: 6385, w: 3635, h: 2760 },
    ],
  },
  {
    tag: 'SECOND',
    name: 'SECOND FLOOR',
    note: 'Bedroom 2 suite and stores',
    foot: 'FRONT AT THE TOP · ROOMS UNDER THE 40° PITCH',
    rooms: [
      { key: 'store', short: 'STORE', dims: '1.30 deep', x: 350, y: 350, w: 4945, h: 1300 },
      { key: 'landing2', short: 'LANDING', dims: '0.98 wide', x: 350, y: 1750, w: 975, h: 4890 },
      { key: 'ensuite2', short: 'EN-SUITE', dims: '1.21 × 1.90', x: 1425, y: 1750, w: 1210, h: 1900 },
      { key: 'bed2', short: 'BEDROOM 2', dims: '2.56 × 4.89', x: 2735, y: 1750, w: 2560, h: 4890 },
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
    openings: 'Front door D07 · stairs to all three floors · smoke alarm',
    desc: 'You come in at the front, beside the kitchen, into a proper entrance hall with the staircase rising through all three floors — not a corridor. Somewhere to put coats and boots down before the rest of the house begins.',
  },
  {
    key: 'kitchen',
    label: 'KITCHEN',
    floor: 'GROUND',
    level: 'Ground floor · front',
    size: '2.81 × 3.61 m',
    openings: 'Windows W05 / W06 · heat alarm · mechanical extract',
    desc: 'The kitchen sits at the front of the plan next to the entrance hall, lit by two front windows (W05 and W06 on the elevations). Units run in a U on three walls, opening to the door — at 2.81 m wide the room takes two facing runs and a proper gangway between them.',
  },
  {
    key: 'wc',
    label: 'W/C',
    floor: 'GROUND',
    level: 'Ground floor · middle, off the hall',
    size: '1.06 × 1.68 m',
    openings: 'Obscure-glazed W08 · extract fan',
    desc: 'A ground-floor W/C in the middle of the plan beside the stair, with obscured glazing and the same tiling and brassware family as the bathrooms above.',
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
    desc: 'The full width of the house at the back — 4.96 m wide by 3.23 m — with external garden doors (D01/D02) and a window either side. Away from the drive and open to the rear garden.',
  },
  {
    key: 'master',
    label: 'MASTER BEDROOM',
    floor: 'FIRST',
    level: 'First floor · rear',
    size: '3.64 × 2.76 m',
    openings: 'Windows W10 / W11 · door D10',
    desc: 'The principal bedroom takes the rear of the first floor, 3.75 m deep, looking over the garden, with its own en-suite and a fitted cupboard off the landing.',
  },
  {
    key: 'ensuite',
    label: 'EN-SUITE',
    floor: 'FIRST',
    level: 'First floor · off the master bedroom',
    size: '1.21 × 2.76 m',
    openings: 'Obscure-glazed W09 · door D09 · extract',
    desc: 'A walk-in shower room to the master bedroom — glazed screen, large-format tiling, heated towel rail. Mechanically extracted, as noted on the plan.',
  },
  {
    key: 'bath',
    label: 'BATHROOM',
    floor: 'FIRST',
    level: 'First floor · middle',
    size: '3.75 × 1.70 m',
    openings: 'Doors D11 / D12 · mechanical extract',
    desc: 'The family bathroom sits in the middle of the first floor beside the landing — bath with overhead shower, large-format tiling and a heated towel rail.',
  },
  {
    key: 'bed3',
    label: 'BEDROOM 3',
    floor: 'FIRST',
    level: 'First floor · front',
    size: '3.75 × 2.95 m',
    openings: 'Windows W16 / W17 to the front',
    desc: 'The third bedroom looks out over the front of the house, 2.95 m deep — a comfortable single or double, or a generous study.',
  },
  {
    key: 'bed2',
    // NOTE — the two figures quoted for this room disagree, and both came
    // through in the approved copy:
    //   `size` (2.56 m) follows the plan graphic above, where the top landing
    //   and en-suite are tiled across the full width alongside the bedroom.
    //   `desc` (3.93 m) follows sheet 26/1362/03, where they only run part of
    //   the depth, so the bedroom is wider than the plan graphic shows.
    // Sheet 03 dimensions Bedroom 2 as 3930 x 4890. Confirm with the architect
    // which figure should be published, then make both agree.
    label: 'BEDROOM 2',
    floor: 'SECOND',
    level: 'Second floor · the whole top storey',
    size: '2.56 × 4.89 m',
    openings: 'Rooflights RL01 / RL02 · window W18',
    desc: 'The top floor is one large bedroom — 4.89 m by 3.93 m under a 40° pitched roof, with its own en-suite, a store and a rooflight. The biggest room in the house.',
  },
  {
    key: 'landing',
    label: 'LANDING',
    floor: 'FIRST',
    level: 'First floor · down the outer wall',
    size: '1.11 m wide',
    openings: 'Cupboard (Cup’d) · smoke alarm SD',
    desc: 'The first-floor landing runs the depth of the house against the outer wall — 1.11 m wide — serving every room on this floor, with the fitted cupboard marked Cup’d off it and a mains-powered interconnected smoke alarm shown on the plan.',
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
    size: '1.21 × 1.90 m',
    openings: 'Door D17 · extract · SVP alongside',
    desc: 'The second en-suite serves bedroom 2 — 1.21 m by 1.90 m off the top landing, with the soil and vent pipe alongside and a mechanical extract into the eaves.',
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

export type FinishOption = { id: string; label: string; swatch: string };
export type FinishGroupKey = 'kitchen' | 'walls' | 'doors';
export type FinishGroup = { name: string; options: FinishOption[] };

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
};

export type Finishes = { kitchen: string; walls: string; doors: string };

export const DEFAULT_FINISHES: Finishes = { kitchen: 'graphite', walls: 'chalk', doors: 'white' };

export const FINISH_GROUP_KEYS: FinishGroupKey[] = ['kitchen', 'walls', 'doors'];

export function finishOption(group: FinishGroupKey, id: string): FinishOption {
  return FINISHES[group].options.find((o) => o.id === id) ?? FINISHES[group].options[0];
}

/** "Graphite kitchen · Chalk white walls · white panel doors" */
export function finishSummary(finishes: Finishes): string {
  return [
    `${finishOption('kitchen', finishes.kitchen).label} kitchen`,
    `${finishOption('walls', finishes.walls).label} walls`,
    `${finishOption('doors', finishes.doors).label.toLowerCase()} doors`,
  ].join(' · ');
}

export function planFloor(floor: FloorTag): PlanFloor {
  return PLAN.find((p) => p.tag === floor) ?? PLAN[0];
}

/** Title case for the room heading: "Ent. hall", "W/C", "Master bedroom". */
export function roomTitle(label: string): string {
  if (label === 'W/C') return 'W/C';
  return label.charAt(0) + label.slice(1).toLowerCase();
}
