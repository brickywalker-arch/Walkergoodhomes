'use client';

import { LAND_TYPES } from '@/data/partners';
import { Reveal } from './ui/Reveal';
import { SectionHead } from './ui/SectionHead';
import { EnquiryButton } from './ui/EnquiryButton';

/**
 * Land wanted.
 *
 * The opportunity types are presentational here rather than a control — the
 * real multi-select lives in the enquiry form, and duplicating state across a
 * modal boundary buys nothing. Each one is a tile that lifts on hover, so the
 * list reads as "these all count" rather than as a filter a visitor has to
 * operate before they are allowed to talk to anyone.
 */
export function LandWanted({ id = 'land' }: { id?: string }) {
  return (
    <section className="sec" id={id} style={{ background: 'var(--navy-deep)', color: 'var(--ink-on-navy)' }}>
      <div className="wrap">
        <div className="two" style={{ alignItems: 'start' }}>
          <SectionHead
            tone="navy"
            eyebrow="Land"
            title="The next Walker Good Home could start with your land."
            lead="Walker Good Homes is actively interested in residential development opportunities throughout Yorkshire."
          >
            <EnquiryButton kind="land" label="Tell us about your land" />
          </SectionHead>

          <Reveal delay={120}>
            <div className="field-label" style={{ color: 'var(--ink-faint-navy-2)' }}>
              Opportunities we look at
            </div>
            <ul
              style={{
                listStyle: 'none',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))',
                gap: 10,
                margin: '16px 0 0',
                padding: 0,
              }}
            >
              {LAND_TYPES.map((t) => (
                <li
                  key={t}
                  className="card card-navy"
                  style={{ padding: '16px 18px', minHeight: 0, fontSize: 14, lineHeight: 1.45 }}
                >
                  {t}
                </li>
              ))}
            </ul>
            <p style={{ margin: '20px 0 0', fontSize: 13, lineHeight: 1.75, color: 'var(--ink-faint-navy)' }}>
              If you are not sure whether a site has potential, send it anyway. We will tell you honestly what we
              think, and there is no agency fee either way.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
