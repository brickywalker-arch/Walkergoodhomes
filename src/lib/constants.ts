import { FINISHES as CATALOGUE, FINISH_GROUP_KEYS, type FinishGroupKey } from '@/data/interior';
import { VISIT_SLOTS } from '@/data/development';

/**
 * Server-side allowlists, derived from the same catalogues the UI renders, so
 * the two cannot drift apart.
 */
export const FINISHES = Object.fromEntries(
  FINISH_GROUP_KEYS.map((k) => [k, CATALOGUE[k].options.map((o) => o.id)]),
) as Record<FinishGroupKey, string[]>;

export const VISIT_SLOTS_SET = new Set(VISIT_SLOTS);
