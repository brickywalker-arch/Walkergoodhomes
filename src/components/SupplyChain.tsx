'use client';

import { useId, useState } from 'react';
import { SUPPLY_CATEGORIES, TRADES } from '@/data/partners';
import { Reveal } from './ui/Reveal';
import { SectionHead } from './ui/SectionHead';
import { Modal } from './ui/Modal';
import { PartnerForm } from './forms/PartnerForm';
import { CornerMarks } from './CornerMarks';

type Path = 'trade' | 'supplier';

const PATHS = [
  {
    id: 'trade' as const,
    num: '01',
    label: "I'm a tradesperson / subcontractor",
    body: 'Groundworks to decorating. Tell us what you do, where you work and how you price.',
    items: TRADES,
    itemsLabel: 'Trades we work with',
  },
  {
    id: 'supplier' as const,
    num: '02',
    label: 'I supply materials / products',
    body: 'From stone and timber to kitchens and bathrooms. Send us your range, lead times and terms.',
    items: SUPPLY_CATEGORIES,
    itemsLabel: 'Product categories',
  },
];

/**
 * Build with us — the supply chain.
 *
 * Two large paths rather than one long form: a bricklayer and a window
 * manufacturer want to tell us different things, and asking both to scroll
 * past the other's questions is how a form gets abandoned. Each path opens its
 * own dialog.
 *
 * The trade and category lists double as content — a visitor can see their own
 * trade named before they commit to opening anything.
 */
export function SupplyChain({ id = 'supply-chain' }: { id?: string }) {
  const [open, setOpen] = useState<Path | null>(null);
  const headingId = useId();

  return (
    <section className="sec" id={id}>
      <div className="wrap">
        <SectionHead
          eyebrow="Build with us"
          title="Build with Walker Good Homes."
          lead={
            <>
              <p className="hd" style={{ margin: 0, fontSize: 'clamp(17px,1.8vw,22px)', color: 'var(--navy-mid)' }}>
                GOOD HOMES DEPEND ON GOOD PEOPLE.
              </p>
              <p style={{ margin: '18px 0 0' }}>
                Walker Good Homes wants to develop a strong local supply chain of skilled tradespeople,
                subcontractors, manufacturers and suppliers who share our approach to quality.
              </p>
            </>
          }
          maxWidth={640}
        />

        <div className="grid-wide" style={{ marginTop: 'clamp(34px,5vw,58px)' }}>
          {PATHS.map((p, i) => (
            <Reveal key={p.id} delay={i * 110} className="card plate" style={{ padding: 0 }}>
              <button
                type="button"
                className="card-action"
                aria-haspopup="dialog"
                onClick={() => setOpen(p.id)}
                style={{
                  display: 'block',
                  background: 'transparent',
                  border: 0,
                  padding: 'clamp(24px,3vw,36px)',
                  paddingBottom: 18,
                }}
              >
                <span className="hd" style={{ fontSize: 30, color: 'var(--rule)', lineHeight: 1 }} aria-hidden="true">
                  {p.num}
                </span>
                <span
                  className="hd"
                  style={{
                    display: 'block',
                    marginTop: 14,
                    fontSize: 'clamp(23px,2.7vw,34px)',
                    color: 'var(--ink)',
                    lineHeight: 1.08,
                    textTransform: 'uppercase',
                  }}
                >
                  {p.label}
                </span>
                <span
                  style={{ display: 'block', margin: '14px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-body)' }}
                >
                  {p.body}
                </span>
                <span className="link-arrow" style={{ marginTop: 20, color: 'var(--gold-deep)' }}>
                  Open the form
                  <span className="arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </span>
              </button>

              <div
                style={{
                  borderTop: '1px solid var(--rule-light)',
                  margin: '0 clamp(24px,3vw,36px)',
                  padding: '18px 0 clamp(24px,3vw,36px)',
                }}
              >
                <div className="field-label">{p.itemsLabel}</div>
                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '7px 8px',
                    margin: '12px 0 0',
                    padding: 0,
                  }}
                >
                  {p.items.map((t) => (
                    <li
                      key={t}
                      style={{
                        padding: '5px 10px',
                        border: '1px solid var(--rule-light)',
                        fontSize: 12,
                        color: 'var(--ink-body)',
                        background: 'var(--paper-warm)',
                      }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <CornerMarks />
            </Reveal>
          ))}
        </div>

        <Reveal delay={100} style={{ marginTop: 'clamp(26px,3.4vw,40px)' }}>
          <button type="button" className="btn-g" aria-haspopup="dialog" onClick={() => setOpen('trade')}>
            Join our supply chain
            <span className="arrow" aria-hidden="true" style={{ marginLeft: 10 }}>
              &rarr;
            </span>
          </button>
        </Reveal>
      </div>

      <Modal open={open !== null} onClose={() => setOpen(null)} labelledBy={headingId}>
        {open ? <PartnerForm kind={open} headingId={headingId} onDone={() => setOpen(null)} /> : null}
      </Modal>
    </section>
  );
}
