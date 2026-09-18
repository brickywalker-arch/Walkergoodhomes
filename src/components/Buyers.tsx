import Link from 'next/link';
import { BUYER_TILES, TIMELINE, TIMELINE_CURRENT } from '@/data/development';
import { CornerMarks } from './CornerMarks';

/**
 * Reserved-buyers panel.
 *
 * The figures shown are the development's current build status. The private
 * area itself lives behind an access code at /buyers — this section is the
 * public-facing summary of what reserving gets you.
 */
export function Buyers() {
  return (
    <section className="sec" id="buyers" style={{ background: 'var(--navy-mid)' }}>
      <div className="wrap">
        <div className="two" style={{ alignItems: 'start' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              Reserved buyers
            </div>
            <h2 className="hd" style={{ fontSize: 'clamp(36px,5vw,64px)', color: '#fff', marginTop: 12 }}>
              Follow your build, week by week.
            </h2>
            <p className="lead" style={{ color: 'var(--ink-on-navy-2)', marginTop: 18 }}>
              Once you reserve, you get a private area: progress photos, your stage payment schedule, every drawing
              and document, and a direct line to Michael.
            </p>
            <div
              className="plate"
              style={{ marginTop: 26, border: '1px solid rgba(239,207,145,.35)', padding: 22 }}
            >
              <div style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: '.14em', color: 'var(--ink-faint-navy-2)' }}>
                PLOT 1 · RESERVED 14 FEB 2026
              </div>
              <div className="hd" style={{ fontSize: 'clamp(26px,3vw,34px)', color: '#fff', margin: '10px 0 4px' }}>
                Roof stage — watertight this week.
              </div>
              <div
                style={{ marginTop: 16, height: 6, background: 'rgba(255,255,255,.16)' }}
                role="progressbar"
                aria-valuenow={62}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Build progress, plot 1"
              >
                <div style={{ height: 6, width: '62%', background: 'var(--gold)' }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                  fontSize: 9.5,
                  letterSpacing: '.14em',
                  color: 'var(--ink-faint-navy-2)',
                  marginTop: 8,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span>62% COMPLETE</span>
                <span>STAGE 4 OF 7 · TARGET NOV 2026</span>
              </div>
              <CornerMarks tone="gold" />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(min(50% - 1px,150px),1fr))',
                gap: 1,
                background: 'rgba(255,255,255,.16)',
                marginTop: 22,
              }}
            >
              {BUYER_TILES.map((t) => (
                <div key={t.title} style={{ background: 'var(--navy)', padding: 18, minHeight: 88 }}>
                  <b
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-barlow-condensed), sans-serif',
                      fontSize: 22,
                      color: 'var(--gold-light)',
                      marginBottom: 5,
                    }}
                  >
                    {t.title}
                  </b>
                  <span style={{ fontSize: 12, lineHeight: 1.45, color: '#cbd6dc' }}>{t.meta}</span>
                </div>
              ))}
            </div>
            <Link href="/buyers" className="btn-o" style={{ marginTop: 22 }}>
              Reserved buyers — sign in
            </Link>
          </div>

          <div style={{ background: 'var(--paper-warm)', padding: 'clamp(22px,3vw,34px)' }}>
            <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
              Build timeline · Plot 1
            </div>
            <ol style={{ marginTop: 20, listStyle: 'none', padding: 0 }}>
              {TIMELINE.map((s, i) => {
                const done = i < TIMELINE_CURRENT;
                const current = i === TIMELINE_CURRENT;
                return (
                  <li key={s.stage} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 'none', width: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: '50%',
                          background: done ? 'var(--gold)' : current ? '#fff' : 'transparent',
                          border: `1px solid ${i <= TIMELINE_CURRENT ? 'var(--gold)' : '#b3bec6'}`,
                          marginTop: 5,
                        }}
                      />
                      {i < TIMELINE.length - 1 && <span style={{ flex: 1, width: 1, background: 'var(--rule)' }} />}
                    </div>
                    <div style={{ paddingBottom: 20 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-barlow-condensed), sans-serif',
                          fontSize: 21,
                          color: i <= TIMELINE_CURRENT ? 'var(--ink)' : 'var(--ink-muted-2)',
                        }}
                      >
                        {s.stage}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-muted-2)', letterSpacing: '.03em' }}>{s.when}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
