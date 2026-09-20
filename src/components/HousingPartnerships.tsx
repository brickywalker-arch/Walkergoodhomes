'use client';

import { HOUSING_CARDS } from '@/data/partners';
import { Reveal } from './ui/Reveal';
import { SectionHead } from './ui/SectionHead';
import { EnquiryButton } from './ui/EnquiryButton';
import { CornerMarks } from './CornerMarks';

/**
 * Housing partnerships — councils, housing associations, registered providers.
 *
 * Navy, because this is the section a local authority officer lands on and it
 * should feel like the serious end of the site. The copy is an invitation
 * throughout: "wants to work with", "is interested in", "would welcome". There
 * is no council contract to claim and the section does not imply one.
 */
export function HousingPartnerships({ id = 'housing-partnerships' }: { id?: string }) {
  return (
    <section className="sec" id={id} style={{ background: 'var(--navy)', color: 'var(--ink-on-navy)' }}>
      <div className="wrap">
        <SectionHead
          tone="navy"
          eyebrow="Housing partnerships"
          title="Building homes for our communities."
          lead={
            <>
              <p style={{ margin: 0 }}>
                Walker Good Homes wants to work with local authorities and housing providers to help deliver
                well-designed, high-quality homes across Yorkshire.
              </p>
              <p style={{ margin: '14px 0 0' }}>
                We are interested in developing long-term relationships with councils, housing associations and
                registered providers.
              </p>
              <p style={{ margin: '14px 0 0' }}>
                Whether an organisation has land requiring development, an identified housing requirement or is
                searching for a local development partner, we would welcome a conversation.
              </p>
            </>
          }
          maxWidth={680}
        />

        <div className="grid-auto" style={{ marginTop: 'clamp(34px,5vw,58px)' }}>
          {HOUSING_CARDS.map((c, i) => (
            <Reveal key={c.num} delay={i * 90} className="card card-navy plate" style={{ minHeight: 220 }}>
              <span
                className="hd"
                style={{ fontSize: 34, color: 'rgba(239,207,145,.5)', lineHeight: 1 }}
                aria-hidden="true"
              >
                {c.num}
              </span>
              <h3
                className="hd"
                style={{ fontSize: 'clamp(19px,1.9vw,24px)', marginTop: 16, color: 'var(--gold-light)', lineHeight: 1.12 }}
              >
                {c.title}
              </h3>
              <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-on-navy-2)' }}>
                {c.body}
              </p>
              <CornerMarks tone="gold" />
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={120}
          style={{
            marginTop: 'clamp(30px,4vw,48px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 20,
            borderTop: '1px solid rgba(239,207,145,.22)',
            paddingTop: 'clamp(24px,3vw,34px)',
          }}
        >
          <EnquiryButton kind="housing" label="Discuss a housing opportunity" />
          <p style={{ margin: 0, maxWidth: 440, fontSize: 13, lineHeight: 1.7, color: 'var(--ink-faint-navy)' }}>
            Walker Good Homes was established in 2024 and is currently building at Hoyle Ing, Linthwaite. We have no
            existing framework or council contract — this is an invitation to talk, not a claim to hold one.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
