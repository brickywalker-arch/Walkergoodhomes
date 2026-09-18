import Link from 'next/link';
import { DEVELOPMENT } from '@/data/development';

export function Footer() {
  return (
    <footer style={{ background: 'var(--navy-darkest)', padding: 'clamp(40px,5vw,64px) 0 26px' }}>
      <div className="wrap">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
            gap: 'clamp(24px,4vw,48px)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-barlow-condensed), sans-serif',
                fontSize: 21,
                letterSpacing: '.15em',
                color: 'var(--gold-light)',
              }}
            >
              WALKER GOOD HOMES
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.8, color: 'var(--ink-on-navy-2)' }}>
              {DEVELOPMENT.tagline}
              <br />
              Established {DEVELOPMENT.established}.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: '.16em', color: 'var(--ink-faint-navy-2)' }}>
              DEVELOPMENT
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.8, color: 'var(--ink-on-navy-2)' }}>
              {DEVELOPMENT.addressLines[0]}
              <br />
              {DEVELOPMENT.addressLines[1]}
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: '.16em', color: 'var(--ink-faint-navy-2)' }}>
              ENQUIRIES
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.8, color: 'var(--ink-on-navy-2)' }}>
              <a href={`mailto:${DEVELOPMENT.email}`} style={{ color: 'var(--ink-on-navy-2)' }}>
                {DEVELOPMENT.email}
              </a>
            </p>
            <Link href="/#enquire" className="btn-o" style={{ marginTop: 14, minHeight: 42 }}>
              Register interest
            </Link>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,.18)',
            marginTop: 34,
            paddingTop: 18,
            fontSize: 11,
            lineHeight: 1.7,
            color: '#9faeb7',
          }}
        >
          Computer-generated images and interior visuals are illustrative. Room locations and dimensions follow the
          architect&rsquo;s issued drawings; finishes may be subject to change. &copy; 2026 {DEVELOPMENT.company}.
        </div>
      </div>
    </footer>
  );
}
