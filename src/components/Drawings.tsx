'use client';

import { useState } from 'react';
import { SHEETS } from '@/data/development';
import { sheetImage } from '@/lib/cgi';
import { CornerMarks } from './CornerMarks';

/**
 * A register, not a viewer — the six sheets as the architect issued them.
 *
 * Previews are rasterised from the PDFs at build time. Earlier attempts at an
 * inline <object> embed rendered blank, and rasterising with pdf.js in the
 * browser locked the main thread on the A1 floor-plan sheet, so nothing is
 * rasterised client-side here: these are plain images, and the PDF stays the
 * "open full size" target.
 */
export function Drawings() {
  const [open, setOpen] = useState<string | null>(SHEETS[2].slug);

  const current = SHEETS.find((s) => s.slug === open) ?? null;
  const preview = current ? sheetImage(current.slug) : null;

  return (
    <section
      className="sec"
      id="drawings"
      style={{
        background: 'var(--paper-warm)',
        borderTop: '1px solid var(--rule-light)',
        borderBottom: '1px solid var(--rule-light)',
      }}
    >
      <div className="wrap">
        <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
          The architect&rsquo;s design
        </div>
        <h2 className="hd" style={{ fontSize: 'clamp(38px,5.4vw,70px)', margin: '12px 0 14px' }}>
          See exactly what we&rsquo;re building.
        </h2>
        <p className="lead" style={{ maxWidth: '62ch' }}>
          These are the architect&rsquo;s issued Building Regulations sheets for Land Adjacent 2 Hoyle Ing — not
          marketing artwork. Every room dimension and finish quoted on this page is read off them. Select a sheet to
          preview it, or open it full size to zoom in.
        </p>

        <div style={{ marginTop: 'clamp(26px,3.5vw,40px)', borderTop: '1px solid var(--rule-strong)' }}>
          {SHEETS.map((d) => {
            const active = open === d.slug;
            return (
              <div key={d.slug} style={{ borderBottom: '1px solid var(--rule)' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(0,1fr) auto auto',
                    alignItems: 'center',
                    gap: 'clamp(10px,2vw,22px)',
                    minHeight: 64,
                    padding: 'clamp(14px,2vw,20px) 2px',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: '.12em', color: 'var(--gold-deep)' }}>
                    {d.num}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(active ? null : d.slug)}
                    aria-expanded={active}
                    style={{
                      background: 'none',
                      border: 0,
                      padding: 0,
                      margin: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      font: 'inherit',
                      color: 'inherit',
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-barlow-condensed), sans-serif',
                        fontSize: 'clamp(23px,2.6vw,30px)',
                        color: 'var(--ink)',
                        lineHeight: 1.05,
                      }}
                    >
                      {d.title}
                    </span>
                    <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 4 }}>
                      {d.meta}
                    </span>
                  </button>
                  <span
                    aria-hidden="true"
                    style={{
                      fontWeight: 700,
                      fontSize: 9,
                      letterSpacing: '.12em',
                      color: 'var(--ink-muted-2)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {active ? 'PREVIEWING' : 'PREVIEW'}
                  </span>
                  <a
                    href={d.file}
                    target="_blank"
                    rel="noopener"
                    style={{
                      fontWeight: 700,
                      fontSize: 9.5,
                      letterSpacing: '.14em',
                      color: 'var(--gold-deep)',
                      whiteSpace: 'nowrap',
                      minHeight: 44,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    OPEN ↗
                  </a>
                </div>
                {active && preview && current && (
                  <div className="plate" style={{ margin: '0 0 22px', border: '1px solid var(--rule)', background: '#fff', padding: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.src}
                      srcSet={preview.srcSet}
                      sizes="(max-width: 900px) 100vw, 1140px"
                      alt={`${current.title} — ${current.meta}`}
                      width={2048}
                      height={Math.round(2048 / preview.aspect)}
                      style={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                    <CornerMarks />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ margin: '18px 0 0', fontSize: 12.5, lineHeight: 1.7, color: 'var(--ink-muted-2)' }}>
          Previews are rendered from the issued PDFs. Sheets open as the architect issued them — PDF, to scale. All
          levels and dimensions to be site verified.
        </p>
      </div>
    </section>
  );
}
