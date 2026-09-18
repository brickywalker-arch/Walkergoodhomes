'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PLOT_FACTS } from '@/data/development';
import { exteriorImage } from '@/lib/cgi';
import { CornerMarks } from './CornerMarks';

const PLOTS = [
  {
    id: 1 as const,
    kicker: 'Plot 1 · Left-hand home',
    title: 'Home 01',
    meta: '3 bedrooms over 3 storeys · 2 en-suites · private drive',
    view: 'plot-1-card',
    alt: 'Plot 1, the left-hand home — computer-generated image from the drive',
  },
  {
    id: 2 as const,
    kicker: 'Plot 2 · Right-hand home, handed',
    title: 'Home 02',
    meta: '3 bedrooms over 3 storeys · 2 en-suites · private drive',
    view: 'plot-2-card',
    alt: 'Plot 2, the right-hand home with its private drive — computer-generated image',
  },
];

export function Plots() {
  const [plot, setPlot] = useState<1 | 2>(1);

  const plotLabel =
    plot === 1 ? 'Plot 1 · the left-hand home' : 'Plot 2 · the right-hand home, the same plan handed';

  return (
    <section className="sec" id="plots">
      <div className="wrap">
        <div className="two" style={{ alignItems: 'start' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
              The development
            </div>
            <h2 className="hd" style={{ fontSize: 'clamp(38px,5.4vw,70px)', marginTop: 12 }}>
              Two homes. One carefully considered site.
            </h2>
          </div>
          <div>
            <p className="lead">
              Two attached dwellings on land adjacent 2 Hoyle Ing, built to the approved Building Regulations
              drawings: a 5.47 × 9.49 m footprint each, three storeys, Marshalls &lsquo;Epoch&rsquo; stone coursing
              on a piled foundation, and a 40° pitched roof taking the second-floor bedroom.
            </p>
            <div
              className="plate"
              style={{ marginTop: 22, border: '1px solid var(--rule)', background: 'var(--paper-warm)', padding: '18px 20px' }}
            >
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-body)' }}>
                <strong style={{ color: 'var(--ink)' }}>Modelled from the drawings.</strong> Every image on this page
                is rendered from a model built to the dimensions on sheets 26/1362/03 and /04 — no generic CGI
                substitutions.
              </p>
              <CornerMarks />
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))',
            gap: 'clamp(16px,2.5vw,26px)',
            marginTop: 'clamp(28px,4vw,46px)',
          }}
        >
          {PLOTS.map((p) => {
            const img = exteriorImage(p.view);
            const active = plot === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlot(p.id)}
                aria-pressed={active}
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 5',
                  overflow: 'hidden',
                  border: active ? '1px solid var(--gold)' : '1px solid rgba(6,34,58,.25)',
                  background: 'var(--navy-mid)',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                  display: 'block',
                  width: '100%',
                  font: 'inherit',
                  color: 'inherit',
                }}
              >
                <Image
                  src={img.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg,rgba(4,26,45,0) 34%,rgba(4,26,45,.93))',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: 'clamp(18px,2.5vw,26px)',
                    right: 'clamp(18px,2.5vw,26px)',
                    bottom: 22,
                    display: 'block',
                  }}
                >
                  <span className="eyebrow" style={{ color: 'var(--gold-light)', display: 'block' }}>
                    {p.kicker}
                  </span>
                  <span
                    className="hd"
                    style={{ fontSize: 'clamp(30px,3.6vw,42px)', color: '#fff', marginTop: 7, display: 'block' }}
                  >
                    {p.title}
                  </span>
                  <span style={{ display: 'block', fontSize: 13.5, color: '#d7e0e6', marginTop: 6, letterSpacing: '.03em' }}>
                    {p.meta}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      fontSize: 9.5,
                      letterSpacing: '.14em',
                      color: 'var(--gold-light)',
                      marginTop: 14,
                    }}
                  >
                    {active ? 'SHOWING BELOW' : 'SEE THE DETAIL →'}
                  </span>
                </span>
                <CornerMarks tone="gold" />
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(50% - 1px,150px),1fr))',
            gap: 1,
            background: 'var(--rule)',
            border: '1px solid var(--rule)',
            marginTop: 'clamp(16px,2.5vw,26px)',
          }}
        >
          {PLOT_FACTS.map((f) => (
            <div key={f.k} style={{ background: 'var(--paper-warm)', padding: '18px 20px' }}>
              <b
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-barlow-condensed), sans-serif',
                  fontSize: 26,
                  color: 'var(--navy-mid)',
                }}
              >
                {f.v}
              </b>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 9,
                  letterSpacing: '.14em',
                  color: 'var(--ink-muted)',
                  textTransform: 'uppercase',
                }}
              >
                {f.k}
              </span>
            </div>
          ))}
        </div>
        <div
          aria-live="polite"
          style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: '.14em', color: 'var(--ink-muted-2)', marginTop: 12 }}
        >
          SHOWING: {plotLabel}
        </div>
      </div>
    </section>
  );
}
