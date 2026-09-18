'use client';

import { useState } from 'react';
import { SPEC } from '@/data/development';

/** Single-open accordion; clicking the open section closes it. */
export function Spec() {
  const [open, setOpen] = useState(0);

  return (
    <section className="sec" id="spec">
      <div className="wrap">
        <div className="two" style={{ alignItems: 'start' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
              Specification
            </div>
            <h2 className="hd" style={{ fontSize: 'clamp(38px,5.4vw,70px)', marginTop: 12 }}>
              Accuracy first. Then aspiration.
            </h2>
            <p className="lead" style={{ marginTop: 18 }}>
              Where a finish is still to be confirmed, it says so. Register before completion and you can personalise
              selected interior finishes.
            </p>
            <a href="#enquire" className="btn-g" style={{ marginTop: 24 }}>
              Register interest
            </a>
          </div>
          <div style={{ borderTop: '1px solid var(--rule-strong)' }}>
            {SPEC.map((s, i) => {
              const isOpen = open === i;
              const panelId = `spec-panel-${i}`;
              return (
                <div key={s.title} style={{ borderBottom: '1px solid var(--rule)' }}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    style={{
                      width: '100%',
                      minHeight: 62,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      background: 'none',
                      border: 0,
                      padding: '18px 2px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      font: 'inherit',
                      color: 'inherit',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                      <span style={{ fontWeight: 600, fontSize: 10, letterSpacing: '.16em', color: 'var(--gold-deep)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-barlow-condensed), sans-serif',
                          fontSize: 'clamp(22px,2.4vw,28px)',
                          color: 'var(--ink)',
                        }}
                      >
                        {s.title}
                      </span>
                    </span>
                    <span aria-hidden="true" style={{ fontWeight: 300, fontSize: 24, color: 'var(--navy-mid)', flex: 'none' }}>
                      {isOpen ? '–' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div id={panelId} style={{ padding: '0 2px 20px', display: 'grid', gap: 10 }}>
                      {s.items.map((item) => (
                        <div
                          key={item}
                          style={{ display: 'flex', gap: 12, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-body)' }}
                        >
                          <span aria-hidden="true" style={{ color: 'var(--gold)', flex: 'none' }}>
                            —
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
