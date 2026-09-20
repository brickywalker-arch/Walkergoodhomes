'use client';

import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

/**
 * The heading block every new section opens with: eyebrow, rule, heading,
 * standfirst. One component so the eight of them cannot drift apart.
 *
 * `tone` swaps the palette for a navy section rather than a paper one; the
 * structure and the rhythm are identical either way.
 */
export function SectionHead({
  eyebrow,
  title,
  lead,
  tone = 'paper',
  align = 'left',
  children,
  maxWidth = 620,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: 'paper' | 'navy';
  align?: 'left' | 'centre';
  /** Buttons or chips under the standfirst. */
  children?: ReactNode;
  maxWidth?: number;
}) {
  const navy = tone === 'navy';
  const centred = align === 'centre';

  return (
    <Reveal
      style={{
        textAlign: centred ? 'center' : 'left',
        maxWidth: centred ? maxWidth : undefined,
        marginInline: centred ? 'auto' : undefined,
      }}
    >
      <div className="eyebrow" style={{ color: navy ? 'var(--gold-light)' : 'var(--gold-deep)' }}>
        {eyebrow}
      </div>
      <span
        className="rule-gold"
        aria-hidden="true"
        style={{ marginTop: 14, marginInline: centred ? 'auto' : undefined }}
      />
      <h2
        className="hd"
        style={{
          fontSize: 'clamp(34px,5.1vw,66px)',
          marginTop: 18,
          color: navy ? '#fff' : 'var(--ink)',
        }}
      >
        {title}
      </h2>
      {lead ? (
        <div
          className="lead"
          style={{
            marginTop: 18,
            maxWidth,
            marginInline: centred ? 'auto' : undefined,
            color: navy ? 'var(--ink-on-navy-2)' : 'var(--ink-body)',
          }}
        >
          {lead}
        </div>
      ) : null}
      {children ? <div style={{ marginTop: 26 }}>{children}</div> : null}
    </Reveal>
  );
}
