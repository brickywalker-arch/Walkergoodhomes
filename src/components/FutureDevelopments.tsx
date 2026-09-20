'use client';

import Link from 'next/link';
import { DEVELOPMENTS, DEV_STATUSES, STATUS_STYLE, type Development } from '@/data/developments';
import { photoImage } from '@/lib/cgi';
import { Reveal } from './ui/Reveal';
import { SectionHead } from './ui/SectionHead';
import { EnquiryButton } from './ui/EnquiryButton';
import { CornerMarks } from './CornerMarks';

/** Live schemes first, then the rest, each group in the order statuses are declared. */
function ordered(list: Development[]): Development[] {
  return [...list].sort((a, b) => {
    const live = Number(STATUS_STYLE[b.status].live) - Number(STATUS_STYLE[a.status].live);
    if (live) return live;
    return DEV_STATUSES.indexOf(a.status) - DEV_STATUSES.indexOf(b.status);
  });
}

function StatusTag({ status }: { status: Development['status'] }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="eyebrow"
      style={{
        display: 'inline-block',
        padding: '6px 11px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.ink,
        fontSize: 9,
        letterSpacing: '.18em',
      }}
    >
      {status}
    </span>
  );
}

function DevelopmentCard({ dev, index }: { dev: Development; index: number }) {
  const img = dev.photo ? photoImage(dev.photo) : null;

  return (
    <Reveal delay={index * 100} className="card plate" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '16 / 10', background: 'var(--navy-mid)', overflow: 'hidden' }}>
        {img ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes="(max-width: 760px) 100vw, 48vw"
            alt={`${dev.name}, ${dev.location} — computer-generated image`}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              // The slow push-in on hover; the parent .card handles the lift.
              transition: 'transform 1.1s cubic-bezier(.22,.61,.36,1)',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--ink-faint-navy)' }}>
              Imagery to follow
            </span>
          </div>
        )}
        <span style={{ position: 'absolute', top: 14, left: 14 }}>
          <StatusTag status={dev.status} />
        </span>
      </div>

      <div style={{ padding: 'clamp(20px,2.6vw,30px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 className="hd" style={{ fontSize: 'clamp(26px,3.1vw,38px)', lineHeight: 1.04 }}>
          {dev.name}
        </h3>
        <div style={{ marginTop: 8, fontSize: 13, letterSpacing: '.05em', color: 'var(--ink-muted)' }}>
          {dev.location}
        </div>
        <p style={{ margin: '14px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-body)' }}>{dev.summary}</p>

        <dl
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0 26px',
            margin: '20px 0 0',
            paddingTop: 16,
            borderTop: '1px solid var(--rule-light)',
          }}
        >
          <div>
            <dt className="field-label">Homes</dt>
            <dd className="hd" style={{ margin: '5px 0 0', fontSize: 24, color: 'var(--navy)' }}>
              {dev.homes}
            </dd>
          </div>
          <div>
            <dt className="field-label">Expected</dt>
            <dd className="hd" style={{ margin: '5px 0 0', fontSize: 24, color: 'var(--navy)' }}>
              {dev.expected ?? 'TBC'}
            </dd>
          </div>
        </dl>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 'auto', paddingTop: 22 }}>
          <Link href={dev.href} className="btn-g" style={{ minHeight: 44 }}>
            View development
          </Link>
          <Link
            href="/#enquire"
            className="btn-g"
            style={{
              minHeight: 44,
              background: 'transparent',
              borderColor: 'var(--rule-strong)',
              color: 'var(--navy)',
            }}
          >
            Register interest
          </Link>
        </div>
      </div>
      <CornerMarks />
    </Reveal>
  );
}

/**
 * The development register.
 *
 * Built for one scheme and twenty. The cards come from DEVELOPMENTS, sorted so
 * anything live leads, and the grid is auto-fit — so a single development sits
 * comfortably beside its own explanatory panel rather than stranded in a
 * three-column layout with two holes in it.
 *
 * The second panel is the honest part. There is one development, and instead
 * of padding the register with invented pipeline it says so and points at the
 * two things that would change that: land and partnerships.
 */
export function FutureDevelopments({ id = 'register' }: { id?: string }) {
  const list = ordered(DEVELOPMENTS);
  const homes = list.reduce((n, d) => n + d.homes, 0);

  return (
    <section className="sec" id={id}>
      <div className="wrap">
        <SectionHead
          eyebrow="The register"
          title="Where we are building."
          lead={
            <>
              Every Walker Good Homes development appears here, from land acquired through to sold. Today there is
              one: {list[0]?.name} in {list[0]?.location}, {homes} {homes === 1 ? 'home' : 'homes'}.
            </>
          }
        />

        <div
          style={{
            marginTop: 'clamp(34px,5vw,58px)',
            display: 'grid',
            gap: 'clamp(16px,2.5vw,26px)',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))',
            alignItems: 'stretch',
          }}
        >
          {list.map((dev, i) => (
            <DevelopmentCard key={dev.slug} dev={dev} index={i} />
          ))}

          <Reveal
            delay={list.length * 100}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 'clamp(24px,3vw,36px)',
              border: '1px dashed var(--rule)',
              background: 'var(--paper-warm)',
            }}
          >
            <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
              The next one
            </div>
            <h3 className="hd" style={{ fontSize: 'clamp(24px,2.9vw,34px)', marginTop: 12, lineHeight: 1.08 }}>
              This space is for the development after Hoyle&nbsp;Ing.
            </h3>
            <p style={{ margin: '14px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-body)' }}>
              Walker Good Homes was established in 2024. Rather than fill this register with schemes that do not
              exist, it stays honest — and the two routes that will fill it are open now.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
              <EnquiryButton kind="land" label="I have land" variant="gold" />
              <EnquiryButton
                kind="development"
                label="Develop with us"
                className="btn-g"
                style={{ background: 'transparent', borderColor: 'var(--rule-strong)', color: 'var(--navy)' }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
