'use client';

import { PARTNERSHIP_STAGES } from '@/data/partners';
import { Reveal } from './ui/Reveal';
import { SectionHead } from './ui/SectionHead';
import { EnquiryButton } from './ui/EnquiryButton';

/**
 * Development partnerships — investors, landowners, people with capital but
 * no construction operation behind them.
 *
 * The three-stage sequence is the whole argument: what a partner brings, what
 * Walker Good Homes brings, what the two make together. It reveals stage by
 * stage as it scrolls, and stacks to a single column on a phone with the
 * arrows rotating to point down the page.
 *
 * Financial promises are deliberately absent. No returns, no percentages, no
 * projections — this section starts conversations, and anything resembling a
 * regulated investment offer has no business on a housebuilder's website.
 */
export function DevelopmentPartnerships({ id = 'development-partnerships' }: { id?: string }) {
  return (
    <section className="sec" id={id} style={{ background: 'var(--paper-warm)' }}>
      <div className="wrap">
        <SectionHead
          eyebrow="Development partnerships"
          title={
            <>
              You bring the opportunity.
              <br />
              We build the homes.
            </>
          }
          lead={
            <>
              <p
                className="hd"
                style={{ margin: 0, fontSize: 'clamp(17px,1.8vw,22px)', letterSpacing: '.04em', color: 'var(--navy-mid)' }}
              >
                HAVE THE CAPITAL. NEED THE DEVELOPMENT TEAM?
              </p>
              <p style={{ margin: '18px 0 0' }}>Property development requires considerably more than funding.</p>
              <p style={{ margin: '14px 0 0' }}>
                Walker Good Homes is interested in speaking with private investors, landowners and development partners
                who want to participate in residential development but may not have the construction knowledge, supply
                chain or operational resources to deliver homes themselves.
              </p>
            </>
          }
          maxWidth={660}
        />

        <div
          style={{
            marginTop: 'clamp(36px,5vw,64px)',
            display: 'grid',
            gap: 'clamp(12px,2vw,20px)',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,270px),1fr))',
            alignItems: 'stretch',
          }}
        >
          {PARTNERSHIP_STAGES.map((stage, i) => {
            const together = stage.tone === 'together';
            const wgh = stage.tone === 'wgh';
            return (
              <Reveal
                key={stage.label}
                delay={i * 140}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 'clamp(22px,2.8vw,32px)',
                  background: together ? 'var(--navy)' : wgh ? 'var(--white)' : 'transparent',
                  border: `1px solid ${together ? 'var(--navy)' : wgh ? 'var(--gold)' : 'var(--rule)'}`,
                  minHeight: 260,
                }}
              >
                <div
                  className="eyebrow"
                  style={{ color: together ? 'var(--gold-light)' : wgh ? 'var(--gold-deep)' : 'var(--ink-muted)' }}
                >
                  {stage.label}
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    margin: '20px 0 0',
                    padding: 0,
                    display: 'grid',
                    gap: together ? 0 : 11,
                    flex: 1,
                    alignContent: together ? 'center' : 'start',
                  }}
                >
                  {stage.items.map((item, j) => (
                    <li
                      key={item}
                      className={together ? 'hd' : undefined}
                      style={
                        together
                          ? { fontSize: 'clamp(32px,4.4vw,52px)', color: '#fff', lineHeight: 1 }
                          : {
                              display: 'flex',
                              gap: 11,
                              fontSize: 15,
                              lineHeight: 1.55,
                              color: 'var(--ink)',
                              // Each line arrives just after the card it is in.
                              transitionDelay: `${j * 45}ms`,
                            }
                      }
                    >
                      {!together && (
                        <span aria-hidden="true" style={{ color: 'var(--gold-deep)', fontWeight: 700 }}>
                          &mdash;
                        </span>
                      )}
                      {item}
                    </li>
                  ))}
                </ul>

                {/*
                  The connector. Absolute so it sits between the cards on a wide
                  grid; at one column the grid stacks and it reads as a step
                  down the page instead. Decorative, so it is hidden from
                  assistive technology — the headings already carry the order.
                */}
                {i < PARTNERSHIP_STAGES.length - 1 ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: 'clamp(-14px,-1.4vw,-10px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 28,
                      height: 28,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--paper-warm)',
                      color: 'var(--gold-deep)',
                      fontSize: 18,
                      zIndex: 1,
                    }}
                  >
                    &rarr;
                  </span>
                ) : null}
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120} style={{ marginTop: 'clamp(30px,4vw,48px)' }}>
          <EnquiryButton kind="development" label="Discuss a development partnership" />
          <p style={{ margin: '18px 0 0', maxWidth: 620, fontSize: 13, lineHeight: 1.7, color: 'var(--ink-muted)' }}>
            Walker Good Homes does not offer investments and nothing on this page is an offer, a projection or a
            promise of return. This is an invitation to discuss working together on a development.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
