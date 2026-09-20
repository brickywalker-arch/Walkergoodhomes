'use client';

import Link from 'next/link';
import { ROUTER_OPTIONS } from '@/data/partners';
import { Reveal } from './ui/Reveal';
import { SectionHead } from './ui/SectionHead';

/**
 * How can we help — the audience router.
 *
 * Six doors near the foot of the homepage. Everything above this point is
 * written for a buyer, and a landowner or a bricklayer who has scrolled that
 * far deserves somewhere obvious to go rather than a rummage through the nav.
 *
 * Plain links to real pages rather than modals: these are entry points to
 * whole sections, they should be shareable, and they should survive a
 * middle-click.
 */
export function AudienceRouter({ id = 'help' }: { id?: string }) {
  return (
    <section className="sec" id={id} style={{ background: 'var(--navy-darkest)', color: 'var(--ink-on-navy)' }}>
      <div className="wrap">
        <SectionHead
          tone="navy"
          align="centre"
          eyebrow="Start here"
          title="How can we help?"
          lead="Walker Good Homes builds and sells its own homes, buys land, and works with partners, providers and trades to build more of them."
          maxWidth={600}
        />

        <ul
          style={{
            listStyle: 'none',
            margin: 'clamp(34px,5vw,56px) 0 0',
            padding: 0,
            display: 'grid',
            gap: 'clamp(12px,1.8vw,18px)',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,330px),1fr))',
          }}
        >
          {ROUTER_OPTIONS.map((o, i) => (
            <Reveal as="li" key={o.href} delay={i * 70} style={{ display: 'grid' }}>
              <Link
                href={o.href}
                className="card card-navy card-action"
                style={{
                  display: 'flex',
                  minHeight: 148,
                  justifyContent: 'space-between',
                  color: 'var(--ink-on-navy)',
                  textDecoration: 'none',
                }}
              >
                <span
                  className="hd"
                  style={{ fontSize: 'clamp(21px,2.3vw,28px)', lineHeight: 1.1, color: 'var(--gold-light)' }}
                >
                  {o.label}
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 14,
                    marginTop: 18,
                  }}
                >
                  <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-faint-navy)' }}>{o.note}</span>
                  <span className="link-arrow" style={{ color: 'var(--gold)' }} aria-hidden="true">
                    <span className="arrow" style={{ fontSize: 17 }}>
                      &rarr;
                    </span>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
