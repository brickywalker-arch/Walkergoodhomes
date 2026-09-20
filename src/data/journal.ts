/**
 * The build record for Hoyle Ing, and the general build sequence.
 *
 * Two rules govern this file.
 *
 * Dates come from the development timeline and nowhere else. Where a stage
 * has no published date, it says so — "date to be confirmed" is a fact, an
 * invented month is not.
 *
 * Every description is drawn from the issued drawings and the confirmed
 * specification (sheets 26/1362/01–06). None of it describes work in a way
 * the drawings do not support.
 *
 * `photos` is empty on every stage. There are no site photographs in the
 * repository, and a construction journal illustrated with stock imagery is
 * worse than one that admits it is waiting for the real thing. The component
 * renders an honest placeholder and lights up the moment photographs are
 * dropped in.
 */

export type StageStatus = 'complete' | 'current' | 'upcoming';

export type JournalStage = {
  num: string;
  title: string;
  status: StageStatus;
  /** As published on the development timeline, or null where none is set. */
  when: string | null;
  body: string;
  photos: { src: string; alt: string }[];
  /** True once there is footage to show. */
  video: boolean;
};

export const JOURNAL_STAGES: JournalStage[] = [
  {
    num: '01',
    title: 'Ground remediation',
    status: 'complete',
    when: 'Complete · March 2026',
    body: 'The site prepared and levels set. A gas membrane is laid into the ground floor build-up, as specified on the issued drawings.',
    photos: [],
    video: false,
  },
  {
    num: '02',
    title: 'Piling & foundations',
    status: 'complete',
    when: 'Complete · March 2026',
    body: 'Pile foundations with 450 × 450 reinforced concrete ground beams, to the structural engineer’s design. On a sloping site this is what lets the two homes step down rather than cut into the hill.',
    photos: [],
    video: false,
  },
  {
    num: '03',
    title: 'Structure',
    status: 'complete',
    when: 'Complete · August 2026',
    body: 'Beam and block ground floor, 170 × 47 mm C24 joists at 400 mm centres above, and steel beams, purlins and IG lintels over the openings. The party wall between the two dwellings is built to be sound tested on completion.',
    photos: [],
    video: false,
  },
  {
    num: '04',
    title: 'Stonework',
    status: 'complete',
    when: 'Complete · June 2026',
    body: 'Marshalls ‘Epoch’ stone coursing to the outer leaf, 150 mm Dritherm 32 full-fill insulation, 100 mm blockwork inner leaf. The stone rises with the structure rather than after it.',
    photos: [],
    video: false,
  },
  {
    num: '05',
    title: 'Roof',
    status: 'current',
    when: 'In progress · this week',
    body: 'A 40° pitch on 150 × 47 mm C24 rafters at 400 mm centres. Where the ceiling follows the rafters on the top floor, 120 mm Celotex XR4000 between and 60 mm GA4000 below. Watertight is the milestone here.',
    photos: [],
    video: false,
  },
  {
    num: '06',
    title: 'First fix',
    status: 'upcoming',
    when: 'Expected October 2026',
    body: 'Services run before anything closes up: mains-powered interconnected smoke alarms to the hall and both landings, a heat alarm to the kitchen, mechanical extract to the kitchen, W/C, bathroom and en-suites.',
    photos: [],
    video: false,
  },
  {
    num: '07',
    title: 'Interiors',
    status: 'upcoming',
    when: 'Expected November 2026',
    body: 'Howdens kitchen and joinery, sanitaryware, tiling and decoration. This is the stage a reserved buyer’s finish selections are fitted — which is why the choices on this site are worth making early.',
    photos: [],
    video: false,
  },
  {
    num: '08',
    title: 'Landscaping',
    status: 'upcoming',
    when: null,
    body: 'Parking, the surface water gully and drainage channel, boundaries and planting, as set out on the block plan. Surface water goes to a geocellular attenuation tank giving 8 m³ of storage.',
    photos: [],
    video: false,
  },
  {
    num: '09',
    title: 'Completed homes',
    status: 'upcoming',
    when: 'Target late November 2026',
    body: 'Sound testing, air testing, commissioning and handover. Keys, warranty documents and the full drawing set go to the buyer.',
    photos: [],
    video: false,
  },
];

/**
 * The six-step build sequence, for the immersive section.
 *
 * Each step carries a real image from the repository rather than a stock
 * photograph, and they are ordered so the sequence moves from the architect's
 * drawings into the modelled and generated interiors — drawing, to section, to
 * fabric, to finished room.
 */
export type BuildStep = {
  key: string;
  title: string;
  line: string;
  /** Which image resolver to use, and its key. */
  image:
    | { from: 'sheet'; slug: string }
    | { from: 'photo'; key: string }
    | { from: 'room'; room: string };
  caption: string;
};

export const BUILD_STEPS: BuildStep[] = [
  {
    key: 'ground',
    title: 'GROUND',
    line: 'Levels, drainage and the ground the homes stand on.',
    image: { from: 'sheet', slug: '06-block-plan' },
    caption: 'Proposed block plan · dwg 26/1362/06',
  },
  {
    key: 'structure',
    title: 'STRUCTURE',
    line: 'Piles, beams and joists. Three storeys, set into a slope.',
    image: { from: 'sheet', slug: '04-section' },
    caption: 'Proposed section · dwg 26/1362/04',
  },
  {
    key: 'fabric',
    title: 'FABRIC',
    line: 'Yorkshire stone outside, 150 mm of insulation in the cavity.',
    image: { from: 'photo', key: 'hero' },
    caption: 'Plots 1 & 2 · computer-generated image',
  },
  {
    key: 'services',
    title: 'SERVICES',
    line: 'Heating, power, extract and alarms, run before anything closes up.',
    image: { from: 'sheet', slug: '03-floor-plans' },
    caption: 'Proposed floor plans · dwg 26/1362/03',
  },
  {
    key: 'interiors',
    title: 'INTERIORS',
    line: 'Howdens kitchen and joinery. The choices that are yours to make.',
    image: { from: 'room', room: 'kitchen' },
    caption: 'Kitchen · generated from the drawn model',
  },
  {
    key: 'handover',
    title: 'HANDOVER',
    line: 'Sound tested, air tested, commissioned. Then the keys.',
    image: { from: 'room', room: 'living' },
    caption: 'Living room · generated from the drawn model',
  },
];
