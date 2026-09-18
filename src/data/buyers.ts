import { TIMELINE, TIMELINE_CURRENT } from './development';

/**
 * The reserved-buyer record for each plot.
 *
 * This is the development's real build status, kept here as the single source
 * the portal reads. In service it should come from whatever Michael updates on
 * site rather than from a file in the repository.
 */
export type Payment = { stage: string; due: string; amount: string; status: 'Paid' | 'Due' | 'Scheduled' };
export type Document = { title: string; meta: string; href: string };

export type PlotRecord = {
  plot: 1 | 2;
  status: 'reserved' | 'available';
  reservedOn: string | null;
  headline: string;
  stage: number;
  percent: number;
  target: string;
  newPhotos: number;
  payments: Payment[];
  documents: Document[];
};

export const PLOT_RECORDS: PlotRecord[] = [
  {
    plot: 1,
    status: 'reserved',
    reservedOn: '14 February 2026',
    headline: 'Roof stage — watertight this week.',
    stage: TIMELINE_CURRENT,
    percent: 62,
    target: 'Late November 2026',
    newPhotos: 12,
    payments: [
      { stage: 'Reservation fee', due: '14 Feb 2026', amount: '£2,000', status: 'Paid' },
      { stage: 'Exchange of contracts', due: '28 Mar 2026', amount: '10%', status: 'Paid' },
      { stage: 'Shell complete', due: '30 Jun 2026', amount: '15%', status: 'Paid' },
      { stage: 'Watertight', due: 'On roof sign-off', amount: '15%', status: 'Due' },
      { stage: 'Completion', due: 'On handover', amount: 'Balance', status: 'Scheduled' },
    ],
    documents: [
      { title: 'Reservation agreement', meta: 'Signed 14 Feb 2026 · PDF', href: '#' },
      { title: 'Location plan', meta: 'Dwg 26/1362/01', href: '/assets/pdf/01-location-plan.pdf' },
      { title: 'Existing block plan', meta: 'Dwg 26/1362/02', href: '/assets/pdf/02-existing-block-plan.pdf' },
      { title: 'Proposed floor plans', meta: 'Dwg 26/1362/03', href: '/assets/pdf/03-floor-plans.pdf' },
      { title: 'Proposed section', meta: 'Dwg 26/1362/04', href: '/assets/pdf/04-section.pdf' },
      { title: 'Proposed elevations', meta: 'Dwg 26/1362/05', href: '/assets/pdf/05-elevations.pdf' },
      { title: 'Proposed block plan', meta: 'Dwg 26/1362/06', href: '/assets/pdf/06-block-plan.pdf' },
      { title: 'Structural warranty', meta: 'Issued on completion', href: '#' },
    ],
  },
  {
    plot: 2,
    status: 'available',
    reservedOn: null,
    headline: 'Available — the same plan handed.',
    stage: TIMELINE_CURRENT,
    percent: 58,
    target: 'Late November 2026',
    newPhotos: 9,
    payments: [],
    documents: [],
  },
];

export const BUILD_STAGES = TIMELINE;
