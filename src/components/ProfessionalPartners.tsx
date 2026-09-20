'use client';

import { PROFESSIONAL_DISCIPLINES } from '@/data/partners';
import { Reveal } from './ui/Reveal';
import { SectionHead } from './ui/SectionHead';
import { EnquiryButton } from './ui/EnquiryButton';

/**
 * Professional partners.
 *
 * Deliberately the quietest section on the site: a list, a line and a way in.
 * The audience is professionals who will judge it on whether it wastes their
 * time, and a consultant does not need to be sold to with a full-bleed image.
 */
export function ProfessionalPartners({ id = 'professional-partners' }: { id?: string }) {
  return (
    <section className="sec" id={id} style={{ background: 'var(--paper-warm)' }}>
      <div className="wrap">
        <div className="two" style={{ alignItems: 'start' }}>
          <SectionHead
            eyebrow="Professional partners"
            title="Work with Walker Good Homes."
            lead={
              <>
                <p style={{ margin: 0 }}>
                  As Walker Good Homes grows, we want to build relationships with high-quality local professionals —
                  the people a development actually depends on long before anything is built.
                </p>
                <p style={{ margin: '14px 0 0' }}>
                  If you work in or around residential development in Yorkshire, we would like to know who you are.
                </p>
              </>
            }
          >
            <EnquiryButton kind="professional" label="Introduce your business" />
          </SectionHead>

          <Reveal delay={110}>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                borderTop: '1px solid var(--rule-strong)',
              }}
            >
              {PROFESSIONAL_DISCIPLINES.map((d, i) => (
                <li
                  key={d}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 16,
                    padding: '14px 4px',
                    borderBottom: '1px solid var(--rule)',
                    fontSize: 15.5,
                    color: 'var(--ink)',
                  }}
                >
                  <span
                    className="hd"
                    aria-hidden="true"
                    style={{ fontSize: 13, letterSpacing: '.1em', color: 'var(--ink-muted-2)', minWidth: 22 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
