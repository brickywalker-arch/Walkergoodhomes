/**
 * The development register.
 *
 * One entry today. The section that reads this is built to scale to twenty
 * without touching the component — add a record here and it appears, grouped
 * and sorted by status.
 *
 * Nothing in this file may describe a development that does not exist. An
 * empty pipeline is the truth for a company established in 2024, and the
 * section says so rather than padding itself with placeholders.
 */

export const DEV_STATUSES = [
  'LAND ACQUIRED',
  'IN PLANNING',
  'COMING SOON',
  'NOW BUILDING',
  'HOMES AVAILABLE',
  'RESERVED',
  'SOLD',
] as const;

export type DevStatus = (typeof DEV_STATUSES)[number];

/** Where each status sits on the navy/gold scale, and whether it reads as live. */
export const STATUS_STYLE: Record<DevStatus, { ink: string; bg: string; border: string; live: boolean }> = {
  'LAND ACQUIRED': { ink: 'var(--ink-body)', bg: 'transparent', border: 'var(--rule)', live: false },
  'IN PLANNING': { ink: 'var(--ink-body)', bg: 'transparent', border: 'var(--rule)', live: false },
  'COMING SOON': { ink: 'var(--navy)', bg: 'rgba(210,164,84,.18)', border: 'var(--gold)', live: true },
  'NOW BUILDING': { ink: 'var(--navy)', bg: 'var(--gold)', border: 'var(--gold)', live: true },
  'HOMES AVAILABLE': { ink: 'var(--navy)', bg: 'var(--gold)', border: 'var(--gold)', live: true },
  RESERVED: { ink: 'var(--ink-body)', bg: 'transparent', border: 'var(--rule-strong)', live: false },
  SOLD: { ink: 'var(--ink-muted)', bg: 'transparent', border: 'var(--rule)', live: false },
};

export type Development = {
  slug: string;
  name: string;
  location: string;
  status: DevStatus;
  /** Homes on the scheme. */
  homes: number;
  /** Completion year, or null where it is genuinely not yet known. */
  expected: number | null;
  summary: string;
  /** Key into the prepared exterior imagery, or null where there is no image. */
  photo: string | null;
  /** Where "view development" goes. */
  href: string;
};

export const DEVELOPMENTS: Development[] = [
  {
    slug: 'hoyle-ing',
    name: 'Hoyle Ing',
    location: 'Linthwaite, Huddersfield',
    status: 'NOW BUILDING',
    homes: 2,
    expected: 2026,
    summary:
      'Two attached Yorkshire-stone homes stepping down a sloping site, three bedrooms over three storeys in each. Plot 1 sits higher, plot 2 lower.',
    photo: 'hero',
    href: '/#developments',
  },
];
