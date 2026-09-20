'use client';

import { JOURNAL_STAGES, type JournalStage } from '@/data/journal';
import { Reveal } from './ui/Reveal';
import { SectionHead } from './ui/SectionHead';

const DOT: Record<JournalStage['status'], { fill: string; border: string; label: string }> = {
  complete: { fill: 'var(--gold)', border: 'var(--gold)', label: 'Complete' },
  current: { fill: 'var(--white)', border: 'var(--gold)', label: 'In progress' },
  upcoming: { fill: 'transparent', border: '#b3bec6', label: 'To come' },
};

/**
 * Follow the build — the development journal.
 *
 * A scroll timeline down the left with the stage record on the right. The rule
 * between the markers is drawn in gold as far as the work has reached and grey
 * beyond it, so the state of the site is legible at a glance before a word is
 * read.
 *
 * Where a stage has no photographs the panel says so plainly. A construction
 * journal illustrated with stock imagery would defeat the point of having one,
 * and this section exists to show the build as it actually is. Drop real
 * photographs into the stage record and they appear here.
 */
export function BuildJournal({ id = 'journal' }: { id?: string }) {
  const lastDone = JOURNAL_STAGES.map((s) => s.status).lastIndexOf('current');
  const reached = lastDone >= 0 ? lastDone : JOURNAL_STAGES.filter((s) => s.status === 'complete').length - 1;

  return (
    <section className="sec" id={id} style={{ background: 'var(--paper-warm)' }}>
      <div className="wrap">
        <SectionHead
          eyebrow="Development journal · Hoyle Ing"
          title="Follow the build."
          lead="Nine stages from bare ground to keys. Each one is recorded as it happens, with the specification it was built to — so what is promised here can be checked against what is standing on site."
          maxWidth={660}
        />

        <ol style={{ listStyle: 'none', margin: 'clamp(34px,5vw,58px) 0 0', padding: 0 }}>
          {JOURNAL_STAGES.map((stage, i) => {
            const dot = DOT[stage.status];
            const isLast = i === JOURNAL_STAGES.length - 1;
            return (
              <Reveal as="li" key={stage.num} delay={Math.min(i, 4) * 70}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'clamp(14px,2.4vw,28px)' }}>
                  {/* The rail. */}
                  <div
                    aria-hidden="true"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18 }}
                  >
                    <span
                      style={{
                        width: 13,
                        height: 13,
                        flex: 'none',
                        marginTop: 6,
                        background: dot.fill,
                        border: `1px solid ${dot.border}`,
                        borderRadius: '50%',
                        boxShadow: stage.status === 'current' ? '0 0 0 4px rgba(210,164,84,.22)' : undefined,
                      }}
                    />
                    {!isLast && (
                      <span
                        style={{
                          flex: 1,
                          width: 1,
                          minHeight: 28,
                          background: i < reached ? 'var(--gold)' : 'var(--rule)',
                        }}
                      />
                    )}
                  </div>

                  {/* The record. */}
                  <div style={{ paddingBottom: isLast ? 0 : 'clamp(26px,3.2vw,40px)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 14px' }}>
                      <span
                        className="hd"
                        aria-hidden="true"
                        style={{ fontSize: 15, letterSpacing: '.14em', color: 'var(--ink-muted-2)' }}
                      >
                        {stage.num}
                      </span>
                      <h3
                        className="hd"
                        style={{
                          fontSize: 'clamp(24px,3vw,36px)',
                          lineHeight: 1.06,
                          color: stage.status === 'upcoming' ? 'var(--ink-muted)' : 'var(--ink)',
                        }}
                      >
                        {stage.title}
                      </h3>
                      <span
                        className="eyebrow"
                        style={{
                          padding: '4px 9px',
                          fontSize: 8.5,
                          border: `1px solid ${stage.status === 'upcoming' ? 'var(--rule)' : 'var(--gold)'}`,
                          background: stage.status === 'complete' ? 'var(--gold)' : 'transparent',
                          color: stage.status === 'complete' ? 'var(--navy)' : 'var(--ink-body)',
                        }}
                      >
                        {dot.label}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 9,
                        fontSize: 12.5,
                        letterSpacing: '.05em',
                        color: stage.when ? 'var(--gold-deep)' : 'var(--ink-muted-2)',
                        fontWeight: 600,
                      }}
                    >
                      {stage.when ?? 'Date to be confirmed'}
                    </div>

                    <p
                      style={{
                        margin: '12px 0 0',
                        maxWidth: 640,
                        fontSize: 14.5,
                        lineHeight: 1.75,
                        color: 'var(--ink-body)',
                      }}
                    >
                      {stage.body}
                    </p>

                    {stage.photos.length ? (
                      <div
                        style={{
                          display: 'grid',
                          gap: 10,
                          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))',
                          marginTop: 16,
                          maxWidth: 640,
                        }}
                      >
                        {stage.photos.map((p) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            key={p.src}
                            src={p.src}
                            alt={p.alt}
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p
                        style={{
                          margin: '14px 0 0',
                          padding: '10px 13px',
                          maxWidth: 640,
                          border: '1px dashed var(--rule)',
                          fontSize: 12.5,
                          lineHeight: 1.65,
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {stage.status === 'upcoming'
                          ? 'Photographs will be added as this stage is built.'
                          : 'Site photographs for this stage are being prepared for publication.'}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
