import Link from 'next/link';

/**
 * The band every business-development page opens with.
 *
 * It carries the page's only <h1> — the sections below it all open at <h2>,
 * so each page keeps one heading outline rather than competing ones. The
 * breadcrumb is a real nav landmark, which is what lets someone who arrived
 * from a search result work out where they are.
 */
export function PageBanner({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section
      style={{
        background: 'var(--navy-darkest)',
        color: 'var(--ink-on-navy)',
        padding: 'clamp(34px,5vw,64px) 0 clamp(30px,4vw,54px)',
        borderBottom: '1px solid rgba(239,207,145,.22)',
      }}
    >
      <div className="wrap">
        <nav aria-label="Breadcrumb">
          <ol
            style={{
              listStyle: 'none',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              margin: 0,
              padding: 0,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint-navy)',
            }}
          >
            <li>
              <Link href="/" style={{ color: 'var(--ink-faint-navy)' }}>
                Walker Good Homes
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{eyebrow}</li>
          </ol>
        </nav>

        <span className="rule-gold" aria-hidden="true" style={{ marginTop: 20, transform: 'scaleX(1)' }} />
        <h1
          className="hd"
          style={{ fontSize: 'clamp(38px,6vw,78px)', marginTop: 18, color: '#fff', maxWidth: 900 }}
        >
          {title}
        </h1>
        <p className="lead" style={{ marginTop: 16, maxWidth: 640, color: 'var(--ink-on-navy-2)' }}>
          {lead}
        </p>
      </div>
    </section>
  );
}
