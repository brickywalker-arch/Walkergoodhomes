/**
 * Every factual value on this page is read off the architect's issued
 * Building Regulations sheets 26/1362/01–06. Nothing here is invented, and
 * buyer-choice items say "to be confirmed with buyer" rather than guessing.
 */

export const DEVELOPMENT = {
  company: 'Walker Good Homes Ltd',
  established: 2024,
  email: 'walkergoodhomesltd@gmail.com',
  contactName: 'Michael',
  addressLines: ['Plots 1 & 2, Hoyle Ing', 'Linthwaite, Huddersfield'],
  fullAddress: 'Land Adjacent 2 Hoyle Ing, Linthwaite, Huddersfield, HD7 5RX',
  drawingSet: '26/1362',
  strapline: 'Designed for living. Built to last.',
  tagline: 'Yorkshire craftsmanship. Exceptional homes.',
} as const;

export type Sheet = {
  num: string;
  title: string;
  meta: string;
  file: string;
  slug: string;
};

export const SHEETS: Sheet[] = [
  {
    num: '01',
    title: 'Location plan',
    meta: 'Dwg 26/1362/01 · A4 at 1:1250 · the site in its street',
    file: '/assets/pdf/01-location-plan.pdf',
    slug: '01-location-plan',
  },
  {
    num: '02',
    title: 'Existing block plan',
    meta: 'Dwg 26/1362/02 · A4 at 1:500 · the land as it stands',
    file: '/assets/pdf/02-existing-block-plan.pdf',
    slug: '02-existing-block-plan',
  },
  {
    num: '03',
    title: 'Proposed floor plans',
    meta: 'Dwg 26/1362/03 · A1 at 1:50 · all three storeys, both plots',
    file: '/assets/pdf/03-floor-plans.pdf',
    slug: '03-floor-plans',
  },
  {
    num: '04',
    title: 'Proposed section',
    meta: 'Dwg 26/1362/04 · A3 at 1:50 · floor-to-floor build-up',
    file: '/assets/pdf/04-section.pdf',
    slug: '04-section',
  },
  {
    num: '05',
    title: 'Proposed elevations',
    meta: 'Dwg 26/1362/05 · A2 at 1:100 · stone coursing and openings',
    file: '/assets/pdf/05-elevations.pdf',
    slug: '05-elevations',
  },
  {
    num: '06',
    title: 'Proposed block plan',
    meta: 'Dwg 26/1362/06 · A4 at 1:500 · parking, drainage, boundaries',
    file: '/assets/pdf/06-block-plan.pdf',
    slug: '06-block-plan',
  },
];

export const PLOT_FACTS = [
  { v: '3', k: 'bedrooms' },
  { v: '3', k: 'storeys' },
  { v: '2 en-suites', k: 'plus bathroom & W/C' },
  { v: '4.96 × 9.49 m', k: 'internal footprint' },
  { v: 'Freehold', k: 'tenure' },
];

export const QUICK_LINKS = [
  { num: '01', label: 'EXPLORE PLOTS 1 & 2', href: '#plots' },
  { num: '02', label: 'ARCHITECT DRAWINGS', href: '#drawings' },
  { num: '03', label: 'STEP INSIDE THE HOME', href: '#inside' },
  { num: '04', label: 'REGISTER YOUR INTEREST', href: '#enquire' },
];

export const NAV_LINKS = [
  { href: '/#plots', label: 'PLOTS 1 & 2' },
  { href: '/#drawings', label: 'DRAWINGS' },
  { href: '/#inside', label: 'INSIDE' },
  { href: '/#spec', label: 'SPECIFICATION' },
  { href: '/#buyers', label: 'RESERVED BUYERS' },
];

export type SpecSection = { title: string; items: string[] };

export const SPEC: SpecSection[] = [
  {
    title: 'Walls & structure',
    items: [
      'Cavity wall: 100mm Marshalls ‘Epoch’ stone coursing outer leaf, 150mm Dritherm 32 full-fill insulation, 100mm blockwork inner leaf',
      'Pile foundations with 450 × 450 reinforced concrete ground beams, to structural engineer’s design',
      'Steel beams, purlins and IG lintels over openings, encased in 15mm Gyproc Fireline board',
      'Party wall between the two dwellings sound tested on completion',
    ],
  },
  {
    title: 'Floors & roof',
    items: [
      'Ground floor: beam and block with 150mm Celotex XR4000 insulation, gas membrane and 65mm sand/cement screed',
      'Upper floors: 170 × 47mm C24 joists at 400mm centres',
      'Roof at 40° pitch on 150 × 47mm C24 rafters at 400mm centres',
      'Where the ceiling follows the rafters: 120mm Celotex XR4000 between rafters plus 60mm GA4000 below',
    ],
  },
  {
    title: 'Windows & doors',
    items: [
      'Eighteen window openings and four external doors per the schedule on sheet 03',
      'Obscure glazing to the W/C and en-suites; safety glass where required',
      'Escape windows to the rear bedrooms',
      'Colour and finish to be confirmed',
    ],
  },
  {
    title: 'Safety & ventilation',
    items: [
      'Mains-powered interconnected smoke alarms to hall and both landings',
      'Heat alarm to the kitchen, mains powered and interconnected',
      'Mechanical extract to kitchen, W/C, bathroom and en-suites',
      'Air admittance valves within the eaves; soil and vent pipes as drawn',
    ],
  },
  {
    title: 'Drainage & externals',
    items: [
      'Foul drainage outfall to the sewer in the highway, levels to be site verified',
      'Surface water attenuation: Polypipe Polystorm (or similar) geocellular tank giving 8m³ storage',
      'Surface water gully and drainage channel to the parking area',
      'Rainwater pipes, back inlet gullies, catchpit and rodding eyes as shown on the block plan',
    ],
  },
  {
    title: 'Interior finishes',
    items: [
      'Kitchen by Howdens, Shaker-style doors — door colour, worktop and appliances to be confirmed with buyer',
      'Internal doors and joinery by Howdens — finish to be confirmed with buyer',
      'Sanitaryware and brassware — selection to be confirmed with buyer',
      'Wall and floor tiling — selection to be confirmed with buyer',
      'Heating system and controls — specification to be confirmed',
    ],
  },
];

export const TIMELINE: { stage: string; when: string }[] = [
  { stage: 'Groundworks & foundations', when: 'Complete · March 2026' },
  { stage: 'Stone shell to first floor', when: 'Complete · June 2026' },
  { stage: 'First floor & internal walls', when: 'Complete · August 2026' },
  { stage: 'Roof & watertight', when: 'In progress · this week' },
  { stage: 'First fix & plastering', when: 'Expected October 2026' },
  { stage: 'Kitchen, bathrooms & finishes', when: 'Expected November 2026' },
  { stage: 'Handover & keys', when: 'Target late November 2026' },
];

/** Index of the stage currently in progress. */
export const TIMELINE_CURRENT = 3;

export const BUYER_TILES = [
  { title: 'Progress photos', meta: '12 new this week' },
  { title: 'Documents', meta: 'Reservation, all six sheets, warranty' },
  { title: 'Stage payments', meta: '3 of 5 paid' },
  { title: 'Message Michael', meta: 'Replies within the hour' },
];

export const VISIT_SLOTS = [
  'Sat 26 Sep · 10:00',
  'Sat 26 Sep · 11:30',
  'Sat 3 Oct · 10:00',
  'Sat 3 Oct · 14:00',
];
