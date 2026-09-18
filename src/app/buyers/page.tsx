import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CornerMarks } from '@/components/CornerMarks';
import { DEVELOPMENT } from '@/data/development';
import { BUILD_STAGES, PLOT_RECORDS } from '@/data/buyers';
import { SESSION_COOKIE, portalConfigured, readToken } from '@/lib/session';
import { photoImage } from '@/lib/cgi';

export const metadata: Metadata = {
  title: 'Reserved buyers',
  description: 'Build progress, documents and stage payments for reserved buyers at Hoyle Ing.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function Buyers({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const jar = await cookies();
  const session = readToken(jar.get(SESSION_COOKIE)?.value);
  const configured = portalConfigured();

  return (
    <>
      <Header />
      <main id="top" style={{ background: 'var(--navy-mid)', minHeight: '60vh' }}>
        {session ? <Portal plot={session.plot} /> : <SignIn configured={configured} failed={params.error === '1'} />}
      </main>
      <Footer />
    </>
  );
}

function SignIn({ configured, failed }: { configured: boolean; failed: boolean }) {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>
          Reserved buyers
        </div>
        <h1 className="hd" style={{ fontSize: 'clamp(32px,4.6vw,56px)', color: '#fff', margin: '12px 0 14px' }}>
          Sign in to follow your build.
        </h1>
        <p className="lead" style={{ color: 'var(--ink-on-navy-2)' }}>
          Use the access code on your reservation agreement. If you haven&rsquo;t got it to hand, email{' '}
          <a href={`mailto:${DEVELOPMENT.email}`} style={{ color: 'var(--gold-light)' }}>
            {DEVELOPMENT.email}
          </a>{' '}
          and we&rsquo;ll send it over.
        </p>

        <div
          className="plate"
          style={{
            marginTop: 28,
            background: 'var(--paper-warm)',
            border: '1px solid var(--rule)',
            padding: 'clamp(22px,3vw,34px)',
          }}
        >
          {configured ? (
            <form action="/api/buyers/signin" method="post" style={{ display: 'grid', gap: 16 }}>
              <div>
                <span className="field-label">Your plot</span>
                <div style={{ display: 'flex', gap: 9, marginTop: 8 }}>
                  {[1, 2].map((p) => (
                    <label
                      key={p}
                      style={{
                        flex: '1 1 0',
                        minHeight: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        border: '1px solid var(--input-border)',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <input type="radio" name="plot" value={p} defaultChecked={p === 1} style={{ accentColor: '#06223a' }} />
                      Plot {p}
                    </label>
                  ))}
                </div>
              </div>
              <label style={{ display: 'block' }}>
                <span className="field-label">Access code</span>
                <input
                  className="input"
                  name="code"
                  type="password"
                  required
                  autoComplete="one-time-code"
                  placeholder="From your reservation agreement"
                />
              </label>
              {failed && (
                <div
                  role="alert"
                  style={{
                    border: '1px solid var(--error-border)',
                    background: 'var(--error-bg)',
                    padding: '12px 14px',
                    fontSize: 13.5,
                    color: 'var(--error-ink)',
                  }}
                >
                  That code didn&rsquo;t match. Please check it and try again.
                </div>
              )}
              <button type="submit" className="btn-g" style={{ minHeight: 54 }}>
                Sign in
              </button>
            </form>
          ) : (
            <div>
              <h2 className="hd" style={{ fontSize: 'clamp(22px,2.4vw,28px)', marginBottom: 10 }}>
                Not switched on yet.
              </h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-body)' }}>
                The buyer area needs <code>BUYER_ACCESS_CODE</code> and <code>BUYER_SESSION_SECRET</code> set on the
                server before it will let anyone in. Until they are set it stays closed rather than open — see{' '}
                <code>.env.example</code>.
              </p>
            </div>
          )}
          <CornerMarks />
        </div>
      </div>
    </section>
  );
}

function Portal({ plot }: { plot: number }) {
  const record = PLOT_RECORDS.find((r) => r.plot === plot) ?? PLOT_RECORDS[0];
  const hero = photoImage(plot === 2 ? 'plot-2' : 'plot-1');

  return (
    <section className="sec">
      <div className="wrap">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              Plot {record.plot} ·{' '}
              {record.status === 'reserved' ? `Reserved ${record.reservedOn}` : 'Available'}
            </div>
            <h1 className="hd" style={{ fontSize: 'clamp(30px,4.2vw,52px)', color: '#fff', marginTop: 12 }}>
              {record.headline}
            </h1>
          </div>
          <form action="/api/buyers/signout" method="post">
            <button type="submit" className="btn-o" style={{ minHeight: 42 }}>
              Sign out
            </button>
          </form>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))',
            gap: 'clamp(18px,3vw,30px)',
            marginTop: 'clamp(26px,3.5vw,40px)',
            alignItems: 'start',
          }}
        >
          <div>
            <div style={{ position: 'relative', aspectRatio: '3 / 2', overflow: 'hidden', border: '1px solid rgba(239,207,145,.35)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.src}
                srcSet={hero.srcSet}
                sizes="(max-width: 800px) 100vw, 580px"
                alt={`Plot ${record.plot} — computer-generated image`}
                decoding="async"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div
              className="plate"
              style={{ marginTop: 20, border: '1px solid rgba(239,207,145,.35)', padding: 22 }}
            >
              <div
                style={{ marginTop: 4, height: 6, background: 'rgba(255,255,255,.16)' }}
                role="progressbar"
                aria-valuenow={record.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Build progress, plot ${record.plot}`}
              >
                <div style={{ height: 6, width: `${record.percent}%`, background: 'var(--gold)' }} />
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
                <span>{record.percent}% COMPLETE</span>
                <span>
                  STAGE {record.stage + 1} OF {BUILD_STAGES.length} · TARGET {record.target.toUpperCase()}
                </span>
              </div>
              <CornerMarks tone="gold" />
            </div>

            <Panel title="Stage payments">
              {record.payments.length === 0 ? (
                <Empty>No payment schedule yet — this plot is still available.</Empty>
              ) : (
                <div style={{ borderTop: '1px solid var(--rule-strong)' }}>
                  {record.payments.map((p) => (
                    <div
                      key={p.stage}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1fr) auto auto',
                        gap: 14,
                        alignItems: 'center',
                        borderBottom: '1px solid var(--rule)',
                        padding: '14px 2px',
                        minHeight: 56,
                      }}
                    >
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: 20 }}>
                          {p.stage}
                        </span>
                        <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-muted)' }}>{p.due}</span>
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{p.amount}</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 9,
                          letterSpacing: '.12em',
                          padding: '5px 9px',
                          whiteSpace: 'nowrap',
                          background: p.status === 'Paid' ? '#06223a' : p.status === 'Due' ? 'var(--gold)' : 'transparent',
                          color: p.status === 'Paid' ? 'var(--gold-light)' : p.status === 'Due' ? '#06223a' : 'var(--ink-muted)',
                          border: p.status === 'Scheduled' ? '1px solid var(--rule)' : 'none',
                        }}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div>
            <Panel title={`Build timeline · Plot ${record.plot}`}>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {BUILD_STAGES.map((s, i) => {
                  const done = i < record.stage;
                  const current = i === record.stage;
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
                            border: `1px solid ${i <= record.stage ? 'var(--gold)' : '#b3bec6'}`,
                            marginTop: 5,
                          }}
                        />
                        {i < BUILD_STAGES.length - 1 && <span style={{ flex: 1, width: 1, background: 'var(--rule)' }} />}
                      </div>
                      <div style={{ paddingBottom: 18 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-barlow-condensed), sans-serif',
                            fontSize: 20,
                            color: i <= record.stage ? 'var(--ink)' : 'var(--ink-muted-2)',
                          }}
                        >
                          {s.stage}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-muted-2)' }}>{s.when}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Panel>

            <Panel title="Documents">
              {record.documents.length === 0 ? (
                <Empty>Documents appear here once the plot is reserved.</Empty>
              ) : (
                <div style={{ borderTop: '1px solid var(--rule-strong)' }}>
                  {record.documents.map((d) => {
                    const live = d.href !== '#';
                    return (
                      <div
                        key={d.title}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0,1fr) auto',
                          gap: 14,
                          alignItems: 'center',
                          borderBottom: '1px solid var(--rule)',
                          padding: '12px 2px',
                          minHeight: 54,
                        }}
                      >
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: 20 }}>
                            {d.title}
                          </span>
                          <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-muted)' }}>{d.meta}</span>
                        </span>
                        {live ? (
                          <a
                            href={d.href}
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
                        ) : (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 9,
                              letterSpacing: '.12em',
                              color: 'var(--ink-muted)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ON REQUEST
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel title="Progress photos">
              <Empty>
                {record.newPhotos} new photos this week. Site photography is shared by email until the photo library
                is wired up — reply to any update and {DEVELOPMENT.contactName} will send the latest set.
              </Empty>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--paper-warm)', padding: 'clamp(20px,2.6vw,30px)', marginTop: 20 }}>
      <div className="eyebrow" style={{ color: 'var(--gold-deep)', marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-body)' }}>{children}</p>;
}
